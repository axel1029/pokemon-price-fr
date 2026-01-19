import { getCardPrices, getCardStats, getLatestPrice, getCard } from '@/lib/api';
import PriceChart from '@/components/PriceChart';
import Image from 'next/image';

type PricePoint = {
  price: number;
  createdAt: string;
  source: string;
  kind?: string;
};

type StatsResponse = {
  min: number | null;
  max: number | null;
  avg: number | null;
  latest?: any;
};

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cardId = Number(id);

  if (!Number.isFinite(cardId)) {
    return <div className="p-6">Carte invalide</div>;
  }

  // ✅ bon ordre
  const [card, pricesRaw, statsRaw, latestRaw] = await Promise.all([
    getCard(cardId),
    getCardPrices(cardId),
    getCardStats(cardId),
    getLatestPrice(cardId),
  ]);

  if (!card) {
    return <div className="p-6">Carte introuvable</div>;
  }

  const prices: PricePoint[] = Array.isArray(pricesRaw) ? pricesRaw : [];
  const stats = (statsRaw ?? null) as StatsResponse | null;
  const latest = latestRaw ?? null;

  if (!stats) {
    return <div className="p-6">Pas de stats disponibles</div>;
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Carte #{cardId}</h1>

      <div className="flex gap-6">
        {/* IMAGE */}
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.name}
            width={250}
            height={350}
            className="rounded shadow"
            priority
          />
        ) : (
          <div className="w-[250px] h-[350px] bg-gray-200 rounded flex items-center justify-center">
            Pas d’image
          </div>
        )}

        {/* INFOS */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold">{card.name}</h2>

          <div className="mt-2 text-gray-600">
            {card.set?.name ?? '—'} — #{card.cardNumber ?? '—'}
          </div>

          {latest ? (
            <div className="mt-4 text-xl font-semibold">
              Dernier prix : {Number(latest.price).toFixed(2)} €
            </div>
          ) : (
            <div className="mt-4 text-xl font-semibold opacity-60">
              Aucun prix disponible
            </div>
          )}

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              Min<br />
              <strong>{stats?.min != null ? `${stats.min.toFixed(2)} €` : '—'}</strong>
            </div>
            <div>
              Max<br />
              <strong>{stats?.max != null ? `${stats.max.toFixed(2)} €` : '—'}</strong>
            </div>
            <div>
              Moyenne<br />
              <strong>{stats?.avg != null ? `${stats.avg.toFixed(2)} €` : '—'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bloc dernier prix détaillé */}
      {latest && (
        <div className="border rounded p-3">
          Dernier prix : <span className="font-semibold">{Number(latest.price).toFixed(2)} €</span>{' '}
          ({latest.source})
        </div>
      )}

      {/* Graphique */}
      <PriceChart prices={prices} />

      {/* Historique */}
      <div>
        <h2 className="font-semibold mb-2">Historique</h2>

        {prices.length === 0 ? (
          <div className="opacity-70">Aucun historique</div>
        ) : (
          <ul className="space-y-1">
            {prices.map((p: PricePoint) => (
              <li
                key={`${p.createdAt}-${p.source}-${p.kind ?? ''}`}
                className="border rounded px-3 py-2"
              >
                {new Date(p.createdAt).toLocaleDateString()} — {Number(p.price).toFixed(2)} € ({p.source})
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
