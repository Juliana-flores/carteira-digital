import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { DepositDto } from './dto/deposit.dto';
import {
  Transaction as TransactionEntity,
  TransactionType,
} from './entities/transaction.entity';
import { TransferDto } from './dto/transfer.dto';
import { RedisService } from 'src/redis/redis.service';
import { SqsService } from './sqs/sqs.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,

    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private dataSource: DataSource,
    private redisService: RedisService,
    private sqsService: SqsService,
  ) {}

  async getBalance(userId: string) {
    const cacheKey = `balance:${userId}`;

    // Tenta buscar do cache primeiro
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`⚡ Saldo retornado do cache para usuário ${userId}`);
      return { balance: Number(cached), fromCache: true };
    }

    // Se não tem cache, busca no banco
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) throw new NotFoundException('Carteira não encontrada');

    // Salva no cache por 30 segundos
    await this.redisService.set(cacheKey, String(wallet.balance), 30);
    console.log(`💾 Saldo salvo no cache para usuário ${userId}`);

    return { balance: Number(wallet.balance), fromCache: false };
  }

  async deposit(userId: string, depositDto: DepositDto) {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) throw new NotFoundException('Carteira não encontrada');

    await this.dataSource.transaction(async (manager) => {
      wallet.balance = Number(wallet.balance) + Number(depositDto.amount);
      await manager.save(wallet);

      const transaction = this.transactionRepository.create({
        amount: depositDto.amount,
        type: TransactionType.DEPOSIT,
        sender: { id: userId },
      });

      await manager.save(transaction);
    });

    // Invalida o cache — força busca atualizada na próxima consulta
    await this.redisService.del(`balance:${userId}`);

    return {
      message: 'Depósito realizado com sucesso',
      newBalance: Number(wallet.balance),
    };
  }

  async transfer(senderId: string, transferDto: TransferDto) {
    if (senderId === transferDto.receiverId) {
      throw new BadRequestException('Não é possível transferir para si mesmo');
    }

    // Rate limiting — máximo 5 transferências por minuto
    const rateLimitKey = `transfer_limit:${senderId}`;
    const attempts = await this.redisService.increment(rateLimitKey);

    if (attempts === 1) {
      // Primeira tentativa — define expiração de 60 segundos
      await this.redisService.expire(rateLimitKey, 60);
    }

    if (attempts > 5) {
      throw new BadRequestException(
        'Limite de transferências atingido. Tente novamente em 1 minuto.',
      );
    }

    const senderWallet = await this.walletRepository.findOne({
      where: { user: { id: senderId } },
    });

    const receiverWallet = await this.walletRepository.findOne({
      where: { user: { id: transferDto.receiverId } },
    });

    if (!senderWallet)
      throw new NotFoundException('Carteira do remetente não encontrada');
    if (!receiverWallet)
      throw new NotFoundException('Carteira do destinatário não encontrada');

    if (Number(senderWallet.balance) < Number(transferDto.amount)) {
      throw new BadRequestException('Saldo insuficiente');
    }

    // Publica na fila SQS antes de processar
    await this.sqsService.sendMessage({
      senderId,
      receiverId: transferDto.receiverId,
      amount: transferDto.amount,
      timestamp: new Date().toISOString(),
    });

    await this.dataSource.transaction(async (manager) => {
      senderWallet.balance =
        Number(senderWallet.balance) - Number(transferDto.amount);
      receiverWallet.balance =
        Number(receiverWallet.balance) + Number(transferDto.amount);

      await manager.save(senderWallet);
      await manager.save(receiverWallet);

      const transaction = this.transactionRepository.create({
        amount: transferDto.amount,
        type: TransactionType.TRANSFER,
        sender: { id: senderId },
        receiver: { id: transferDto.receiverId },
      });

      await manager.save(transaction);
    });

    // Invalida cache de ambos os usuários
    await this.redisService.del(`balance:${senderId}`);
    await this.redisService.del(`balance:${transferDto.receiverId}`);

    return {
      message: 'Transferência realizada com sucesso',
      newBalance: Number(senderWallet.balance),
    };
  }

  async getHistory(userId: string) {
    const transactions = await this.transactionRepository.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });

    return transactions.map((t: TransactionEntity) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      sender: t.sender ? { id: t.sender.id, name: t.sender.name } : null,
      receiver: t.receiver
        ? { id: t.receiver.id, name: t.receiver.name }
        : null,
      createdAt: t.createdAt,
    }));
  }
}
