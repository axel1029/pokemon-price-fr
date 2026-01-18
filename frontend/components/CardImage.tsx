'use client';

import Image from 'next/image';
import { useState } from 'react';

export function CardImage({
  imageUrl,
  name,
  width = 120,
  height = 170,
}: {
  imageUrl?: string | null;
  name: string;
  width?: number;
  height?: number;
}) {
  const [broken, setBroken] = useState(false);

  if (!imageUrl || broken) {
    return (
      <div
        style={{ width, height }}
        className="bg-zinc-800 text-zinc-400 rounded flex items-center justify-center text-sm"
      >
        Pas d’image
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={name}
      width={width}
      height={height}
      className="rounded object-cover"
      onError={() => setBroken(true)}
    />
  );
}
