import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { TcgdexModule } from 'src/tcgdex/tcgdex.module';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';

@Module({
  imports: [PrismaModule, TcgdexModule, ScheduleModule.forRoot()],
  providers: [SyncService],
  controllers: [SyncController],
})
export class SyncModule {}
