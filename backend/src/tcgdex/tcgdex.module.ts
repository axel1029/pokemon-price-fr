import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TcgdexService } from './tcgdex.service';

@Module({
  imports: [HttpModule],
  providers: [TcgdexService],
  exports: [TcgdexService],
})
export class TcgdexModule {}
