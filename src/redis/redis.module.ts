import { Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // disponível em toda a aplicação sem precisar importar
export class RedisModule {
  static forRoot() {
    return {
      module: RedisModule,
      providers: [RedisService],
      exports: [RedisService],
    };
  }
}
