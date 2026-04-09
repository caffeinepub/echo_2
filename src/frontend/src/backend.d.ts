import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TcgCategory {
    id: bigint;
    sortOrder: bigint;
    name: string;
    slug: string;
    isActive: boolean;
    imageUrl: string;
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
export interface UserWallet {
    walletPrincipalId: Principal;
    usdValueRef: number;
    btcAddress: string;
    deposits: Array<Deposit>;
    payouts: Array<Payout>;
    btcBalanceE8s: bigint;
}
export interface Payout {
    clipId: string;
    btcAmountE8s: bigint;
    payoutId: string;
    timestamp: bigint;
    payoutType: PayoutType;
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
export interface EarningsSummary {
    totalBtcE8s: bigint;
    fromAuctionWins: number;
    fromCopySales: number;
    totalUsd: number;
    fromTradeRoyalties: number;
    transactionCount: bigint;
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
export interface Deposit {
    depositId: string;
    confirmationStatus: ConfirmationStatus;
    btcAmountE8s: bigint;
    txid: string;
    timestamp: bigint;
}
export interface PriceHistorySummary {
    currentPrice: number;
    maxPrice: number;
    totalSales: bigint;
    minPrice: number;
    lastSaleTimestamp?: bigint;
    firstSaleTimestamp?: bigint;
}
export interface Track {
    title: string;
    duration: bigint;
}
export interface MarketListing {
    seller: Principal;
    editionId: bigint;
    price: bigint;
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
export interface WalletActivity {
    status: Variant_pending_confirmed;
    activityType: WalletActivityType;
    btcAmountE8s: bigint;
    description: string;
    timestamp: bigint;
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
export interface BondingCurveState {
    startingPrice: number;
    clipId: string;
    currentPrice: number;
    totalSupply: bigint;
    nextPrice: number;
    soldOut: boolean;
    priceIncrementFactor: number;
    copiesMinted: bigint;
}
export interface CreateTcgCategoryInput {
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
export interface UpdateTcgCategoryInput {
    id: bigint;
    sortOrder: bigint;
    name: string;
    slug: string;
    isActive: boolean;
    imageUrl: string;
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
export interface PurchaseRecord {
    status: PurchaseStatus;
    clipId: string;
    editionNumber: bigint;
    purchasedAt: bigint;
    buyerPrincipal: Principal;
    pricePaid: number;
    purchaseId: string;
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
export interface UserProfile {
    name: string;
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
export enum PayoutType {
    auctionWin = "auctionWin",
    copySale = "copySale",
    secondaryRoyalty = "secondaryRoyalty"
}
export enum PurchaseStatus {
    pending = "pending",
    minted = "minted"
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
export enum Variant_pending_confirmed {
    pending = "pending",
    confirmed = "confirmed"
}
export enum VideoClipSort {
    top = "top",
    trending = "trending",
    newest = "newest"
}
export enum WalletActivityType {
    mintCost = "mintCost",
    deposit = "deposit",
    withdrawal = "withdrawal",
    auctionPayout = "auctionPayout"
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
    /**
     * / Check for new incoming UTXOs on the caller's BTC deposit address using ICP's Bitcoin API.
     * / Credits balance for UTXOs with height > 0 (at least 1 confirmation).
     * / Tracks seen UTXO outpoints to prevent double-crediting.
     */
    checkForNewDeposits(): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Check whether the caller is allowed to like (max 30 likes per minute;
     * / also blocks accounts created within the last 60 seconds).
     * / Returns #ok(true) when allowed, #err with a human-readable message when blocked.
     */
    checkLikeRateLimit(): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Check whether the caller is allowed to mint (max 10 mints per 10 minutes).
     * / Returns #ok(true) when allowed, #err with a human-readable message when blocked.
     */
    checkMintRateLimit(): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Re-check pending deposits using the ICP Bitcoin API.
     * / Confirms deposits whose UTXO now has >= 1 confirmation and credits balance.
     */
    confirmPendingDeposits(): Promise<{
        __kind__: "ok";
        ok: bigint;
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
    /**
     * / Call the ckBTC minter canister to get the unique deposit address for the caller.
     * / The ckBTC minter returns a real Bitcoin address (bech32 bc1... or P2PKH 1...) for the user.
     * / Only call this when the wallet exists but btcAddress is empty.
     * / Retries up to 3 times on empty address (minter occasionally returns empty on first call).
     * / On success: stores the address permanently and returns {#ok: address}.
     * / On empty response after all retries or any error: returns {#err: real error message}.
     */
    createDepositAddress(): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
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
    /**
     * / Returns merged wallet activity (deposits + payouts + mint costs) newest-first.
     */
    getAllWalletActivity(): Promise<Array<WalletActivity>>;
    /**
     * / Get the bonding curve state for a single clip.
     */
    getBondingCurveState(clipId: string): Promise<BondingCurveState | null>;
    /**
     * / Batch-fetch bonding curve states for multiple clips (for feed rendering).
     */
    getBondingCurveStates(clipIds: Array<string>): Promise<Array<BondingCurveState>>;
    /**
     * / Returns the current USD/BTC rate used for conversions.
     * / Defaults to 50000 if no live rate is set.
     */
    getBtcRate(): Promise<number>;
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
     * / Get all clips together with their bonding curve state in one call.
     */
    getClipsWithCurveState(): Promise<Array<[VideoClip, BondingCurveState | null]>>;
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
    /**
     * / Returns the caller's in-app BTC balance in e8s (from UserWallet).
     * / Displayed on the frontend as BTC (e8s / 100_000_000).
     */
    getMyBalance(): Promise<bigint>;
    /**
     * / Returns an earnings summary for the calling principal.
     * / Sums splits where role == "creator" or role == "seller".
     */
    getMyEarnings(): Promise<EarningsSummary>;
    /**
     * / Returns all purchases made by the calling principal.
     */
    getMyPurchases(): Promise<Array<PurchaseRecord>>;
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
    /**
     * / Returns or creates a UserWallet for the caller with an empty btcAddress.
     * / Does NOT call the Bitcoin API — address generation is deferred to createDepositAddress().
     */
    getOrCreateUserWallet(): Promise<UserWallet>;
    /**
     * / Returns the caller's BTC deposit address as their payment address.
     * / All payments are in BTC — no internal payment terminology exposed.
     * / Returns #err if address has not been derived yet (call getUserDepositAddress first).
     */
    getPaymentAddress(): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getPokemonSets(): Promise<Array<TcgSet>>;
    getPriceHistory(clipId: string): Promise<Array<PricePoint>>;
    /**
     * / Returns ALL price points for a clip, sorted chronologically (oldest first).
     * / This is the primary endpoint for rendering complete chart data.
     */
    getPriceHistoryFull(clipId: string): Promise<Array<PricePoint>>;
    /**
     * / Returns summary statistics for a clip's sales history.
     * / Useful for chart header stats (total sold, price range, latest activity).
     */
    getPriceHistorySummary(clipId: string): Promise<PriceHistorySummary>;
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
     * / Get trending hashtags sorted by like score descending.
     * / Returns (tag, post_count) pairs.
     */
    getTrendingHashtags(): Promise<Array<[string, bigint]>>;
    /**
     * / Get trending hashtags with a hot flag.
     * / Returns (tag, post_count, is_hot) — is_hot is true for tags in the top 3 by like score.
     */
    getTrendingHashtagsWithHotFlag(): Promise<Array<[string, bigint, boolean]>>;
    getUserCollectibles(user: Principal): Promise<Array<Collectible>>;
    /**
     * / Returns the caller's unique ckBTC deposit address.
     * / If the wallet has a valid cached address, returns it immediately.
     * / If the address is empty or invalid, calls createDepositAddress() once and returns its result.
     * / Never retries — one attempt at most.
     * / Logs: caller principal, cached address result, and any errors.
     */
    getUserDepositAddress(): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Returns all deposits (pending and confirmed) for the caller.
     */
    getUserDeposits(): Promise<Array<Deposit>>;
    getUserPacks(user: Principal): Promise<Array<Pack>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Retrieve raw video/preview blob data by asset_id.
     */
    getVideoBlob(asset_id: string): Promise<VideoAsset | null>;
    /**
     * / Initialize bonding curve state for a newly created clip.
     * / Only callable by the clip's creator.
     */
    initBondingCurve(clipId: string): Promise<{
        __kind__: "ok";
        ok: BondingCurveState;
    } | {
        __kind__: "err";
        err: string;
    }>;
    isAdmin(): Promise<boolean>;
    /**
     * / Like a clip. Returns new like_count on success.
     * / Returns #err with a message on rate-limit, duplicate like, or account-too-new.
     */
    likeClip(clip_id: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    makeOffer(listingId: bigint, offerPriceUsd: number): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    openPack(packId: string): Promise<PackOpenResult>;
    /**
     * / Process a $1 mint fee deducted from creator's in-app balance → platform.
     * / Returns the internal transaction ID.
     */
    processClipMint(creatorPrincipal: Principal): Promise<bigint>;
    /**
     * / Process a bonding curve copy sale via in-app balance.
     * / 95% to creator, 5% to platform — deducted from buyer's balance.
     */
    processCopySale(clipId: string, creatorPrincipal: Principal, buyerPrincipal: Principal, usdAmount: number): Promise<bigint>;
    /**
     * / Process a secondary trade via in-app balance.
     * / 4% to original creator, 1% to platform, 95% to seller — deducted from buyer's balance.
     */
    processSecondaryTrade(clipId: string, originalCreatorPrincipal: Principal, sellerPrincipal: Principal, buyerPrincipal: Principal, usdAmount: number): Promise<bigint>;
    /**
     * / Process a copy sale deducting buyer's wallet balance and crediting creator.
     */
    processWalletCopySale(clipId: string, creatorPrincipal: Principal, usdAmount: number): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Process a $1 mint fee deducting from user's in-app wallet balance.
     * / Returns #err("insufficient balance") if user cannot afford it.
     */
    processWalletMint(clipId: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Process a secondary trade deducting buyer and crediting seller + creator.
     */
    processWalletSecondaryTrade(clipId: string, originalCreatorPrincipal: Principal, sellerPrincipal: Principal, usdAmount: number): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Process a BTC withdrawal from the caller's in-app balance to an external BTC address.
     * / Deducts balance immediately to prevent double-spend; refunds on failure.
     * / Returns #ok("sent") on success, #err(reason) on failure.
     */
    processWithdrawal(amountE8s: bigint, recipientAddress: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Buy a copy of a clip. Assigns an edition number, stores the purchase as #pending,
     * / and promotes all purchases to #minted when all 1000 copies are sold.
     */
    recordPurchase(clipId: string, pricePaid: number): Promise<{
        __kind__: "ok";
        ok: PurchaseRecord;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Record a video hash for the caller. Returns #err("duplicate") if the hash
     * / was already submitted by any user, otherwise records it and returns #ok(true).
     */
    recordVideoHash(hash: string): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Clears the caller's cached BTC deposit address without re-deriving.
     * / The next call to getUserDepositAddress() will trigger createDepositAddress().
     */
    resetUserDepositAddress(): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchSetsByName(searchTerm: string): Promise<Array<TcgSet>>;
    /**
     * / Admin: update the BTC/USD rate used for e8s conversions.
     */
    setBtcRate(rate: number): Promise<void>;
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
    /**
     * / Fire-and-forget wallet initialization on login.
     * / Creates the wallet record if it doesn't exist (with empty btcAddress).
     * / Does NOT call the Bitcoin API — address generation is deferred to createDepositAddress().
     */
    warmupDepositAddress(): Promise<void>;
}
