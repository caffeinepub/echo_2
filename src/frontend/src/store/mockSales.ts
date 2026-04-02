export interface CompletedSale {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  priceUsd: number;
  soldAt: Date;
  status: "completed";
}

const now = new Date();

function daysAgo(d: number): Date {
  return new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
}

function hoursAgo(h: number): Date {
  return new Date(now.getTime() - h * 60 * 60 * 1000);
}

export const MOCK_SALES: CompletedSale[] = [
  // Within 24h
  {
    id: "s1",
    title: "Rolex Datejust 41 Blue Dial",
    imageUrl:
      "https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=120&h=120&fit=crop",
    category: "Luxury Watch",
    priceUsd: 9800,
    soldAt: hoursAgo(3),
    status: "completed",
  },
  {
    id: "s2",
    title: "iPhone 15 Pro Max 1TB Natural Titanium",
    imageUrl:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=120&h=120&fit=crop",
    category: "Electronics",
    priceUsd: 1100,
    soldAt: hoursAgo(11),
    status: "completed",
  },
  // Within 1W
  {
    id: "s3",
    title: "Leica M11 Rangefinder Camera",
    imageUrl:
      "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=120&h=120&fit=crop",
    category: "Electronics",
    priceUsd: 8900,
    soldAt: daysAgo(2),
    status: "completed",
  },
  {
    id: "s4",
    title: "Banksy 'Flower Thrower' Signed Print",
    imageUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=120&h=120&fit=crop",
    category: "Art",
    priceUsd: 6500,
    soldAt: daysAgo(4),
    status: "completed",
  },
  {
    id: "s5",
    title: "Sony A7R V Mirrorless Body",
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=120&h=120&fit=crop",
    category: "Electronics",
    priceUsd: 3200,
    soldAt: daysAgo(5),
    status: "completed",
  },
  {
    id: "s6",
    title: "Supreme Box Logo Hoodie FW23",
    imageUrl:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=120&h=120&fit=crop",
    category: "Fashion",
    priceUsd: 1400,
    soldAt: daysAgo(6),
    status: "completed",
  },
  // Within 1M
  {
    id: "s7",
    title: "Bored Ape Yacht Club #4827 Fine Art Print",
    imageUrl:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=120&h=120&fit=crop",
    category: "Collectibles",
    priceUsd: 4200,
    soldAt: daysAgo(12),
    status: "completed",
  },
  {
    id: "s8",
    title: "Air Jordan 1 Retro High OG 'Chicago'",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop",
    category: "Sneakers",
    priceUsd: 850,
    soldAt: daysAgo(18),
    status: "completed",
  },
  {
    id: "s9",
    title: "NVIDIA RTX 4090 Founders Edition",
    imageUrl:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=120&h=120&fit=crop",
    category: "Hardware",
    priceUsd: 1950,
    soldAt: daysAgo(22),
    status: "completed",
  },
  {
    id: "s10",
    title: "Omega Speedmaster Moonwatch Professional",
    imageUrl:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=120&h=120&fit=crop",
    category: "Luxury Watch",
    priceUsd: 6200,
    soldAt: daysAgo(25),
    status: "completed",
  },
  // Within 1Y
  {
    id: "s11",
    title: "Apple Mac Pro M2 Ultra 192GB",
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&h=120&fit=crop",
    category: "Electronics",
    priceUsd: 7500,
    soldAt: daysAgo(90),
    status: "completed",
  },
  {
    id: "s12",
    title: "Hermès Birkin 25 Togo Leather",
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&h=120&fit=crop",
    category: "Fashion",
    priceUsd: 12000,
    soldAt: daysAgo(140),
    status: "completed",
  },
  {
    id: "s13",
    title: "Satoshi Nakamoto 'Genesis Block' Commemorative",
    imageUrl:
      "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=120&h=120&fit=crop",
    category: "Collectibles",
    priceUsd: 5100,
    soldAt: daysAgo(200),
    status: "completed",
  },
  // All time
  {
    id: "s14",
    title: "DJI Inspire 3 Drone System",
    imageUrl:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=120&h=120&fit=crop",
    category: "Hardware",
    priceUsd: 3800,
    soldAt: daysAgo(400),
    status: "completed",
  },
  {
    id: "s15",
    title: "Patek Philippe Calatrava Ref. 5196",
    imageUrl:
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=120&h=120&fit=crop",
    category: "Luxury Watch",
    priceUsd: 11200,
    soldAt: daysAgo(420),
    status: "completed",
  },
  {
    id: "s16",
    title: "Yeezy Boost 350 V2 'Zebra'",
    imageUrl:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=120&h=120&fit=crop",
    category: "Sneakers",
    priceUsd: 420,
    soldAt: daysAgo(500),
    status: "completed",
  },
  {
    id: "s17",
    title: "Andy Warhol 'Marilyn' Screenprint",
    imageUrl:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=120&h=120&fit=crop",
    category: "Art",
    priceUsd: 8400,
    soldAt: daysAgo(480),
    status: "completed",
  },
  {
    id: "s18",
    title: "CryptoPunk #7219 Physical Canvas",
    imageUrl:
      "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=120&h=120&fit=crop",
    category: "Collectibles",
    priceUsd: 9200,
    soldAt: daysAgo(510),
    status: "completed",
  },
];

const TIME_RANGE_MS: Record<string, number> = {
  "24H": 24 * 60 * 60 * 1000,
  "1W": 7 * 24 * 60 * 60 * 1000,
  "1M": 30 * 24 * 60 * 60 * 1000,
  "1Y": 365 * 24 * 60 * 60 * 1000,
};

export function getTopSoldItems(
  timeRange: "24H" | "1W" | "1M" | "1Y" | "ALL",
): CompletedSale[] {
  const cutoff =
    timeRange === "ALL"
      ? null
      : new Date(Date.now() - TIME_RANGE_MS[timeRange]);

  const filtered = cutoff
    ? MOCK_SALES.filter((s) => s.soldAt >= cutoff)
    : MOCK_SALES;

  return [...filtered].sort((a, b) => b.priceUsd - a.priceUsd).slice(0, 10);
}
