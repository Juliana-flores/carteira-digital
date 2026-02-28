import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { Transaction as TransactionEntity } from './entities/transaction.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SqsService } from './sqs/sqs.service';

// Mocks — objetos falsos que simulam o comportamento real
const mockWalletRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const mockTransactionRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
};

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  increment: jest.fn(),
  expire: jest.fn(),
};

const mockSqsService = {
  sendMessage: jest.fn(),
};

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useValue: mockWalletRepository },
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: mockTransactionRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: RedisService, useValue: mockRedisService },
        { provide: SqsService, useValue: mockSqsService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);

    // Limpa os mocks antes de cada teste
    jest.clearAllMocks();
  });

  // ============================================
  // TESTES DE SALDO
  // ============================================
  describe('getBalance', () => {
    it('deve retornar saldo do cache quando disponível', async () => {
      mockRedisService.get.mockResolvedValue('150.00');

      const result = await service.getBalance('user-1');

      expect(result).toEqual({ balance: 150, fromCache: true });
      // Garante que NÃO foi ao banco
      expect(mockWalletRepository.findOne).not.toHaveBeenCalled();
    });

    it('deve buscar saldo no banco quando não há cache', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockWalletRepository.findOne.mockResolvedValue({ balance: 200 });

      const result = await service.getBalance('user-1');

      expect(result).toEqual({ balance: 200, fromCache: false });
      // Garante que salvou no cache
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'balance:user-1',
        '200',
        30,
      );
    });

    it('deve lançar erro quando carteira não encontrada', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(service.getBalance('user-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============================================
  // TESTES DE DEPÓSITO
  // ============================================
  describe('deposit', () => {
    it('deve realizar depósito com sucesso', async () => {
      const wallet = { balance: 100 };
      mockWalletRepository.findOne.mockResolvedValue(wallet);
      mockDataSource.transaction.mockImplementation(async (cb) => {
        await cb({
          save: jest.fn(),
        });
      });
      mockTransactionRepository.create.mockReturnValue({});

      const result = await service.deposit('user-1', { amount: 50 });

      expect(result.message).toBe('Depósito realizado com sucesso');
      // Garante que invalidou o cache após o depósito
      expect(mockRedisService.del).toHaveBeenCalledWith('balance:user-1');
    });

    it('deve lançar erro quando carteira não encontrada', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(service.deposit('user-1', { amount: 50 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============================================
  // TESTES DE TRANSFERÊNCIA
  // ============================================
  describe('transfer', () => {
    it('deve lançar erro ao transferir para si mesmo', async () => {
      mockRedisService.increment.mockResolvedValue(1);
      mockRedisService.expire.mockResolvedValue(null);

      await expect(
        service.transfer('user-1', { receiverId: 'user-1', amount: 50 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro quando saldo insuficiente', async () => {
      mockRedisService.increment.mockResolvedValue(1);
      mockRedisService.expire.mockResolvedValue(null);

      mockWalletRepository.findOne
        .mockResolvedValueOnce({ balance: 30 }) // remetente com saldo baixo
        .mockResolvedValueOnce({ balance: 100 }); // destinatário

      await expect(
        service.transfer('user-1', { receiverId: 'user-2', amount: 50 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve bloquear após 5 transferências por minuto', async () => {
      mockRedisService.increment.mockResolvedValue(6); // simula 6ª tentativa

      await expect(
        service.transfer('user-1', { receiverId: 'user-2', amount: 10 }),
      ).rejects.toThrow('Limite de transferências atingido');
    });

    it('deve realizar transferência com sucesso', async () => {
      mockRedisService.increment.mockResolvedValue(1);
      mockRedisService.expire.mockResolvedValue(null);

      mockWalletRepository.findOne
        .mockResolvedValueOnce({ balance: 100 }) // remetente
        .mockResolvedValueOnce({ balance: 50 }); // destinatário

      mockDataSource.transaction.mockImplementation(async (cb) => {
        await cb({ save: jest.fn() });
      });
      mockTransactionRepository.create.mockReturnValue({});

      const result = await service.transfer('user-1', {
        receiverId: 'user-2',
        amount: 30,
      });

      expect(result.message).toBe('Transferência realizada com sucesso');
      // Garante que invalidou cache de ambos
      expect(mockRedisService.del).toHaveBeenCalledWith('balance:user-1');
      expect(mockRedisService.del).toHaveBeenCalledWith('balance:user-2');
    });
  });
});
