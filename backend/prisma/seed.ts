import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ✅ Crée un set
  const set = await prisma.set.create({
    data: {
      code: 'base',
      name: 'Set de Base',
      releaseYear: 1999,
      language: 'FR',
    },
  });

  // ✅ Crée 2 cartes (externalId obligatoire)
  await prisma.card.createMany({
    data: [
      {
        externalId: 'legacy-base-pikachu-15-102',
        name: 'Pikachu',
        rarity: 'Common',
        cardNumber: '15/102',
        imageUrl: null,
        setId: set.id,
      },
      {
        externalId: 'legacy-base-bulbizarre-52-102',
        name: 'Bulbizarre',
        rarity: 'Common',
        cardNumber: '52/102',
        imageUrl: null,
        setId: set.id,
      },
    ],
  });

  // ✅ Récupérer les cartes par externalId (unique)
  const pikachu = await prisma.card.findUnique({
    where: { externalId: 'legacy-base-pikachu-15-102' },
  });

  const bulbizarre = await prisma.card.findUnique({
    where: { externalId: 'legacy-base-bulbizarre-52-102' },
  });

  if (!pikachu || !bulbizarre) {
    throw new Error('Cartes seed introuvables');
  }

  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // ✅ Prix (kind obligatoire)
  await prisma.price.createMany({
    data: [
      {
        price: 12.5,
        source: 'CARDMARKET',
        currency: 'EUR',
        kind: 'trend',
        day ,
        cardId: pikachu.id,
      },
      {
        price: 14.0,
        source: 'CARDMARKET',
        currency: 'EUR',
        kind: 'trend',
        day ,
        cardId: pikachu.id,
      },
      {
        price: 9.2,
        source: 'CARDMARKET',
        currency: 'EUR',
        kind: 'trend',
        day ,
        cardId: bulbizarre.id,
      },
    ],
  });

  console.log('✅ Seed terminé');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
