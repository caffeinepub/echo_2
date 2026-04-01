// ─── Mock Catalog Store ──────────────────────────────────────────────────────
// Single source of truth for frontend-only catalog data backed by localStorage.
// Function signatures are designed to be swappable with async canister calls.

const KEYS = {
  categories: "minty_catalog_categories",
  sets: "minty_catalog_sets",
  cards: "minty_catalog_cards",
} as const;

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  sortOrder: number;
  active: boolean;
}

export interface MockSet {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  imageUrl: string;
  sortOrder: number;
  active: boolean;
  setCode: string;
  releaseYear: number;
  cardCount: number | null;
  totalCards: number | null; // alias for cardCount
  featured: boolean;
}

export interface MockCard {
  id: string;
  setId: string;
  name: string;
  number: string;
  imageUrl: string;
  sortOrder: number;
  active: boolean;
  rarity: string;
  isSupported: boolean;
  // TAG Population
  tagPopulation10: number;
  tagPopulation9: number;
  tagPopulation8: number;
  totalTagPopulation: number;
  // Market Data
  mintyTransactions: number;
  lastSalePriceUsd: number;
  averageSalePriceUsd: number;
  highestSalePriceUsd: number;
  lowestSalePriceUsd: number;
  preferredCurrency: "USD";
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function getCategories(): MockCategory[] {
  try {
    const raw = localStorage.getItem(KEYS.categories);
    return raw ? (JSON.parse(raw) as MockCategory[]) : [];
  } catch {
    return [];
  }
}

export function saveCategories(cats: MockCategory[]): void {
  localStorage.setItem(KEYS.categories, JSON.stringify(cats));
}

export function addCategory(input: Omit<MockCategory, "id">): MockCategory {
  const item: MockCategory = { ...input, id: generateId() };
  saveCategories([...getCategories(), item]);
  return item;
}

export function updateCategory(
  id: string,
  input: Partial<Omit<MockCategory, "id">>,
): MockCategory | null {
  const all = getCategories();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...input };
  saveCategories(all);
  return all[idx];
}

export function deleteCategory(id: string): void {
  saveCategories(getCategories().filter((c) => c.id !== id));
}

export function toggleCategoryActive(id: string): void {
  const all = getCategories();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], active: !all[idx].active };
  saveCategories(all);
}

// ─── Sets ─────────────────────────────────────────────────────────────────────

export function getSets(): MockSet[] {
  try {
    const raw = localStorage.getItem(KEYS.sets);
    if (!raw) return [];
    const sets = JSON.parse(raw) as MockSet[];
    // Ensure totalCards alias is always in sync with cardCount
    return sets.map((s) => ({ ...s, totalCards: s.cardCount }));
  } catch {
    return [];
  }
}

export function saveSets(sets: MockSet[]): void {
  localStorage.setItem(KEYS.sets, JSON.stringify(sets));
}

export function addSet(input: Omit<MockSet, "id">): MockSet {
  const item: MockSet = {
    ...input,
    id: generateId(),
    totalCards: input.cardCount,
  };
  saveSets([...getSets(), item]);
  return item;
}

export function updateSet(
  id: string,
  input: Partial<Omit<MockSet, "id">>,
): MockSet | null {
  const all = getSets();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    ...input,
    totalCards: input.cardCount ?? all[idx].cardCount,
  };
  saveSets(all);
  return all[idx];
}

export function deleteSet(id: string): void {
  saveSets(getSets().filter((s) => s.id !== id));
}

export function toggleSetActive(id: string): void {
  const all = getSets();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], active: !all[idx].active };
  saveSets(all);
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function withCardDefaults(card: MockCard): MockCard {
  return {
    ...card,
    tagPopulation10: card.tagPopulation10 ?? 0,
    tagPopulation9: card.tagPopulation9 ?? 0,
    tagPopulation8: card.tagPopulation8 ?? 0,
    totalTagPopulation: card.totalTagPopulation ?? 0,
    mintyTransactions: card.mintyTransactions ?? 0,
    lastSalePriceUsd: card.lastSalePriceUsd ?? 0,
    averageSalePriceUsd: card.averageSalePriceUsd ?? 0,
    highestSalePriceUsd: card.highestSalePriceUsd ?? 0,
    lowestSalePriceUsd: card.lowestSalePriceUsd ?? 0,
    preferredCurrency: card.preferredCurrency ?? "USD",
  };
}

export function getCards(): MockCard[] {
  try {
    const raw = localStorage.getItem(KEYS.cards);
    return raw ? (JSON.parse(raw) as MockCard[]).map(withCardDefaults) : [];
  } catch {
    return [];
  }
}

export function saveCards(cards: MockCard[]): void {
  localStorage.setItem(KEYS.cards, JSON.stringify(cards));
}

export function addCard(input: Omit<MockCard, "id">): MockCard {
  const item: MockCard = withCardDefaults({
    ...input,
    id: generateId(),
  } as MockCard);
  saveCards([...getCards(), item]);
  return item;
}

export function updateCard(
  id: string,
  input: Partial<Omit<MockCard, "id">>,
): MockCard | null {
  const all = getCards();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  all[idx] = withCardDefaults({ ...all[idx], ...input });
  saveCards(all);
  return all[idx];
}

export function deleteCard(id: string): void {
  saveCards(getCards().filter((c) => c.id !== id));
}

export function toggleCardActive(id: string): void {
  const all = getCards();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], active: !all[idx].active };
  saveCards(all);
}

export function toggleCardSupported(id: string): void {
  const all = getCards();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], isSupported: !all[idx].isSupported };
  saveCards(all);
}
