import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { TransferDto } from './dto/transfer.dto';
import { DepositDto } from './dto/deposit.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard) // todos os endpoints precisam de token JWT
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  getBalance(@Req() req) {
    return this.walletService.getBalance(req.user.id);
  }

  @Post('deposit')
  deposit(@Req() req, @Body() depositDto: DepositDto) {
    return this.walletService.deposit(req.user.id, depositDto);
  }

  @Post('transfer')
  transfer(@Req() req, @Body() transferDto: TransferDto) {
    return this.walletService.transfer(req.user.id, transferDto);
  }

  @Get('history')
  getHistory(@Req() req) {
    return this.walletService.getHistory(req.user.id);
  }
}
