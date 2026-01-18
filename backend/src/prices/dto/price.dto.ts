export class PriceDto {
  cardId: number;
  source: 'cardmarket';
  condition: 'NM' | 'EX' | 'GD' | 'PL';
  price: number;
  currency: 'EUR';
  date: string;
}
