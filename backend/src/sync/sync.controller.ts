import { Controller, Post, Query } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('admin/sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post('import')
  importAll(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : undefined;
    return this.sync.importAllFrCardsAndPrices(Number.isFinite(n as number) ? (n as number) : undefined);
  }

  @Post('refresh-images')
  refreshImages(@Query('limit') limit?: string) {
    return this.sync.refreshMissingImages(limit ? Number(limit) : 500);
  }
}
