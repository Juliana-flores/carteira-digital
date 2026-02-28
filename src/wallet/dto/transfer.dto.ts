import { IsNumber, IsUUID, Min } from 'class-validator';

export class TransferDto {
  @IsUUID()
  receiverId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
