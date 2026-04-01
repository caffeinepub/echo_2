// ─── Seed Mock Data ───────────────────────────────────────────────────────────
// Inserts a one-time mock card into the "Yo" set for UI testing.
// Safe to call on every app mount — idempotent check prevents duplicates.

import { addCard, addSet, getCards, getSets } from "./mockCatalog";

export function seedMockData(): void {
  const sets = getSets();

  // Find or create the "Yo" set
  let yoSet = sets.find((s) => s.name === "Yo");
  if (!yoSet) {
    yoSet = addSet({
      name: "Yo",
      slug: "yo",
      categoryId: "",
      imageUrl: "",
      sortOrder: 99,
      active: true,
      setCode: "YO",
      releaseYear: 2026,
      cardCount: 1,
      totalCards: 1,
      featured: false,
    });
  }

  // Check if Pikachu ex already exists for this set
  const cards = getCards();
  const alreadyExists = cards.some(
    (c) => c.name === "Pikachu ex" && c.setId === yoSet!.id,
  );
  if (alreadyExists) return;

  // Insert the mock card
  addCard({
    setId: yoSet.id,
    name: "Pikachu ex",
    number: "025",
    imageUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
    rarity: "Special Illustration Rare",
    sortOrder: 1,
    active: true,
    isSupported: true,
    tagPopulation10: 42,
    tagPopulation9: 118,
    tagPopulation8: 203,
    totalTagPopulation: 363,
    mintyTransactions: 6,
    lastSalePriceUsd: 420,
    averageSalePriceUsd: 385,
    highestSalePriceUsd: 510,
    lowestSalePriceUsd: 250,
    activeListings: 2,
    preferredCurrency: "USD",
    recentSales: [
      { priceUsd: 420, grade: "TAG 10", date: "2026-02-14" },
      { priceUsd: 390, grade: "TAG 10", date: "2026-02-03" },
      { priceUsd: 365, grade: "TAG 9", date: "2026-01-28" },
      { priceUsd: 510, grade: "TAG 10", date: "2026-01-17" },
      { priceUsd: 250, grade: "TAG 8", date: "2026-01-02" },
      { priceUsd: 375, grade: "TAG 9", date: "2025-12-19" },
    ],
  });
}
