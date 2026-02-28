import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verifica se o email já existe
    const exists = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (exists) {
      throw new ConflictException('Email já cadastrado');
    }

    // Criptografa a senha antes de salvar
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Cria o usuário
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    // Cria a carteira zerada para o usuário
    const wallet = this.walletsRepository.create({
      balance: 0,
      user: savedUser,
    });

    await this.walletsRepository.save(wallet);

    return savedUser;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
