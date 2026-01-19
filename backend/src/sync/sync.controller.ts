import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { AdminKeyGuard } from '../auth/admin-key.guard';

@Controller('admin/sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}
  
  @UseGuards(AdminKeyGuard)
  @Post('import')
  importAll(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : undefined;
    return this.sync.importAllFrCardsAndPrices(Number.isFinite(n as number) ? (n as number) : undefined);
  }

  @UseGuards(AdminKeyGuard)
  @Post('refresh-images')
  refreshImages(@Query('limit') limit?: string) {
    return this.sync.refreshMissingImages(limit ? Number(limit) : 500);
  }

  @UseGuards(AdminKeyGuard)
  @Post('refresh-prices')
  refreshPrices() {
    return this.sync.refreshPricesNow(); // on crée cette méthode
  }
}
