import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';

@Injectable()
export class SqsService implements OnModuleInit {
  private client: SQSClient;
  private queueUrl: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = new SQSClient({
      region: this.configService.get('AWS_REGION'),
      endpoint: this.configService.get('AWS_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.queueUrl = this.configService.get('SQS_QUEUE_URL');
    console.log('✅ SQS conectado');
  }

  // Publica uma mensagem na fila
  async sendMessage(body: object): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(body),
    });

    await this.client.send(command);
    console.log('📨 Mensagem enviada para a fila:', body);
  }

  // Lê mensagens da fila
  async receiveMessages() {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 5, // long polling — espera até 5s por mensagens
    });

    const response = await this.client.send(command);
    return response.Messages || [];
  }

  // Remove mensagem da fila após processar
  async deleteMessage(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    await this.client.send(command);
  }
}
