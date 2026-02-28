import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { SqsService } from './sqs.service';

@Injectable()
export class SqsWorker implements OnModuleInit {
  private readonly logger = new Logger(SqsWorker.name);

  constructor(private sqsService: SqsService) {}

  onModuleInit() {
    // Inicia o worker em background ao subir a aplicação
    this.startWorker();
  }

  private async startWorker() {
    this.logger.log('🔄 Worker SQS iniciado — aguardando mensagens...');

    // Loop infinito — fica escutando a fila eternamente
    while (true) {
      try {
        const messages = await this.sqsService.receiveMessages();

        for (const message of messages) {
          const body = JSON.parse(message.Body);

          this.logger.log(`⚙️ Processando transferência da fila:`);
          this.logger.log(`   De: ${body.senderId}`);
          this.logger.log(`   Para: ${body.receiverId}`);
          this.logger.log(`   Valor: R$${body.amount}`);
          this.logger.log(`   Horário: ${body.timestamp}`);

          // Remove da fila após processar com sucesso
          await this.sqsService.deleteMessage(message.ReceiptHandle);
          this.logger.log(`✅ Mensagem processada e removida da fila`);
        }
      } catch (error) {
        this.logger.error('❌ Erro no worker SQS:', error.message);
        // Aguarda 5 segundos antes de tentar novamente
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }
}
