import Link from 'next/link';
import { getCards } from '@/lib/api';
import Image from 'next/image';
import { CardImage } from '@/components/CardImage';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? '1');
  const search = sp.search ?? '';

  const data = await getCards(Number.isFinite(page) ? page : 1, 20, search);

  if (!data) {
    return <main className="p-6">Erreur API (backend non joignable)</main>;
  }

  const { meta, items } = data;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Pokémon Price FR</h1>

      <form action="/" method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          className="border rounded px-3 py-2 w-full"
          placeholder="Rechercher une carte (ex: Pikachu)"
        />
        <button className="border rounded px-4 py-2">Rechercher</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((card: any) => (
          <Link
            key={card.id}
            href={`/cards/${card.id}`}
            className="border rounded p-3 hover:shadow transition block"
          >
            {/* ✅ Image */}
            <CardImage imageUrl={card.imageUrl} name={card.name} />

            {/* Infos */}
            <div className="font-semibold">{card.name}</div>
            <div className="text-sm opacity-70">
              {card.set?.name} • #{card.cardNumber} • {card.rarity ?? '—'}
            </div>

            <div className="mt-2 text-sm">
              <span className="opacity-70">Dernier prix:</span>{' '}
              <span className="font-semibold">
                {card.latestPrice != null ? `${Number(card.latestPrice).toFixed(2)} €` : '—'}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {meta.page > 1 && (
          <Link
            className="border rounded px-3 py-2"
            href={`/?page=${meta.page - 1}&search=${encodeURIComponent(search)}`}
          >
            ← Prev
          </Link>
        )}

        <div className="text-sm opacity-70">
          Page {meta.page} / {meta.totalPages} — {meta.total} cartes
        </div>

        {meta.page < meta.totalPages && (
          <Link
            className="border rounded px-3 py-2"
            href={`/?page=${meta.page + 1}&search=${encodeURIComponent(search)}`}
          >
            Next →
          </Link>
        )}
      </div>
    </main>
  );
}
