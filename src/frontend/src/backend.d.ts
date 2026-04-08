import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Collectible {
    id: string;
    setName: string;
    title: string;
    creator: string;
    typeSupply: bigint;
    editionNumber: bigint;
    ownerPrincipal: Principal;
    mintDate: string;
    totalSupply: bigint;
    imageUrl: string;
    releaseId: string;
    mediaType: CollectibleMediaType;
    rarity: string;
    packId: string;
    openedAt: bigint;
}
export interface TcgSet {
    id: bigint;
    setCode: string;
    coverImageUrl: string;
    setName: string;
    featured: boolean;
    tcgCategory: string;
    sortOrder: bigint;
    slug: string;
    isActive: boolean;
    cardCount?: bigint;
    releaseYear: bigint;
}
export interface MarketCapEntry {
    clipId: string;
    title: string;
    previewUrl: string;
    totalSupply: bigint;
    creatorName: string;
    currentPriceUsd: number;
    copiesSold: bigint;
    videoUrl: string;
    marketCapUsd: number;
}
export interface VideoAsset {
    owner: Principal;
    data: Uint8Array;
    content_type: string;
    created_at: bigint;
    asset_id: string;
}
export interface CreateTcgSetInput {
    setCode: string;
    coverImageUrl: string;
    setName: string;
    featured: boolean;
    tcgCategory: string;
    sortOrder: bigint;
    slug: string;
    isActive: boolean;
    cardCount?: bigint;
    releaseYear: bigint;
}
export interface CreateTcgCardInput {
    cardName: string;
    sortOrder: bigint;
    isActive: boolean;
    setId: bigint;
    imageUrl: string;
    rarity: string;
    cardNumber: string;
    isSupported: boolean;
}
export interface Transaction {
    id: bigint;
    status: string;
    clipId: string;
    totalUsd: number;
    timestamp: bigint;
    txType: TxType;
    splits: Array<TxSplit>;
}
export interface TxSplit {
    principal: Principal;
    role: string;
    usdAmount: number;
    btcAmountSimulated: number;
    btcAddress: string;
}
export interface Release {
    album: Album;
    floorPrice: bigint;
    isActive: boolean;
    lastSoldPrice: bigint;
    mintedCount: bigint;
    ownersCount: bigint;
    mintOpenTime: bigint;
}
export interface Album {
    id: string;
    coverImageUrl: string;
    title: string;
    tracklist: Array<Track>;
    totalSupply: bigint;
    artist: string;
    collectionName: string;
}
export interface PricePoint {
    editionNumber: bigint;
    timestamp: bigint;
    salePrice: number;
}
export type LikeResult = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "alreadyLiked";
    alreadyLiked: null;
} | {
    __kind__: "notFound";
    notFound: null;
};
export interface Track {
    title: string;
    duration: bigint;
}
export interface MarketListing {
    seller: Principal;
    editionId: bigint;
    price: bigint;
}
export interface Listing {
    id: bigint;
    status: ListingStatus;
    clipId: string;
    totalEditions: bigint;
    sellerPrincipal: Principal;
    listPriceUsd: number;
    editionNumber: bigint;
    listedAt: bigint;
}
export interface VideoClip {
    clip_id: string;
    like_timestamps: Array<[Principal, bigint]>;
    title?: string;
    hashtags: Array<string>;
    preview_loop_url: string;
    like_count: bigint;
    likes_last_6_hours: bigint;
    likes_last_24_hours: bigint;
    timestamp: bigint;
    likes_last_hour: bigint;
    explicit_flag: boolean;
    creator_principal_id: Principal;
    video_file_url: string;
}
export interface UpdateTcgCardInput {
    id: bigint;
    cardName: string;
    sortOrder: bigint;
    isActive: boolean;
    setId: bigint;
    imageUrl: string;
    rarity: string;
    cardNumber: string;
    isSupported: boolean;
}
export interface CreateTcgCategoryInput {
    sortOrder: bigint;
    name: string;
    slug: string;
    isActive: boolean;
    imageUrl: string;
}
export interface UpdateTcgCategoryInput {
    id: bigint;
    sortOrder: bigint;
    name: string;
    slug: string;
    isActive: boolean;
    imageUrl: string;
}
export interface UpdateTcgSetInput {
    id: bigint;
    setCode: string;
    coverImageUrl: string;
    setName: string;
    featured: boolean;
    tcgCategory: string;
    sortOrder: bigint;
    slug: string;
    isActive: boolean;
    cardCount?: bigint;
    releaseYear: bigint;
}
export interface TcgCard {
    id: bigint;
    cardName: string;
    sortOrder: bigint;
    isActive: boolean;
    setId: bigint;
    imageUrl: string;
    rarity: string;
    cardNumber: string;
    isSupported: boolean;
}
export interface Offer {
    id: bigint;
    status: OfferStatus;
    offerPriceUsd: number;
    listingId: bigint;
    createdAt: bigint;
    buyerPrincipal: Principal;
}
export interface Pack {
    id: string;
    status: PackStatus;
    coverImageUrl: string;
    setName: string;
    ownerPrincipal: Principal;
    createdAt: bigint;
    totalSupply: bigint;
    releaseId: string;
    serialNumber: bigint;
    packCount: bigint;
    collectibleId?: string;
    openedAt?: bigint;
}
export interface AddPackInput {
    id: string;
    coverImageUrl: string;
    setName: string;
    ownerPrincipal: Principal;
    totalSupply: bigint;
    releaseId: string;
    serialNumber: bigint;
    packCount: bigint;
}
export type PackOpenResult = {
    __kind__: "ok";
    ok: Collectible;
} | {
    __kind__: "err";
    err: string;
};
export interface TcgCategory {
    id: bigint;
    sortOrder: bigint;
    name: string;
    slug: string;
    isActive: boolean;
    imageUrl: string;
}
export enum CollectibleMediaType {
    video = "video",
    photo = "photo"
}
export enum ListingStatus {
    active = "active",
    cancelled = "cancelled",
    sold = "sold"
}
export enum OfferStatus {
    pending = "pending",
    accepted = "accepted",
    declined = "declined"
}
export enum PackStatus {
    opened = "opened",
    sealed = "sealed"
}
export enum TxType {
    mintFee = "mintFee",
    secondaryTrade = "secondaryTrade",
    copySale = "copySale"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VideoClipSort {
    top = "top",
    trending = "trending",
    newest = "newest"
}
export interface backendInterface {
    acceptOffer(offerId: bigint): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addAlbum(album: Album): Promise<void>;
    addPack(input: AddPackInput): Promise<void>;
    addRelease(release: Release): Promise<void>;
    assignRole(user: Principal, role: UserRole): Promise<void>;
    cancelListing(listingId: bigint): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createCard(input: CreateTcgCardInput): Promise<TcgCard>;
    createCategory(input: CreateTcgCategoryInput): Promise<TcgCategory>;
    /**
     * / Create a new video clip post. Returns the generated clip_id.
     */
    createClip(video_file_url: string, preview_loop_url: string, title: string | null, hashtags: Array<string>, explicit_flag: boolean): Promise<string>;
    createListing(clipId: string, editionNumber: bigint, listPriceUsd: number): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createSet(input: CreateTcgSetInput): Promise<TcgSet>;
    declineOffer(offerId: bigint): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteCard(id: bigint): Promise<void>;
    deleteCategory(id: bigint): Promise<void>;
    deleteSet(id: bigint): Promise<void>;
    getAlbumById(id: string): Promise<Album | null>;
    getAlbums(): Promise<Array<Album>>;
    getAllCardsAdmin(): Promise<Array<TcgCard>>;
    getAllCategoriesAdmin(): Promise<Array<TcgCategory>>;
    getAllSetsAdmin(): Promise<Array<TcgSet>>;
    getCallerCollectibles(): Promise<Array<Collectible>>;
    getCallerPacks(): Promise<Array<Pack>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCardsBySet(setId: bigint): Promise<Array<TcgCard>>;
    getCardsBySetAdmin(setId: bigint): Promise<Array<TcgCard>>;
    getCategories(): Promise<Array<TcgCategory>>;
    /**
     * / Fetch clips sorted by newest, trending (viral score), or top (total likes).
     * / safeView=true hides explicit clips.
     */
    getClips(sortBy: VideoClipSort, safeView: boolean): Promise<Array<VideoClip>>;
    /**
     * / Fetch clips filtered to a specific hashtag.
     * / Delegates to getClipsForHashtag with newest sort and no safe view filter.
     */
    getClipsByHashtag(hashtag: string): Promise<Array<VideoClip>>;
    /**
     * / Fetch clips filtered to a specific hashtag (case-insensitive), then sorted.
     */
    getClipsForHashtag(hashtag: string, sortBy: VideoClipSort, safeView: boolean): Promise<Array<VideoClip>>;
    /**
     * / Get all clips created by a specific principal.
     */
    getCreatorClips(creator: Principal): Promise<Array<VideoClip>>;
    getCurrentPrice(clipId: string): Promise<number>;
    getFeaturedSets(): Promise<Array<TcgSet>>;
    getListings(): Promise<Array<Listing>>;
    getListingsByClip(clipId: string): Promise<Array<Listing>>;
    getMarketCap(clipId: string): Promise<MarketCapEntry | null>;
    getMarketListings(): Promise<Array<MarketListing>>;
    getMyRole(): Promise<UserRole>;
    /**
     * / Returns transactions where p appears in any split's principal.
     */
    getMyTransactions(p: Principal): Promise<Array<Transaction>>;
    getOfferHistory(listingId: bigint): Promise<Array<Offer>>;
    getOffers(listingId: bigint): Promise<{
        __kind__: "ok";
        ok: Array<Offer>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getPokemonSets(): Promise<Array<TcgSet>>;
    getPriceHistory(clipId: string): Promise<Array<PricePoint>>;
    getReleases(): Promise<Array<Release>>;
    getSetById(id: bigint): Promise<TcgSet | null>;
    getSetBySlug(slug: string): Promise<TcgSet | null>;
    getSets(): Promise<Array<TcgSet>>;
    getSetsByCategory(categorySlug: string): Promise<Array<TcgSet>>;
    getTop10ByMarketCap(): Promise<Array<MarketCapEntry>>;
    /**
     * / Returns all transactions newest-first.
     */
    getTransactionHistory(): Promise<Array<Transaction>>;
    /**
     * / Get trending hashtags sorted by viral score descending.
     * / Returns (tag, post_count) pairs.
     */
    getTrendingHashtags(): Promise<Array<[string, bigint]>>;
    /**
     * / Get trending hashtags with a hot flag.
     * / Returns (tag, post_count, is_hot) — is_hot is true for tags in the top 3 by viral score.
     */
    getTrendingHashtagsWithHotFlag(): Promise<Array<[string, bigint, boolean]>>;
    getUserCollectibles(user: Principal): Promise<Array<Collectible>>;
    getUserPacks(user: Principal): Promise<Array<Pack>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Retrieve raw video/preview blob data by asset_id.
     */
    getVideoBlob(asset_id: string): Promise<VideoAsset | null>;
    isAdmin(): Promise<boolean>;
    /**
     * / Like a clip. Each caller can only like once. Returns new like_count.
     */
    likeClip(clip_id: string): Promise<LikeResult>;
    makeOffer(listingId: bigint, offerPriceUsd: number): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    openPack(packId: string): Promise<PackOpenResult>;
    /**
     * / Record a $1 mint fee. 100% to platform wallet.
     */
    processClipMint(creatorPrincipal: Principal): Promise<bigint>;
    /**
     * / Record a bonding curve copy sale. 95% to creator, 5% to platform.
     */
    processCopySale(clipId: string, creatorPrincipal: Principal, buyerPrincipal: Principal, usdAmount: number): Promise<bigint>;
    /**
     * / Record a secondary trade. 4% to original creator, 1% to platform, 95% to seller.
     */
    processSecondaryTrade(clipId: string, originalCreatorPrincipal: Principal, sellerPrincipal: Principal, buyerPrincipal: Principal, usdAmount: number): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchSetsByName(searchTerm: string): Promise<Array<TcgSet>>;
    toggleCardActive(id: bigint): Promise<void>;
    toggleCardSupported(id: bigint): Promise<void>;
    toggleCategoryActive(id: bigint): Promise<void>;
    toggleSetActive(id: bigint): Promise<void>;
    updateCard(input: UpdateTcgCardInput): Promise<TcgCard>;
    updateCategory(input: UpdateTcgCategoryInput): Promise<TcgCategory>;
    updateSet(input: UpdateTcgSetInput): Promise<TcgSet>;
    /**
     * / Upload a raw preview clip blob (short 2s muted mp4). Returns asset_id to use as preview_loop_url.
     */
    uploadPreviewBlob(data: Uint8Array, content_type: string): Promise<string>;
    /**
     * / Upload a raw HD video blob (mp4). Returns asset_id to use as video_file_url.
     */
    uploadVideoBlob(data: Uint8Array, content_type: string): Promise<string>;
}
