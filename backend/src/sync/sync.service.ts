import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { TcgdexService } from '../tcgdex/tcgdex.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tcgdex: TcgdexService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                   UTILS                                    */
  /* -------------------------------------------------------------------------- */

  private getTodayKey(): string {
    // YYYY-MM-DD
    return new Date().toISOString().slice(0, 10);
  }

  private async isValidImageUrl(url: string): Promise<boolean> {
    try {
      const res = await axios.head(url, { timeout: 5000 });
      return String(res.headers['content-type'] ?? '').startsWith('image/');
    } catch {
      return false;
    }
  }

  private async resolveImageUrl(rawUrl: unknown): Promise<string | null> {
    if (typeof rawUrl !== 'string') return null;
    if (!rawUrl.startsWith('http')) return null;

    // déjà une image directe
    if (/\.(png|jpg|jpeg|webp)$/i.test(rawUrl)) return rawUrl;

    // ✅ cas TCGdex assets sans extension → on force high.webp
    if (rawUrl.startsWith('https://assets.tcgdex.net/')) {
      return `${rawUrl}/high.webp`;
    }

    // fallback : tente aussi high.webp
    return `${rawUrl}/high.webp`;
  }

  private async pickImageUrl(card: any): Promise<string | null> {
    if (!card) return null;

    const candidates: unknown[] = [
      // ✅ ton cas actuel
      typeof card.image === 'string' ? card.image : null,

      // autres structures possibles
      card?.image?.high,
      card?.image?.large,
      card?.image?.medium,
      card?.image?.small,

      card?.images?.high,
      card?.images?.large,
      card?.images?.medium,
      card?.images?.small,

      typeof card.images === 'string' ? card.images : null,
    ];

    for (const c of candidates) {
      const resolved = await this.resolveImageUrl(c);
      if (resolved) return resolved;
    }

    return null;
  }


  /* -------------------------------------------------------------------------- */
  /*                              IMAGE MAINTENANCE                             */
  /* -------------------------------------------------------------------------- */

  async refreshMissingImages(limit = 1000) {
    const cards = await this.prisma.card.findMany({
      where: {
        OR: [
          { imageUrl: null },
          { imageUrl: { startsWith: 'https://assets.tcgdex.net/' } },
        ],
      },
      take: limit,
      select: { id: true, externalId: true },
    });

    let updated = 0;

    for (const c of cards) {
      let apiCard: any;

      try {
        apiCard = await this.tcgdex.getCard(c.externalId);
        if (updated === 0) {
          this.logger.log(
            `IMG DEBUG ${c.externalId} image=${JSON.stringify(apiCard.image)} images=${JSON.stringify(apiCard.images)}`,
          );
        }
      } 
      catch (err: any) {
        if (err?.response?.status === 404) {
          this.logger.warn(`TCGdex 404 for card ${c.externalId}`);
          await this.prisma.card.update({
            where: { id: c.id },
            data: { imageUrl: null },
          });
        }
        continue;
      }

      const imageUrl = await this.pickImageUrl(apiCard);
      if (updated === 0) {
        this.logger.log(`IMG PICKED ${c.externalId} => ${imageUrl}`);
      }
      if (!imageUrl) continue;

      await this.prisma.card.update({
        where: { id: c.id },
        data: { imageUrl },
      });

      updated++;
    }

    return { checked: cards.length, updated };
  }

  /* -------------------------------------------------------------------------- */
  /*                           FULL INITIAL IMPORT                               */
  /* -------------------------------------------------------------------------- */

  async importAllFrCardsAndPrices(limitCards?: number) {
    const sets = await this.tcgdex.getSets();
    this.logger.log(`Sets trouvés: ${sets.length}`);

    let importedCards = 0;
    const day = this.getTodayKey();

    for (const s of sets) {
      const setDetail = await this.tcgdex.getSet(s.id);
      const cards = setDetail.cards ?? [];

      const releaseYear = Number(setDetail.releaseDate?.slice(0, 4)) || 0;

      const dbSet = await this.prisma.set.upsert({
        where: { code: setDetail.id },
        update: {
          name: setDetail.name ?? s.name,
          releaseYear,
          language: 'FR',
        },
        create: {
          code: setDetail.id,
          name: setDetail.name ?? s.name,
          releaseYear,
          language: 'FR',
        },
      });

      for (const c of cards) {
        if (limitCards && importedCards >= limitCards) {
          return { importedCards };
        }

        const card = await this.tcgdex.getCard(c.id);
        const imageUrl = await this.pickImageUrl(card);

        const dbCard = await this.prisma.card.upsert({
          where: { externalId: card.id },
          update: {
            name: card.name,
            cardNumber: String(card.localId ?? card.number ?? ''),
            rarity: card.rarity ?? null,
            imageUrl,
            setId: dbSet.id,
          },
          create: {
            externalId: card.id,
            name: card.name,
            cardNumber: String(card.localId ?? card.number ?? ''),
            rarity: card.rarity ?? null,
            imageUrl,
            setId: dbSet.id,
          },
        });

        const cm = card?.pricing?.cardmarket;
        if (cm?.unit === 'EUR') {
          const rows = [
            { kind: 'trend', value: cm.trend },
            { kind: 'avg7', value: cm.avg7 },
            { kind: 'avg30', value: cm.avg30 },
            { kind: 'low', value: cm.low },
          ]
            .filter((e) => typeof e.value === 'number')
            .map((e) => ({
              price: e.value!,
              currency: 'EUR',
              source: 'CARDMARKET',
              kind: e.kind,
              day,
              cardId: dbCard.id,
            }));

          if (rows.length) {
            await this.prisma.price.createMany({
              data: rows,
              skipDuplicates: true,
            });
          }
        }

        importedCards++;
        if (importedCards % 500 === 0) {
          this.logger.log(`Cartes importées: ${importedCards}`);
        }
      }
    }

    return { importedCards };
  }

  /* -------------------------------------------------------------------------- */
  /*                              DAILY PRICE UPDATE                             */
  /* -------------------------------------------------------------------------- */

  @Cron('0 3 * * *')
  async dailyPricesRefresh() {
    const day = this.getTodayKey();
    this.logger.log(`Daily price refresh (${day})`);

    const cards = await this.prisma.card.findMany({
      select: { id: true, externalId: true },
    });

    let inserted = 0;

    for (const c of cards) {
      let apiCard: any;

      try {
        apiCard = await this.tcgdex.getCard(c.externalId);
      } catch {
        continue;
      }

      const cm = apiCard?.pricing?.cardmarket;
      if (cm?.unit !== 'EUR') continue;

      const entries = [
        { kind: 'trend', value: cm.trend },
        { kind: 'avg7', value: cm.avg7 },
        { kind: 'avg30', value: cm.avg30 },
        { kind: 'low', value: cm.low },
      ];

      for (const e of entries) {
        if (typeof e.value !== 'number') continue;

        try {
          await this.prisma.price.create({
            data: {
              price: e.value,
              currency: 'EUR',
              source: 'CARDMARKET',
              kind: e.kind,
              day,
              cardId: c.id,
            },
          });
          inserted++;
        } catch (err: any) {
          if (err?.code !== 'P2002') {
            this.logger.warn(`Price error cardId=${c.id}`);
          }
        }
      }
    }

    this.logger.log(`Daily refresh done (${inserted} prices)`);
  }
}
