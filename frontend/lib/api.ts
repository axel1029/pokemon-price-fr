const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE = `${API_URL}/api`;

async function safeJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error('JSON parse failed:', {
      url: res.url,
      status: res.status,
      textPreview: text.slice(0, 200),
    });
    return null;
  }
}

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
  const res = await fetch(`${API_BASE}/cards/${cardId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return safeJson<any>(res);
}

export async function getCards(
  page = 1,
  pageSize = 20,
  search = '',
): Promise<CardsResponse | null> {
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(search ? { search } : {}),
  });

  const res = await fetch(`${API_BASE}/cards?${qs.toString()}`, { cache: 'no-store' });
  if (!res.ok) return null;

  return safeJson<CardsResponse>(res);
}

export async function getCardPrices(cardId: number) {
  const res = await fetch(`${API_BASE}/pokemon/prices/${cardId}`, { cache: 'no-store' });
  if (!res.ok) return [];

  const data = await safeJson<any>(res);
  return Array.isArray(data) ? data : [];
}

export async function getCardStats(cardId: number) {
  const res = await fetch(`${API_BASE}/pokemon/prices/${cardId}/stats`, { cache: 'no-store' });
  if (!res.ok) return null;

  return safeJson<any>(res);
}

export async function getLatestPrice(cardId: number) {
  const res = await fetch(`${API_BASE}/pokemon/prices/${cardId}/latest`, { cache: 'no-store' });
  if (!res.ok) return null;

  return safeJson<any>(res);
}
