import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TcgdexService {
  private readonly baseUrl = 'https://api.tcgdex.net/v2/fr';

  constructor(private readonly http: HttpService) {}

  async getSets(): Promise<Array<{ id: string; name: string }>> {
    const { data } = await firstValueFrom(this.http.get(`${this.baseUrl}/sets`));
    return data;
  }

  async getSet(setId: string): Promise<any> {
    const { data } = await firstValueFrom(this.http.get(`${this.baseUrl}/sets/${setId}`));
    return data;
  }

  async getCard(cardId: string): Promise<any> {
    const { data } = await firstValueFrom(this.http.get(`${this.baseUrl}/cards/${cardId}`));
    return data;
  }
}
