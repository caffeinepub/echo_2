/**
 * Local (localStorage-based) market listing type used by ClipChartModal,
 * NftDetailModal, and OfferModal. This is separate from the backend Listing type
 * used by MarketPage which calls actor.getListings().
 */
export interface MarketListing {
  id: string;
  clipId: string;
  clipTitle: string;
  creatorUsername: string;
  imageUrl: string;
  videoUrl: string;
  listPrice: number;
  editionNumber: number;
  totalEditions: number;
  listedAt: number;
  sellerId: string;
}

const LS_LISTINGS_KEY = "minty_market_listings";

export function loadListings(): MarketListing[] {
  try {
    const raw = localStorage.getItem(LS_LISTINGS_KEY);
    return raw ? (JSON.parse(raw) as MarketListing[]) : [];
  } catch {
    return [];
  }
}

export function saveListings(listings: MarketListing[]) {
  try {
    localStorage.setItem(LS_LISTINGS_KEY, JSON.stringify(listings));
  } catch {
    /* ignore */
  }
}
