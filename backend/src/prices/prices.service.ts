import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricesService {
  constructor(private readonly prisma: PrismaService) {}

  // 📈 Historique des prix (pour graphique)
  findHistoryByCard(cardId: number) {
    return this.prisma.price.findMany({
      where: {
        cardId,
        source: 'CARDMARKET',
        currency: 'EUR',
        kind: 'trend',
      },
      orderBy: { createdAt: 'asc' },
      select: { price: true, createdAt: true, source: true, kind: true },
    });
  }

  // 📊 Statistiques globales
  findStatsByCard(cardId: number) {
    return this.prisma.price.aggregate({
      where: { cardId },
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true },
    });
  }

  // ⏱️ Dernier prix connu
  findLatestByCard(cardId: number) {
    return this.prisma.price.findFirst({
      where: {
        cardId,
        source: 'CARDMARKET',
        currency: 'EUR',
        kind: 'trend',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

}
