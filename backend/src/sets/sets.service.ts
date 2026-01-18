import { Injectable } from '@nestjs/common';

@Injectable()
export class SetsService {
  findAll() {
    return [
      {
        id: 1,
        name: 'Set de Base',
        code: 'BASE',
        releaseYear: 1999,
        language: 'FR',
      },
      {
        id: 2,
        name: 'Jungle',
        code: 'JUNGLE',
        releaseYear: 2000,
        language: 'FR',
      },
    ];
  }
}
