import { Controller, Get } from '@nestjs/common';
import { SetsService } from './sets.service';

@Controller('pokemon/sets')
export class SetsController {
  constructor(private readonly setsService: SetsService) {}

  @Get()
  findAll() {
    return this.setsService.findAll();
  }
}
