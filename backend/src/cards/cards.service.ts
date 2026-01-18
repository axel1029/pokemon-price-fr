import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type FindPagedArgs = {
  page: number;
  pageSize: number;
  search?: string;
};

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  findOne(id: number) {
    return this.prisma.card.findUnique({
      where: { id },
      include: { set: true },
    });
  }

  async findPaged({ page, pageSize, search }: FindPagedArgs) {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize =
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 20;

    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [total, cards] = await Promise.all([
      this.prisma.card.count({ where }),
      this.prisma.card.findMany({
        where,
        include: { set: true },
        orderBy: { name: 'asc' },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
    ]);

    const cardIds = cards.map((c) => c.id);

    // ✅ Prix: uniquement EUR + CARDMARKET + trend (cohérent pour "latest")
    const priceRows = cardIds.length
      ? await this.prisma.price.findMany({
          where: {
            cardId: { in: cardIds },
            currency: 'EUR',
            source: 'CARDMARKET',
            kind: 'trend',
          },
          select: { cardId: true, price: true, createdAt: true },
          orderBy: [{ cardId: 'asc' }, { createdAt: 'desc' }],
        })
      : [];

    // Group by cardId
    const byCard = new Map<number, { latest: number; min: number; max: number; sum: number; count: number }>();

    for (const row of priceRows) {
      const existing = byCard.get(row.cardId);

      if (!existing) {
        // first row for this cardId is latest because we ordered desc on createdAt
        byCard.set(row.cardId, {
          latest: row.price,
          min: row.price,
          max: row.price,
          sum: row.price,
          count: 1,
        });
      } else {
        existing.min = Math.min(existing.min, row.price);
        existing.max = Math.max(existing.max, row.price);
        existing.sum += row.price;
        existing.count += 1;
      }
    }

    const items = cards.map((card) => {
    const stats = byCard.get(card.id);

      return {
        ...card,
        latestPrice: stats ? stats.latest : null,
        minPrice: stats ? stats.min : null,
        maxPrice: stats ? stats.max : null,
        avgPrice: stats ? stats.sum / stats.count : null,
      };
    });

    return {
      meta: {
        page: safePage,
        pageSize: safePageSize,
        total,
        totalPages: Math.ceil(total / safePageSize),
        search: search ?? null,
        imageUrl: true,
      },
      items,
    };
  }
}
