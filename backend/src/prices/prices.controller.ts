import { Controller, Get, Param } from '@nestjs/common';
import { PricesService } from './prices.service';

@Controller('pokemon/prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get(':cardId/stats')
  async getStats(@Param('cardId') cardId: string) {
    const id = Number(cardId);

    const [stats, latest] = await Promise.all([
      this.pricesService.findStatsByCard(id),
      this.pricesService.findLatestByCard(id),
    ]);

    return {
      min: stats._min.price,
      max: stats._max.price,
      avg: stats._avg.price,
      latest,
    };
  }

  @Get(':cardId/latest')
  findLatest(@Param('cardId') cardId: string) {
    return this.pricesService.findLatestByCard(Number(cardId));
  }

  @Get(':cardId')
  findHistory(@Param('cardId') cardId: string) {
    return this.pricesService.findHistoryByCard(Number(cardId));
  }
}
