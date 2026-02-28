import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { SqsModule } from './wallet/sqs/sqs.module';

@Module({
  imports: [
    // Carrega as variáveis do .env em toda a aplicação
    ConfigModule.forRoot({ isGlobal: true }),

    // Conecta ao PostgreSQL usando as variáveis do .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // cria as tabelas automaticamente em desenvolvimento
      }),
    }),
    RedisModule.forRoot(),
    SqsModule.forRoot(),
    AuthModule,
    UsersModule,
    WalletModule,
  ],
})
export class AppModule {}
