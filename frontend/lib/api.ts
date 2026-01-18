const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export type CardsResponse = {
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    search: string | null;
  };
  items: any[];
};

export async function getCard(cardId: number) {
  const res = await fetch(`http://localhost:3001/api/cards/${cardId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Erreur API getCard');
  }

  return res.json();
}

export async function getCards(page = 1, pageSize = 20, search = ''): Promise<CardsResponse | null> {
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(search ? { search } : {}),
  });

  const res = await fetch(`${API_URL}/cards?${qs.toString()}`, { cache: 'no-store' });

  if (!res.ok) return null;
  return res.json();
}

export async function getCardPrices(cardId: number) {
  const res = await fetch(`${API_URL}/pokemon/prices/${cardId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getCardStats(cardId: number) {
  const res = await fetch(`${API_URL}/pokemon/prices/${cardId}/stats`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function getLatestPrice(cardId: number) {
  const res = await fetch(`${API_URL}/pokemon/prices/${cardId}/latest`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}
