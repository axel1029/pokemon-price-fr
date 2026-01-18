import { Controller, Get, Query, Param } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('search') search?: string,
  ) {
    return this.cardsService.findPaged({
      page: Number(page),
      pageSize: Number(pageSize),
      search,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string
  ) {
    return this.cardsService.findOne(Number(id));
  }
}
