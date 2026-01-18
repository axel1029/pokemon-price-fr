'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

type PricePoint = {
  price: number;
  createdAt: string;
  source: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function formatEuro(v: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(v);
}

export default function PriceChart({ prices }: { prices: PricePoint[] }) {
  // On prépare les données pour recharts
  const data = prices.map((p) => ({
    date: formatDate(p.createdAt),
    price: p.price,
    source: p.source,
  }));

  if (!data.length) {
    return <div className="opacity-70">Aucun prix à afficher</div>;
  }

  return (
    <div className="border rounded p-4">
      <div className="font-semibold mb-3">Évolution du prix (€)</div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickMargin={8} />
            <YAxis tickMargin={8} />
            <Tooltip
              formatter={(value) => formatEuro(Number(value))}
              labelFormatter={(label) => `Date : ${label}`}
            />
            <Line type="monotone" dataKey="price" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
