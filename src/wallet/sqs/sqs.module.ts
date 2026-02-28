import { Module, Global } from '@nestjs/common';
import { SqsService } from './sqs.service';
import { SqsWorker } from './sqs.worker';

@Global()
export class SqsModule {
  static forRoot() {
    return {
      module: SqsModule,
      providers: [SqsService, SqsWorker],
      exports: [SqsService],
    };
  }
}
