import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import Debug "mo:core/Debug";
import Error "mo:core/Error";



actor {
  // ─── ICP Native Bitcoin Integration ──────────────────────────────────────
  // Uses the IC management canister for Bitcoin address derivation and UTXO queries.
  // All amounts are in e8s / satoshis (1 BTC = 100_000_000 satoshis).

  type BitcoinNetwork = { #Mainnet; #Testnet; #Regtest };

  type Satoshi = Nat64;

  type OutPoint = {
    txid : Blob;
    vout : Nat32;
  };

  type Utxo = {
    outpoint : OutPoint;
    value : Satoshi;
    height : Nat32;
  };

  type GetUtxosRequest = {
    address : Text;
    network : BitcoinNetwork;
    filter : ?{ #MinConfirmations : Nat32; #Page : Blob };
  };

  type GetUtxosResponse = {
    utxos : [Utxo];
    tip_block_hash : Blob;
    tip_height : Nat32;
    next_page : ?Blob;
  };

  type GetP2pkhAddressRequest = {
    network : BitcoinNetwork;
    derivation_path : [Blob];
  };

  // Management canister — Bitcoin API
  // NOTE: ic is split into two bindings to preserve stable compatibility.
  // The original ic binding (2 methods) matches the previously-deployed type;
  // icBtcSend adds bitcoin_send_transaction without mutating the ic type.
  let ic : actor {
    bitcoin_get_utxos : (GetUtxosRequest) -> async GetUtxosResponse;
    bitcoin_get_p2pkh_address : (GetP2pkhAddressRequest) -> async Text;
  } = actor ("aaaaa-aa");

  let icBtcSend : actor {
    bitcoin_send_transaction : ({ transaction : Blob; network : BitcoinNetwork }) -> async ();
  } = actor ("aaaaa-aa");

  // Use Mainnet for production. Swap to #Regtest for local dfx testing.
  let _btcNetwork : BitcoinNetwork = #Mainnet;

  // ─────────────────────────────────────────────
  // INLINE ACCESS CONTROL (replaces missing authorization/ package)
  // ─────────────────────────────────────────────

  // Preserved for stable state compatibility (previously used for seed clips).
  var _seedBase : Int = 0;

  type UserRole = { #admin; #user; #guest };

  // role storage: principal → role
  let roleMap = Map.empty<Principal, UserRole>();
  var firstAdminSet : Bool = false;

  func _isAdmin(caller : Principal) : Bool {
    switch (roleMap.get(caller)) {
      case (? #admin) true;
      case _ false;
    };
  };

  func _hasPermission(caller : Principal, required : UserRole) : Bool {
    let role : UserRole = switch (roleMap.get(caller)) {
      case (?r) r;
      case null #guest;
    };
    switch (required) {
      case (#guest) true;
      case (#user) {
        switch (role) {
          case (#admin) true;
          case (#user) true;
          case (#guest) false;
        };
      };
      case (#admin) {
        switch (role) {
          case (#admin) true;
          case _ false;
        };
      };
    };
  };

  // Auto-promote: first caller who hits a "user" action becomes admin
  func _ensureRegistered(caller : Principal) {
    if (not caller.isAnonymous()) {
      switch (roleMap.get(caller)) {
        case null {
          let newRole : UserRole = if (not firstAdminSet) {
            firstAdminSet := true;
            #admin;
          } else {
            #user;
          };
          roleMap.add(caller, newRole);
        };
        case _ {};
      };
    };
  };

  // Authorization public endpoints (replaces MixinAuthorization mixin)
  public shared ({ caller }) func assignRole(user : Principal, role : UserRole) : async () {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can assign roles");
    roleMap.add(user, role);
  };

  public query ({ caller }) func getMyRole() : async UserRole {
    switch (roleMap.get(caller)) {
      case (?r) r;
      case null #guest;
    };
  };

  public query ({ caller }) func isAdmin() : async Bool {
    _isAdmin(caller);
  };

  // ─────────────────────────────────────────────
  // EXISTING TYPES
  // ─────────────────────────────────────────────

  type Track = {
    title : Text;
    duration : Nat;
  };

  type Album = {
    id : Text;
    title : Text;
    artist : Text;
    collectionName : Text;
    totalSupply : Nat;
    tracklist : [Track];
    coverImageUrl : Text;
  };

  type Edition = {
    albumId : Text;
    editionNumber : Nat;
    ownerId : Principal;
  };

  type Release = {
    album : Album;
    mintedCount : Nat;
    mintOpenTime : Int;
    isActive : Bool;
    floorPrice : Nat;
    lastSoldPrice : Nat;
    ownersCount : Nat;
  };

  type MarketListing = {
    editionId : Nat;
    price : Nat;
    seller : Principal;
  };

  public type TcgCategory = {
    id : Nat;
    name : Text;
    slug : Text;
    imageUrl : Text;
    isActive : Bool;
    sortOrder : Nat;
  };

  public type CreateTcgCategoryInput = {
    name : Text;
    slug : Text;
    imageUrl : Text;
    isActive : Bool;
    sortOrder : Nat;
  };

  public type UpdateTcgCategoryInput = {
    id : Nat;
    name : Text;
    slug : Text;
    imageUrl : Text;
    isActive : Bool;
    sortOrder : Nat;
  };

  public type TcgSet = {
    id : Nat;
    tcgCategory : Text;
    setName : Text;
    setCode : Text;
    releaseYear : Nat;
    coverImageUrl : Text;
    slug : Text;
    isActive : Bool;
    sortOrder : Nat;
    cardCount : ?Nat;
    featured : Bool;
  };

  public type CreateTcgSetInput = {
    tcgCategory : Text;
    setName : Text;
    setCode : Text;
    releaseYear : Nat;
    coverImageUrl : Text;
    slug : Text;
    isActive : Bool;
    sortOrder : Nat;
    cardCount : ?Nat;
    featured : Bool;
  };

  public type UpdateTcgSetInput = {
    id : Nat;
    tcgCategory : Text;
    setName : Text;
    setCode : Text;
    releaseYear : Nat;
    coverImageUrl : Text;
    slug : Text;
    isActive : Bool;
    sortOrder : Nat;
    cardCount : ?Nat;
    featured : Bool;
  };

  public type TcgCard = {
    id : Nat;
    setId : Nat;
    cardName : Text;
    cardNumber : Text;
    rarity : Text;
    imageUrl : Text;
    isActive : Bool;
    isSupported : Bool;
    sortOrder : Nat;
  };

  public type CreateTcgCardInput = {
    setId : Nat;
    cardName : Text;
    cardNumber : Text;
    rarity : Text;
    imageUrl : Text;
    isActive : Bool;
    isSupported : Bool;
    sortOrder : Nat;
  };

  public type UpdateTcgCardInput = {
    id : Nat;
    setId : Nat;
    cardName : Text;
    cardNumber : Text;
    rarity : Text;
    imageUrl : Text;
    isActive : Bool;
    isSupported : Bool;
    sortOrder : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // --- PACK / COLLECTIBLE TYPES ---

  public type PackStatus = { #sealed; #opened };

  public type CollectibleMediaType = { #video; #photo };

  public type Pack = {
    id : Text;
    releaseId : Text;
    ownerPrincipal : Principal;
    status : PackStatus;
    serialNumber : Nat;
    collectibleId : ?Text;
    openedAt : ?Int;
    setName : Text;
    coverImageUrl : Text;
    totalSupply : Nat;
    packCount : Nat;
    createdAt : Int;
  };

  public type Collectible = {
    id : Text;
    packId : Text;
    ownerPrincipal : Principal;
    setName : Text;
    releaseId : Text;
    mediaType : CollectibleMediaType;
    editionNumber : Nat;
    totalSupply : Nat;
    typeSupply : Nat;
    rarity : Text;
    imageUrl : Text;
    title : Text;
    creator : Text;
    mintDate : Text;
    openedAt : Int;
  };

  public type PackOpenResult = { #ok : Collectible; #err : Text };

  public type AddPackInput = {
    id : Text;
    releaseId : Text;
    ownerPrincipal : Principal;
    serialNumber : Nat;
    setName : Text;
    coverImageUrl : Text;
    totalSupply : Nat;
    packCount : Nat;
  };

  // ─────────────────────────────────────────────
  // VIDEO CLIP TYPES
  // ─────────────────────────────────────────────

  public type VideoClipSort = { #newest; #trending; #top };

  public type LikeResult = { #ok : Nat; #alreadyLiked; #notFound };

  // Internal clip record — stores mutable like_timestamps as array for shared API
  public type VideoClip = {
    clip_id : Text;
    creator_principal_id : Principal;
    video_file_url : Text;
    preview_loop_url : Text;
    timestamp : Int;
    title : ?Text;
    hashtags : [Text];
    explicit_flag : Bool;
    like_count : Nat;
    like_timestamps : [(Principal, Int)];
    // Retained for schema compatibility (previously used in viral score computation)
    likes_last_hour : Nat;
    likes_last_6_hours : Nat;
    likes_last_24_hours : Nat;
  };

  // Stored video blob metadata
  public type VideoAsset = {
    asset_id : Text;
    owner : Principal;
    content_type : Text; // "video/mp4"
    data : Blob;
    created_at : Int;
  };

  // ─────────────────────────────────────────────
  // WALLET TYPES
  // ─────────────────────────────────────────────

  public type ConfirmationStatus = { #pending; #confirmed };

  public type Deposit = {
    depositId : Text;
    timestamp : Int;
    btcAmountE8s : Nat;
    confirmationStatus : ConfirmationStatus;
    txid : Text;       // on-chain txid
  };

  public type PayoutType = { #copySale; #secondaryRoyalty; #auctionWin };

  public type Payout = {
    payoutId : Text;
    timestamp : Int;
    btcAmountE8s : Nat;
    payoutType : PayoutType;
    clipId : Text;
  };

  public type UserWallet = {
    walletPrincipalId : Principal;
    btcAddress : Text;
    btcBalanceE8s : Nat;
    usdValueRef : Float;
    deposits : [Deposit];
    payouts : [Payout];
  };

  public type WalletActivityType = { #deposit; #mintCost; #auctionPayout; #withdrawal };

  public type WalletActivity = {
    activityType : WalletActivityType;
    btcAmountE8s : Nat;
    timestamp : Int;
    status : { #pending; #confirmed };
    description : Text;
  };

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────

  let albums = Map.empty<Text, Album>();
  let releases = Map.empty<Text, Release>();
  let marketListings = Map.empty<Nat, MarketListing>();

  // Categories
  let tcgCategories = Map.empty<Nat, TcgCategory>();
  var nextCategoryId = 5;

  // Seed 4 default categories
  tcgCategories.add(1, { id = 1; name = "Pokemon"; slug = "pokemon"; imageUrl = ""; isActive = true; sortOrder = 1 });
  tcgCategories.add(2, { id = 2; name = "One Piece"; slug = "one-piece"; imageUrl = ""; isActive = true; sortOrder = 2 });
  tcgCategories.add(3, { id = 3; name = "Yu-Gi-Oh"; slug = "yu-gi-oh"; imageUrl = ""; isActive = true; sortOrder = 3 });
  tcgCategories.add(4, { id = 4; name = "Sports"; slug = "sports"; imageUrl = ""; isActive = true; sortOrder = 4 });

  // Sets
  let tcgSets = Map.empty<Nat, TcgSet>();
  var nextTcgSetId = 17;

  // Cards
  let tcgCards = Map.empty<Nat, TcgCard>();
  var nextCardId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Packs and collectibles
  let packs = Map.empty<Text, Pack>();
  let collectibles = Map.empty<Text, Collectible>();
  var nextCollectibleSeq : Nat = 1;

  // Video clips
  let videoClips = Map.empty<Text, VideoClip>();
  var nextClipSeq : Nat = 1;

  // Raw video blob storage — key: asset_id → VideoAsset
  let videoAssets = Map.empty<Text, VideoAsset>();
  var nextAssetSeq : Nat = 1;

  // ─────────────────────────────────────────────
  // WALLET STATE
  // ─────────────────────────────────────────────

  // principal → UserWallet (TrieMap-style — using Map for future currency expansion)
  let userWallets = Map.empty<Principal, UserWallet>();
  var nextDepositSeq : Nat = 1;
  var nextPayoutSeq : Nat = 1;

  // UTXO outpoint dedup: principal → Set of "txid_hex:vout" strings seen/credited
  // Prevents double-crediting the same UTXO if checkForNewDeposits is called multiple times.
  let seenUtxos = Map.empty<Principal, [Text]>();

  // ─────────────────────────────────────────────
  // COMPARATORS
  // ─────────────────────────────────────────────

  module TcgCategory {
    public func compare(a : TcgCategory, b : TcgCategory) : Order.Order {
      Nat.compare(a.sortOrder, b.sortOrder);
    };
  };

  module TcgSet {
    public func compare(tcg1 : TcgSet, tcg2 : TcgSet) : Order.Order {
      switch (Nat.compare(tcg1.sortOrder, tcg2.sortOrder)) {
        case (#less) { #less };
        case (#greater) { #greater };
        case (#equal) {
          Nat.compare(tcg2.releaseYear, tcg1.releaseYear);
        };
      };
    };
  };

  module TcgCard {
    public func compare(a : TcgCard, b : TcgCard) : Order.Order {
      Nat.compare(a.sortOrder, b.sortOrder);
    };
  };

  module Album {
    public func compare(album1 : Album, album2 : Album) : Order.Order {
      Text.compare(album1.id, album2.id);
    };
  };

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  // ─────────────────────────────────────────────
  // PACK FUNCTIONS
  // ─────────────────────────────────────────────

  func countTypeForRelease(releaseId : Text) : Nat {
    var count : Nat = 0;
    for (c in collectibles.values()) {
      if (c.releaseId == releaseId) { count += 1 };
    };
    count;
  };

  public shared ({ caller = _ }) func addPack(input : AddPackInput) : async () {
    let pack : Pack = {
      id = input.id;
      releaseId = input.releaseId;
      ownerPrincipal = input.ownerPrincipal;
      status = #sealed;
      serialNumber = input.serialNumber;
      collectibleId = null;
      openedAt = null;
      setName = input.setName;
      coverImageUrl = input.coverImageUrl;
      totalSupply = input.totalSupply;
      packCount = input.packCount;
      createdAt = Time.now();
    };
    packs.add(input.id, pack);
  };

  public shared ({ caller }) func openPack(packId : Text) : async PackOpenResult {
    switch (packs.get(packId)) {
      case (null) { return #err("Pack not found") };
      case (?pack) {
        if (pack.ownerPrincipal != caller) {
          return #err("You do not own this pack");
        };
        switch (pack.status) {
          case (#opened) { return #err("Pack has already been opened") };
          case (#sealed) {
            let now = Time.now();
            let lockedPack : Pack = { pack with status = #opened; openedAt = ?now };
            packs.add(packId, lockedPack);

            let editionNumber = countTypeForRelease(pack.releaseId) + 1;
            let seqStr = nextCollectibleSeq.toText();
            nextCollectibleSeq += 1;
            let collectibleId = "col_" # packId # "_" # seqStr;
            let title = "Video #" # editionNumber.toText() # " \u{2014} " # pack.setName;

            let collectible : Collectible = {
              id = collectibleId;
              packId = packId;
              ownerPrincipal = caller;
              setName = pack.setName;
              releaseId = pack.releaseId;
              mediaType = #video;
              editionNumber = editionNumber;
              totalSupply = pack.totalSupply;
              typeSupply = pack.totalSupply;
              rarity = "Rare";
              imageUrl = pack.coverImageUrl;
              title = title;
              creator = "";
              mintDate = now.toText();
              openedAt = now;
            };

            collectibles.add(collectibleId, collectible);
            packs.add(packId, { lockedPack with collectibleId = ?collectibleId });
            return #ok(collectible);
          };
        };
      };
    };
  };

  public query ({ caller }) func getUserPacks(user : Principal) : async [Pack] {
    if (caller != user and not _isAdmin(caller)) {
      Runtime.trap("Unauthorized");
    };
    packs.values().toArray().filter(func(p : Pack) : Bool { p.ownerPrincipal == user });
  };

  public query ({ caller }) func getUserCollectibles(user : Principal) : async [Collectible] {
    if (caller != user and not _isAdmin(caller)) {
      Runtime.trap("Unauthorized");
    };
    collectibles.values().toArray().filter(func(c : Collectible) : Bool { c.ownerPrincipal == user });
  };

  public query ({ caller }) func getCallerPacks() : async [Pack] {
    packs.values().toArray().filter(func(p : Pack) : Bool { p.ownerPrincipal == caller });
  };

  public query ({ caller }) func getCallerCollectibles() : async [Collectible] {
    collectibles.values().toArray().filter(func(c : Collectible) : Bool { c.ownerPrincipal == caller });
  };

  // ─────────────────────────────────────────────
  // USER PROFILE FUNCTIONS
  // ─────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not _isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    _ensureRegistered(caller);
    userProfiles.add(caller, profile);
  };

  // ─────────────────────────────────────────────
  // COLLECTIBLE MARKETPLACE FUNCTIONS
  // ─────────────────────────────────────────────

  public shared ({ caller }) func addAlbum(album : Album) : async () {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can add albums");
    albums.add(album.id, album);
  };

  public shared ({ caller }) func addRelease(release : Release) : async () {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can add releases");
    releases.add(release.album.id, release);
  };

  public query func getAlbums() : async [Album] {
    albums.values().toArray().sort();
  };

  public query func getReleases() : async [Release] {
    releases.values().toArray();
  };

  public query func getMarketListings() : async [MarketListing] {
    marketListings.values().toArray();
  };

  public query func getAlbumById(id : Text) : async ?Album {
    albums.get(id);
  };

  // ─────────────────────────────────────────────
  // CATEGORY FUNCTIONS
  // ─────────────────────────────────────────────

  public shared ({ caller }) func createCategory(input : CreateTcgCategoryInput) : async TcgCategory {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can create categories");
    let newCat : TcgCategory = { input with id = nextCategoryId };
    tcgCategories.add(nextCategoryId, newCat);
    nextCategoryId += 1;
    newCat;
  };

  public shared ({ caller }) func updateCategory(input : UpdateTcgCategoryInput) : async TcgCategory {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can update categories");
    if (not tcgCategories.containsKey(input.id)) Runtime.trap("Category not found");
    let updated : TcgCategory = { input with id = input.id };
    tcgCategories.add(input.id, updated);
    updated;
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can delete categories");
    tcgCategories.remove(id);
  };

  public shared ({ caller }) func toggleCategoryActive(id : Nat) : async () {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can toggle categories");
    switch (tcgCategories.get(id)) {
      case (?cat) { tcgCategories.add(id, { cat with isActive = not cat.isActive }) };
      case (null) { Runtime.trap("Category not found") };
    };
  };

  public query func getCategories() : async [TcgCategory] {
    tcgCategories.values().toArray().filter(func(c) { c.isActive }).sort();
  };

  public query ({ caller }) func getAllCategoriesAdmin() : async [TcgCategory] {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can view all categories");
    tcgCategories.values().toArray().sort();
  };

  // ─────────────────────────────────────────────
  // TCG SET FUNCTIONS
  // ─────────────────────────────────────────────

  public shared ({ caller }) func createSet(input : CreateTcgSetInput) : async TcgSet {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can create TCG sets");
    let newSet : TcgSet = { input with id = nextTcgSetId };
    tcgSets.add(nextTcgSetId, newSet);
    nextTcgSetId += 1;
    newSet;
  };

  public shared ({ caller }) func updateSet(input : UpdateTcgSetInput) : async TcgSet {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can update TCG sets");
    if (not tcgSets.containsKey(input.id)) Runtime.trap("TCG set not found");
    let updatedSet : TcgSet = { input with id = input.id };
    tcgSets.add(input.id, updatedSet);
    updatedSet;
  };

  public shared ({ caller }) func deleteSet(id : Nat) : async () {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can delete TCG sets");
    tcgSets.remove(id);
  };

  public shared ({ caller }) func toggleSetActive(id : Nat) : async () {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can toggle TCG sets");
    switch (tcgSets.get(id)) {
      case (?set) { tcgSets.add(id, { set with isActive = not set.isActive }) };
      case (null) { Runtime.trap("TCG set not found") };
    };
  };

  public query func getSets() : async [TcgSet] {
    tcgSets.values().toArray().filter(func(set) { set.isActive }).sort();
  };

  public query ({ caller }) func getAllSetsAdmin() : async [TcgSet] {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can get all sets");
    tcgSets.values().toArray().sort();
  };

  public query func getSetsByCategory(categorySlug : Text) : async [TcgSet] {
    tcgSets.values().toArray().filter(func(set) { set.isActive and set.tcgCategory == categorySlug }).sort();
  };

  public query func getSetBySlug(slug : Text) : async ?TcgSet {
    tcgSets.values().toArray().find(func(set) { set.slug == slug });
  };

  public query func getSetById(id : Nat) : async ?TcgSet {
    tcgSets.get(id);
  };

  public query func searchSetsByName(searchTerm : Text) : async [TcgSet] {
    tcgSets.values().toArray().filter(func(set) { set.setName.contains(#text searchTerm) });
  };

  public query func getFeaturedSets() : async [TcgSet] {
    tcgSets.values().toArray().filter(func(set) { set.featured });
  };

  public query func getPokemonSets() : async [TcgSet] {
    tcgSets.values().toArray().filter(func(set) { set.tcgCategory == "pokemon" });
  };

  // ─────────────────────────────────────────────
  // CARD FUNCTIONS
  // ─────────────────────────────────────────────

  public shared ({ caller }) func createCard(input : CreateTcgCardInput) : async TcgCard {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can create cards");
    let newCard : TcgCard = { input with id = nextCardId };
    tcgCards.add(nextCardId, newCard);
    nextCardId += 1;
    newCard;
  };

  public shared ({ caller }) func updateCard(input : UpdateTcgCardInput) : async TcgCard {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can update cards");
    if (not tcgCards.containsKey(input.id)) Runtime.trap("Card not found");
    let updated : TcgCard = { input with id = input.id };
    tcgCards.add(input.id, updated);
    updated;
  };

  public shared ({ caller }) func deleteCard(id : Nat) : async () {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can delete cards");
    tcgCards.remove(id);
  };

  public shared ({ caller }) func toggleCardActive(id : Nat) : async () {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can toggle cards");
    switch (tcgCards.get(id)) {
      case (?card) { tcgCards.add(id, { card with isActive = not card.isActive }) };
      case (null) { Runtime.trap("Card not found") };
    };
  };

  public shared ({ caller }) func toggleCardSupported(id : Nat) : async () {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can toggle card support");
    switch (tcgCards.get(id)) {
      case (?card) { tcgCards.add(id, { card with isSupported = not card.isSupported }) };
      case (null) { Runtime.trap("Card not found") };
    };
  };

  public query func getCardsBySet(setId : Nat) : async [TcgCard] {
    tcgCards.values().toArray().filter(func(c) { c.isActive and c.setId == setId }).sort();
  };

  public query ({ caller }) func getAllCardsAdmin() : async [TcgCard] {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can view all cards");
    tcgCards.values().toArray().sort();
  };

  public query ({ caller }) func getCardsBySetAdmin(setId : Nat) : async [TcgCard] {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized: Only admins can view all cards");
    tcgCards.values().toArray().filter(func(c) { c.setId == setId }).sort();
  };

  // ─────────────────────────────────────────────
  // VIDEO CLIP FUNCTIONS
  // ─────────────────────────────────────────────

  /// Create a new video clip post. Returns the generated clip_id.
  public shared ({ caller }) func createClip(
    video_file_url : Text,
    preview_loop_url : Text,
    title : ?Text,
    hashtags : [Text],
    explicit_flag : Bool,
  ) : async Text {
    _ensureRegistered(caller);

    // --- Mint rate limit check (inline) ---
    let rl = _getOrCreateRateLimit(caller);
    let now = Time.now();
    let tenMinNs : Int = 600_000_000_000;
    let recentMints = rl.mintTimestamps.filter(func(ts : Int) : Bool {
      now - ts <= tenMinNs
    });
    if (recentMints.size() >= 10) {
      Runtime.trap("Mint limit reached. Try again shortly.");
    };
    // Record this mint timestamp
    let updatedRl : AccountRateLimit = { rl with
      mintTimestamps = recentMints.concat([now]);
    };
    accountRateLimits.add(caller, updatedRl);

    let seq = nextClipSeq.toText();
    nextClipSeq += 1;
    let clip_id = "clip_" # seq;
    let clip : VideoClip = {
      clip_id;
      creator_principal_id = caller;
      video_file_url;
      preview_loop_url;
      timestamp = now;
      title;
      hashtags;
      explicit_flag;
      like_count = 0;
      like_timestamps = [];
      likes_last_hour = 0;
      likes_last_6_hours = 0;
      likes_last_24_hours = 0;
    };
    videoClips.add(clip_id, clip);

    // Auto-initialize bonding curve for the new clip
    _initBondingCurveInternal(clip_id);

    clip_id;
  };

  /// Fetch clips sorted by newest, trending (viral score), or top (total likes).
  /// safeView=true hides explicit clips.
  public query func getClips(sortBy : VideoClipSort, safeView : Bool) : async [VideoClip] {
    let all = videoClips.values().toArray().filter(func(c : VideoClip) : Bool {
      if (safeView and c.explicit_flag) false else true
    });
    switch (sortBy) {
      case (#newest) {
        all.sort(func(a : VideoClip, b : VideoClip) : Order.Order {
          Int.compare(b.timestamp, a.timestamp)
        });
      };
      case (#trending) {
        all.sort(func(a : VideoClip, b : VideoClip) : Order.Order {
          Nat.compare(b.like_count, a.like_count)
        });
      };
      case (#top) {
        all.sort(func(a : VideoClip, b : VideoClip) : Order.Order {
          Nat.compare(b.like_count, a.like_count)
        });
      };
    };
  };

  /// Like a clip. Returns new like_count on success.
  /// Returns #err with a message on rate-limit, duplicate like, or account-too-new.
  public shared ({ caller }) func likeClip(clip_id : Text) : async { #ok : Nat; #err : Text } {
    // --- Rate limit check (inline) ---
    let rl = _getOrCreateRateLimit(caller);
    let now = Time.now();
    let sixtySecNs : Int = 60_000_000_000;
    if (now - rl.accountCreatedAt < sixtySecNs) {
      return #err("Account too new to like");
    };
    let recentLikes = rl.likeTimestamps.filter(func(ts : Int) : Bool {
      now - ts <= sixtySecNs
    });
    if (recentLikes.size() >= 30) {
      return #err("Like limit reached. Try again in a moment.");
    };

    switch (videoClips.get(clip_id)) {
      case (null) { #err("Clip not found") };
      case (?clip) {
        // Check duplicate
        let alreadyLiked = clip.like_timestamps.find(func(entry : (Principal, Int)) : Bool {
          Principal.equal(entry.0, caller)
        }) != null;
        if (alreadyLiked) return #err("Already liked");

        let newTimestamps = clip.like_timestamps.concat([(caller, now)]);
        let updated : VideoClip = { clip with
          like_count = clip.like_count + 1;
          like_timestamps = newTimestamps;
        };
        videoClips.add(clip_id, updated);

        // Record this like timestamp in rate limit tracker
        let trimmedLikes = rl.likeTimestamps.filter(func(ts : Int) : Bool {
          now - ts <= sixtySecNs
        });
        let updatedRl : AccountRateLimit = { rl with
          likeTimestamps = trimmedLikes.concat([now]);
        };
        accountRateLimits.add(caller, updatedRl);

        #ok(updated.like_count);
      };
    };
  };

  /// Get all clips created by a specific principal.
  public query func getCreatorClips(creator : Principal) : async [VideoClip] {
    videoClips.values().toArray().filter(func(c : VideoClip) : Bool {
      Principal.equal(c.creator_principal_id, creator)
    });
  };

  // Compute the total like count for a hashtag by summing across all clips with that tag.
  func hashtagLikeScore(tag : Text) : Nat {
    var score : Nat = 0;
    let lowerTag = tag.toLower();
    for (clip in videoClips.values()) {
      let hasTag = clip.hashtags.find(func(h : Text) : Bool {
        h.toLower() == lowerTag
      }) != null;
      if (hasTag) {
        score += clip.like_count;
      };
    };
    score;
  };

  // Internal helper: build (tag, postCount, likeScore) triples for all tags.
  func _buildTagStats() : [(Text, Nat, Nat)] {
    let tagCounts = Map.empty<Text, Nat>();
    for (clip in videoClips.values()) {
      for (tag in clip.hashtags.values()) {
        let lowerTag = tag.toLower();
        let current = switch (tagCounts.get(lowerTag)) {
          case (?n) n;
          case null 0;
        };
        tagCounts.add(lowerTag, current + 1);
      };
    };
    // Build triples with like scores
    tagCounts.toArray().map<(Text, Nat), (Text, Nat, Nat)>(
      func((tag, count)) {
        (tag, count, hashtagLikeScore(tag))
      }
    );
  };

  /// Get trending hashtags sorted by like score descending.
  /// Returns (tag, post_count) pairs.
  public query func getTrendingHashtags() : async [(Text, Nat)] {
    let stats = _buildTagStats();
    let sorted = stats.sort(func(a : (Text, Nat, Nat), b : (Text, Nat, Nat)) : Order.Order {
      Nat.compare(b.2, a.2)
    });
    sorted.map<(Text, Nat, Nat), (Text, Nat)>(func((tag, count, _score)) { (tag, count) });
  };

  /// Get trending hashtags with a hot flag.
  /// Returns (tag, post_count, is_hot) — is_hot is true for tags in the top 3 by like score.
  public query func getTrendingHashtagsWithHotFlag() : async [(Text, Nat, Bool)] {
    let stats = _buildTagStats();
    let sorted = stats.sort(func(a : (Text, Nat, Nat), b : (Text, Nat, Nat)) : Order.Order {
      Nat.compare(b.2, a.2)
    });
    sorted.mapEntries<(Text, Nat, Nat), (Text, Nat, Bool)>(
      func((tag, count, _score), idx) {
        (tag, count, idx < 3)
      }
    );
  };

  /// Fetch clips filtered to a specific hashtag (case-insensitive), then sorted.
  public query func getClipsForHashtag(hashtag : Text, sortBy : VideoClipSort, safeView : Bool) : async [VideoClip] {
    let lowerTag = hashtag.toLower();
    let filtered = videoClips.values().toArray().filter(func(c : VideoClip) : Bool {
      let tagMatch = c.hashtags.find(func(h : Text) : Bool {
        h.toLower() == lowerTag
      }) != null;
      let safeOk = if (safeView) not c.explicit_flag else true;
      tagMatch and safeOk
    });
    switch (sortBy) {
      case (#newest) {
        filtered.sort(func(a : VideoClip, b : VideoClip) : Order.Order {
          Int.compare(b.timestamp, a.timestamp)
        });
      };
      case (#trending) {
        filtered.sort(func(a : VideoClip, b : VideoClip) : Order.Order {
          Nat.compare(b.like_count, a.like_count)
        });
      };
      case (#top) {
        filtered.sort(func(a : VideoClip, b : VideoClip) : Order.Order {
          Nat.compare(b.like_count, a.like_count)
        });
      };
    };
  };

  /// Fetch clips filtered to a specific hashtag.
  /// Delegates to getClipsForHashtag with newest sort and no safe view filter.
  public query func getClipsByHashtag(hashtag : Text) : async [VideoClip] {
    let lowerTag = hashtag.toLower();
    videoClips.values().toArray().filter(func(c : VideoClip) : Bool {
      c.hashtags.find(func(h : Text) : Bool { h.toLower() == lowerTag }) != null
    }).sort(func(a : VideoClip, b : VideoClip) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    });
  };

  // ─────────────────────────────────────────────
  // VIDEO BLOB STORAGE
  // Stores raw video bytes in canister state.
  // Returns a stable asset_id used as the video_file_url / preview_loop_url
  // when calling createClip().
  // ─────────────────────────────────────────────

  /// Upload a raw HD video blob (mp4). Returns asset_id to use as video_file_url.
  public shared ({ caller }) func uploadVideoBlob(
    data : Blob,
    content_type : Text,
  ) : async Text {
    _ensureRegistered(caller);
    let seqStr = nextAssetSeq.toText();
    nextAssetSeq += 1;
    let asset_id = "video_" # caller.toText() # "_" # seqStr;
    let asset : VideoAsset = {
      asset_id;
      owner = caller;
      content_type;
      data;
      created_at = Time.now();
    };
    videoAssets.add(asset_id, asset);
    asset_id;
  };

  /// Upload a raw preview clip blob (short 2s muted mp4). Returns asset_id to use as preview_loop_url.
  public shared ({ caller }) func uploadPreviewBlob(
    data : Blob,
    content_type : Text,
  ) : async Text {
    _ensureRegistered(caller);
    let seqStr = nextAssetSeq.toText();
    nextAssetSeq += 1;
    let asset_id = "preview_" # caller.toText() # "_" # seqStr;
    let asset : VideoAsset = {
      asset_id;
      owner = caller;
      content_type;
      data;
      created_at = Time.now();
    };
    videoAssets.add(asset_id, asset);
    asset_id;
  };

  /// Retrieve raw video/preview blob data by asset_id.
  public query func getVideoBlob(asset_id : Text) : async ?VideoAsset {
    videoAssets.get(asset_id);
  };

  // ─────────────────────────────────────────────
  // MARKETPLACE TYPES
  // ─────────────────────────────────────────────

  public type ListingStatus = { #active; #sold; #cancelled };

  public type Listing = {
    id : Nat;
    clipId : Text;
    editionNumber : Nat;
    totalEditions : Nat;
    sellerPrincipal : Principal;
    listPriceUsd : Float;
    listedAt : Int;
    status : ListingStatus;
  };

  public type OfferStatus = { #pending; #accepted; #declined };

  public type Offer = {
    id : Nat;
    listingId : Nat;
    buyerPrincipal : Principal;
    offerPriceUsd : Float;
    createdAt : Int;
    status : OfferStatus;
  };

  public type PricePoint = {
    editionNumber : Nat;
    salePrice : Float;
    timestamp : Int;
  };

  public type MarketCapEntry = {
    clipId : Text;
    title : Text;
    videoUrl : Text;
    previewUrl : Text;
    creatorName : Text;
    currentPriceUsd : Float;
    totalSupply : Nat;
    copiesSold : Nat;
    marketCapUsd : Float;
  };

  // ─────────────────────────────────────────────
  // MARKETPLACE STATE
  // ─────────────────────────────────────────────

  let listings = Map.empty<Nat, Listing>();
  let offers = Map.empty<Nat, Offer>();
  // priceHistory: clipId → ALL PricePoints, sorted chronologically (oldest first)
  let priceHistory = Map.empty<Text, [PricePoint]>();
  // copiesSold: clipId → number of copies sold via acceptOffer
  let marketCopiesSold = Map.empty<Text, Nat>();

  var listingCounter : Nat = 0;
  var offerCounter : Nat = 0;

  // Bonding curve constants
  let bondingCurveStartPrice : Float = 1.0;
  let bondingCurvePriceIncrement : Float = 0.01;

  // ─────────────────────────────────────────────
  // MARKETPLACE HELPERS
  // ─────────────────────────────────────────────

  func _getSoldCount(clipId : Text) : Nat {
    switch (marketCopiesSold.get(clipId)) {
      case (?n) n;
      case null 0;
    };
  };

  func _computeCurrentPrice(clipId : Text) : Float {
    // Use last sale price from history if available (points sorted oldest-first, so last = most recent)
    switch (priceHistory.get(clipId)) {
      case (?points) {
        let sz = points.size();
        if (sz > 0) {
          points[sz - 1].salePrice
        } else {
          bondingCurveStartPrice + (bondingCurvePriceIncrement * _getSoldCount(clipId).toFloat())
        }
      };
      case null {
        bondingCurveStartPrice + (bondingCurvePriceIncrement * _getSoldCount(clipId).toFloat())
      };
    };
  };

  // Internal: record a confirmed sale — appends to the end so array stays chronological (oldest first).
  // Stores ALL points — no truncation. Max 1000 per clip.
  func _recordSale(clipId : Text, editionNumber : Nat, salePrice : Float) {
    let now = Time.now();
    let newPoint : PricePoint = { editionNumber; salePrice; timestamp = now };

    let existing : [PricePoint] = switch (priceHistory.get(clipId)) {
      case (?pts) pts;
      case null [];
    };

    // Append new point at the end — keeps chronological order (oldest first)
    let updated = existing.concat([newPoint]);
    priceHistory.add(clipId, updated);

    // Increment copies sold
    let prev = _getSoldCount(clipId);
    marketCopiesSold.add(clipId, prev + 1);
  };

  // ─────────────────────────────────────────────
  // LISTING MANAGEMENT
  // ─────────────────────────────────────────────

  public shared ({ caller }) func createListing(
    clipId : Text,
    editionNumber : Nat,
    listPriceUsd : Float,
  ) : async { #ok : Nat; #err : Text } {
    if (editionNumber == 0 or editionNumber > 1000) {
      return #err("editionNumber must be between 1 and 1000");
    };
    if (listPriceUsd <= 0.0) {
      return #err("listPriceUsd must be greater than 0");
    };
    listingCounter += 1;
    let listingId = listingCounter;
    let listing : Listing = {
      id = listingId;
      clipId;
      editionNumber;
      totalEditions = 1000;
      sellerPrincipal = caller;
      listPriceUsd;
      listedAt = Time.now();
      status = #active;
    };
    listings.add(listingId, listing);
    #ok(listingId);
  };

  public shared ({ caller }) func cancelListing(listingId : Nat) : async { #ok : Bool; #err : Text } {
    switch (listings.get(listingId)) {
      case (null) { #err("Listing not found") };
      case (?listing) {
        if (not Principal.equal(listing.sellerPrincipal, caller)) {
          return #err("Unauthorized: only the seller can cancel this listing");
        };
        listings.add(listingId, { listing with status = #cancelled });
        #ok(true);
      };
    };
  };

  public query func getListings() : async [Listing] {
    let active = listings.values().toArray().filter(func(l : Listing) : Bool {
      switch (l.status) { case (#active) true; case _ false }
    });
    active.sort(func(a : Listing, b : Listing) : Order.Order {
      Int.compare(b.listedAt, a.listedAt)
    });
  };

  public query func getListingsByClip(clipId : Text) : async [Listing] {
    listings.values().toArray().filter(func(l : Listing) : Bool {
      l.clipId == clipId and (switch (l.status) { case (#active) true; case _ false })
    });
  };

  // ─────────────────────────────────────────────
  // OFFER SYSTEM
  // ─────────────────────────────────────────────

  public shared ({ caller }) func makeOffer(
    listingId : Nat,
    offerPriceUsd : Float,
  ) : async { #ok : Nat; #err : Text } {
    switch (listings.get(listingId)) {
      case (null) { #err("Listing not found") };
      case (?listing) {
        switch (listing.status) {
          case (#active) {};
          case _ { return #err("Listing is not active") };
        };
        if (Principal.equal(listing.sellerPrincipal, caller)) {
          return #err("Seller cannot make an offer on their own listing");
        };
        if (offerPriceUsd <= 0.0) {
          return #err("offerPriceUsd must be greater than 0");
        };
        offerCounter += 1;
        let offerId = offerCounter;
        let offer : Offer = {
          id = offerId;
          listingId;
          buyerPrincipal = caller;
          offerPriceUsd;
          createdAt = Time.now();
          status = #pending;
        };
        offers.add(offerId, offer);
        #ok(offerId);
      };
    };
  };

  public shared ({ caller }) func acceptOffer(offerId : Nat) : async { #ok : Bool; #err : Text } {
    switch (offers.get(offerId)) {
      case (null) { #err("Offer not found") };
      case (?offer) {
        switch (offer.status) {
          case (#pending) {};
          case _ { return #err("Offer is not pending") };
        };
        switch (listings.get(offer.listingId)) {
          case (null) { #err("Listing not found") };
          case (?listing) {
            if (not Principal.equal(listing.sellerPrincipal, caller)) {
              return #err("Unauthorized: only the seller can accept offers");
            };
            switch (listing.status) {
              case (#active) {};
              case _ { return #err("Listing is no longer active") };
            };

            // Accept this offer
            offers.add(offerId, { offer with status = #accepted });

            // Mark listing as sold
            listings.add(offer.listingId, { listing with status = #sold });

            // Decline all other pending offers on this listing
            for ((oid, o) in offers.entries()) {
              if (o.listingId == offer.listingId and oid != offerId) {
                switch (o.status) {
                  case (#pending) {
                    offers.add(oid, { o with status = #declined });
                  };
                  case _ {};
                };
              };
            };

            // Record the sale
            _recordSale(listing.clipId, listing.editionNumber, offer.offerPriceUsd);

            // Record simulated payment splits
            let originalCreator : Principal = switch (videoClips.get(listing.clipId)) {
              case (?clip) clip.creator_principal_id;
              case null listing.sellerPrincipal;
            };
            ignore await processSecondaryTrade(
              listing.clipId,
              originalCreator,
              listing.sellerPrincipal,
              offer.buyerPrincipal,
              offer.offerPriceUsd,
            );
            #ok(true);
          };
        };
      };
    };
  };

  public shared ({ caller }) func declineOffer(offerId : Nat) : async { #ok : Bool; #err : Text } {
    switch (offers.get(offerId)) {
      case (null) { #err("Offer not found") };
      case (?offer) {
        switch (listings.get(offer.listingId)) {
          case (null) { #err("Listing not found") };
          case (?listing) {
            if (not Principal.equal(listing.sellerPrincipal, caller)) {
              return #err("Unauthorized: only the seller can decline offers");
            };
            offers.add(offerId, { offer with status = #declined });
            #ok(true);
          };
        };
      };
    };
  };

  public query ({ caller }) func getOffers(listingId : Nat) : async { #ok : [Offer]; #err : Text } {
    switch (listings.get(listingId)) {
      case (null) { #err("Listing not found") };
      case (?listing) {
        if (not Principal.equal(listing.sellerPrincipal, caller)) {
          return #err("Unauthorized: only the seller can view offers");
        };
        let result = offers.values().toArray().filter(func(o : Offer) : Bool {
          o.listingId == listingId
        });
        #ok(result);
      };
    };
  };

  public query func getOfferHistory(listingId : Nat) : async [Offer] {
    offers.values().toArray().filter(func(o : Offer) : Bool {
      o.listingId == listingId and (switch (o.status) {
        case (#pending) false;
        case _ true;
      })
    });
  };

  // ─────────────────────────────────────────────
  // PRICE HISTORY & CHARTS
  // ─────────────────────────────────────────────

  public query func getPriceHistory(clipId : Text) : async [PricePoint] {
    switch (priceHistory.get(clipId)) {
      case (?pts) pts; // sorted chronologically: oldest first
      case null [];
    };
  };

  /// Returns ALL price points for a clip, sorted chronologically (oldest first).
  /// This is the primary endpoint for rendering complete chart data.
  public query func getPriceHistoryFull(clipId : Text) : async [PricePoint] {
    switch (priceHistory.get(clipId)) {
      case (?pts) pts;
      case null [];
    };
  };

  public type PriceHistorySummary = {
    totalSales : Nat;
    minPrice : Float;
    maxPrice : Float;
    currentPrice : Float;
    firstSaleTimestamp : ?Int;
    lastSaleTimestamp : ?Int;
  };

  /// Returns summary statistics for a clip's sales history.
  /// Useful for chart header stats (total sold, price range, latest activity).
  public query func getPriceHistorySummary(clipId : Text) : async PriceHistorySummary {
    let pts : [PricePoint] = switch (priceHistory.get(clipId)) {
      case (?p) p;
      case null [];
    };
    let sz = pts.size();
    if (sz == 0) {
      return {
        totalSales = 0;
        minPrice = 0.0;
        maxPrice = 0.0;
        currentPrice = _computeCurrentPrice(clipId);
        firstSaleTimestamp = null;
        lastSaleTimestamp = null;
      };
    };
    var minP : Float = pts[0].salePrice;
    var maxP : Float = pts[0].salePrice;
    for (pt in pts.values()) {
      if (pt.salePrice < minP) { minP := pt.salePrice };
      if (pt.salePrice > maxP) { maxP := pt.salePrice };
    };
    {
      totalSales = sz;
      minPrice = minP;
      maxPrice = maxP;
      currentPrice = pts[sz - 1].salePrice;
      firstSaleTimestamp = ?pts[0].timestamp;
      lastSaleTimestamp = ?pts[sz - 1].timestamp;
    };
  };

  public query func getCurrentPrice(clipId : Text) : async Float {
    _computeCurrentPrice(clipId);
  };

  // ─────────────────────────────────────────────
  // MARKET CAP & TOP 10
  // ─────────────────────────────────────────────

  func _buildMarketCapEntry(clip : VideoClip) : MarketCapEntry {
    let currentPrice = _computeCurrentPrice(clip.clip_id);
    let sold = _getSoldCount(clip.clip_id);
    let marketCap = currentPrice * 1000.0;
    let titleText = switch (clip.title) {
      case (?t) t;
      case null clip.clip_id;
    };
    {
      clipId = clip.clip_id;
      title = titleText;
      videoUrl = clip.video_file_url;
      previewUrl = clip.preview_loop_url;
      creatorName = clip.creator_principal_id.toText();
      currentPriceUsd = currentPrice;
      totalSupply = 1000;
      copiesSold = sold;
      marketCapUsd = marketCap;
    };
  };

  public query func getMarketCap(clipId : Text) : async ?MarketCapEntry {
    switch (videoClips.get(clipId)) {
      case (null) null;
      case (?clip) ?_buildMarketCapEntry(clip);
    };
  };

  public query func getTop10ByMarketCap() : async [MarketCapEntry] {
    let entries = videoClips.values().toArray().map(
      func(clip) { _buildMarketCapEntry(clip) }
    );
    let sorted = entries.sort(func(a : MarketCapEntry, b : MarketCapEntry) : Order.Order {
      if (b.marketCapUsd > a.marketCapUsd) #less
      else if (b.marketCapUsd < a.marketCapUsd) #greater
      else #equal
    });
    sorted.sliceToArray(0, if (sorted.size() < 10) sorted.size() else 10);
  };

  // ─────────────────────────────────────────────
  // BONDING CURVE STATE TYPE
  // ─────────────────────────────────────────────

  public type BondingCurveState = {
    clipId : Text;
    totalSupply : Nat;       // fixed at 1000
    copiesMinted : Nat;
    startingPrice : Float;   // 1.00 USD
    priceIncrementFactor : Float; // 0.01 USD per copy sold
    currentPrice : Float;
    nextPrice : Float;
    soldOut : Bool;
  };

  // ─────────────────────────────────────────────
  // PURCHASE RECORD TYPE
  // ─────────────────────────────────────────────

  public type PurchaseStatus = { #pending; #minted };

  public type PurchaseRecord = {
    purchaseId : Text;
    clipId : Text;
    buyerPrincipal : Principal;
    editionNumber : Nat;       // 1-based, assigned at purchase time
    pricePaid : Float;
    status : PurchaseStatus;
    purchasedAt : Int;         // nanoseconds
  };

  // ─────────────────────────────────────────────
  // ANTI-SPAM / RATE LIMIT TYPE
  // ─────────────────────────────────────────────

  public type AccountRateLimit = {
    principal : Principal;
    mintTimestamps : [Int];    // last 10 mint timestamps (ns)
    likeTimestamps : [Int];    // last 60 like timestamps (ns)
    accountCreatedAt : Int;    // ns
    videoHashesUsed : [Text];  // SHA-256 hashes of uploaded videos for dedup
  };

  // ─────────────────────────────────────────────
  // BONDING CURVE STATE + PURCHASE STATE
  // ─────────────────────────────────────────────

  // clipId → BondingCurveState
  let bondingCurveStates = Map.empty<Text, BondingCurveState>();

  // purchaseId → PurchaseRecord
  let purchaseRecords = Map.empty<Text, PurchaseRecord>();
  var nextPurchaseSeq : Nat = 1;

  // principal → AccountRateLimit
  let accountRateLimits = Map.empty<Principal, AccountRateLimit>();

  // ─────────────────────────────────────────────
  // BONDING CURVE METHODS
  // ─────────────────────────────────────────────

  // Internal: initialize bonding curve for a clip (no auth check — called after clip creation).
  func _initBondingCurveInternal(clipId : Text) {
    switch (bondingCurveStates.get(clipId)) {
      case (?_) {}; // already initialized
      case null {
        let state : BondingCurveState = {
          clipId;
          totalSupply = 1000;
          copiesMinted = 0;
          startingPrice = 1.0;
          priceIncrementFactor = 0.01;
          currentPrice = 1.0;
          nextPrice = 1.01;
          soldOut = false;
        };
        bondingCurveStates.add(clipId, state);
      };
    };
  };

  /// Initialize bonding curve state for a newly created clip.
  /// Only callable by the clip's creator.
  public shared ({ caller }) func initBondingCurve(clipId : Text) : async { #ok : BondingCurveState; #err : Text } {
    switch (videoClips.get(clipId)) {
      case null { #err("Clip not found") };
      case (?clip) {
        if (not Principal.equal(clip.creator_principal_id, caller)) {
          return #err("Unauthorized: only the clip creator can initialize bonding curve");
        };
        switch (bondingCurveStates.get(clipId)) {
          case (?_) { #err("Already initialized") };
          case null {
            let state : BondingCurveState = {
              clipId;
              totalSupply = 1000;
              copiesMinted = 0;
              startingPrice = 1.0;
              priceIncrementFactor = 0.01;
              currentPrice = 1.0;
              nextPrice = 1.01;
              soldOut = false;
            };
            bondingCurveStates.add(clipId, state);
            #ok(state);
          };
        };
      };
    };
  };

  /// Get the bonding curve state for a single clip.
  public query func getBondingCurveState(clipId : Text) : async ?BondingCurveState {
    bondingCurveStates.get(clipId);
  };

  /// Batch-fetch bonding curve states for multiple clips (for feed rendering).
  public query func getBondingCurveStates(clipIds : [Text]) : async [BondingCurveState] {
    clipIds.filterMap<Text, BondingCurveState>(func(id) { bondingCurveStates.get(id) });
  };

  /// Get all clips together with their bonding curve state in one call.
  public query func getClipsWithCurveState() : async [(VideoClip, ?BondingCurveState)] {
    let all = videoClips.values().toArray().sort(func(a : VideoClip, b : VideoClip) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    });
    all.map<VideoClip, (VideoClip, ?BondingCurveState)>(func(clip) {
      (clip, bondingCurveStates.get(clip.clip_id))
    });
  };

  // ─────────────────────────────────────────────
  // PURCHASE METHODS
  // ─────────────────────────────────────────────

  /// Buy a copy of a clip. Assigns an edition number, stores the purchase as #pending,
  /// and promotes all purchases to #minted when all 1000 copies are sold.
  public shared ({ caller }) func recordPurchase(clipId : Text, pricePaid : Float) : async { #ok : PurchaseRecord; #err : Text } {
    switch (videoClips.get(clipId)) {
      case null { return #err("Clip not found") };
      case (?clip) {
        switch (bondingCurveStates.get(clipId)) {
          case null { return #err("Bonding curve not initialized for this clip") };
          case (?state) {
            if (state.soldOut) return #err("All copies sold out");
            if (state.copiesMinted >= 1000) return #err("All copies sold out");

            let newMinted = state.copiesMinted + 1;
            let editionNumber = newMinted; // 1-based: first buyer gets 1
            let newCurrentPrice = state.startingPrice + (state.priceIncrementFactor * newMinted.toFloat());
            let newNextPrice = state.startingPrice + (state.priceIncrementFactor * (newMinted + 1).toFloat());
            let isSoldOut = newMinted >= 1000;

            let updatedState : BondingCurveState = { state with
              copiesMinted = newMinted;
              currentPrice = newCurrentPrice;
              nextPrice = newNextPrice;
              soldOut = isSoldOut;
            };
            bondingCurveStates.add(clipId, updatedState);

            // Assign a unique purchaseId
            let purchaseId = clipId # "-" # editionNumber.toText();
            let record : PurchaseRecord = {
              purchaseId;
              clipId;
              buyerPrincipal = caller;
              editionNumber;
              pricePaid;
              status = if (isSoldOut) #minted else #pending;
              purchasedAt = Time.now();
            };
            purchaseRecords.add(purchaseId, record);
            nextPurchaseSeq += 1;

            // If just sold out, promote ALL pending purchases for this clip to #minted
            if (isSoldOut) {
              for ((pid, pr) in purchaseRecords.entries()) {
                if (pr.clipId == clipId) {
                  switch (pr.status) {
                    case (#pending) {
                      purchaseRecords.add(pid, { pr with status = #minted });
                    };
                    case (#minted) {};
                  };
                };
              };
            };

            // Record price history point
            _recordSale(clipId, editionNumber, pricePaid);

            // Record simulated payment split (95% creator, 5% platform)
            ignore await processCopySale(clipId, clip.creator_principal_id, caller, pricePaid);

            #ok(record);
          };
        };
      };
    };
  };

  /// Returns all purchases made by the calling principal.
  public query ({ caller }) func getMyPurchases() : async [PurchaseRecord] {
    purchaseRecords.values().toArray().filter(func(pr : PurchaseRecord) : Bool {
      Principal.equal(pr.buyerPrincipal, caller)
    }).sort(func(a : PurchaseRecord, b : PurchaseRecord) : Order.Order {
      Int.compare(b.purchasedAt, a.purchasedAt)
    });
  };

  // ─────────────────────────────────────────────
  // ANTI-SPAM METHODS
  // ─────────────────────────────────────────────

  // ─────────────────────────────────────────────
  // ANTI-SPAM HELPERS
  // ─────────────────────────────────────────────

  // Get or create AccountRateLimit for a principal
  func _getOrCreateRateLimit(p : Principal) : AccountRateLimit {
    switch (accountRateLimits.get(p)) {
      case (?rl) rl;
      case null {
        let rl : AccountRateLimit = {
          principal = p;
          mintTimestamps = [];
          likeTimestamps = [];
          accountCreatedAt = Time.now();
          videoHashesUsed = [];
        };
        accountRateLimits.add(p, rl);
        rl;
      };
    };
  };

  /// Check whether the caller is allowed to mint (max 10 mints per 10 minutes).
  /// Returns #ok(true) when allowed, #err with a human-readable message when blocked.
  public shared ({ caller }) func checkMintRateLimit() : async { #ok : Bool; #err : Text } {
    let rl = _getOrCreateRateLimit(caller);
    let now = Time.now();
    let tenMinNs : Int = 600_000_000_000;
    let recent = rl.mintTimestamps.filter(func(ts : Int) : Bool {
      now - ts <= tenMinNs
    });
    if (recent.size() >= 10) {
      #err("Mint limit reached. Try again shortly.")
    } else {
      #ok(true)
    };
  };

  /// Check whether the caller is allowed to like (max 30 likes per minute;
  /// also blocks accounts created within the last 60 seconds).
  /// Returns #ok(true) when allowed, #err with a human-readable message when blocked.
  public shared ({ caller }) func checkLikeRateLimit() : async { #ok : Bool; #err : Text } {
    let rl = _getOrCreateRateLimit(caller);
    let now = Time.now();
    let sixtySecNs : Int = 60_000_000_000;
    // Block accounts created < 60 seconds ago
    if (now - rl.accountCreatedAt < sixtySecNs) {
      return #err("Account too new to like");
    };
    let recent = rl.likeTimestamps.filter(func(ts : Int) : Bool {
      now - ts <= sixtySecNs
    });
    if (recent.size() >= 30) {
      #err("Like limit reached. Try again in a moment.")
    } else {
      #ok(true)
    };
  };

  /// Record a video hash for the caller. Returns #err("duplicate") if the hash
  /// was already submitted by any user, otherwise records it and returns #ok(true).
  public shared ({ caller }) func recordVideoHash(hash : Text) : async { #ok : Bool; #err : Text } {
    let rl = _getOrCreateRateLimit(caller);
    // Check globally — scan all accounts for this hash
    var isDuplicate = false;
    for ((_p, acct) in accountRateLimits.entries()) {
      if (acct.videoHashesUsed.find(func(h : Text) : Bool { h == hash }) != null) {
        isDuplicate := true;
      };
    };
    if (isDuplicate) {
      #err("Duplicate video detected")
    } else {
      let updated : AccountRateLimit = { rl with
        videoHashesUsed = rl.videoHashesUsed.concat([hash]);
      };
      accountRateLimits.add(caller, updated);
      #ok(true)
    };
  };

  // ─────────────────────────────────────────────
  // PAYMENT ROUTING
  // ─────────────────────────────────────────────

  public type TxType = { #mintFee; #copySale; #secondaryTrade };

  public type TxSplit = {
    principal : Principal;
    btcAddress : Text;
    role : Text;
    usdAmount : Float;
    btcAmountSimulated : Float;  // USD→BTC conversion for display
  };

  public type Transaction = {
    id : Nat;
    txType : TxType;
    clipId : Text;
    totalUsd : Float;
    splits : [TxSplit];
    timestamp : Int;
    status : Text;             // "confirmed" | "failed" | "partial"
  };

  // Kept for schema compatibility — no longer used for ckBTC block indices
  let txLedgerIds = Map.empty<Nat, [Nat]>();

  let transactions = Map.empty<Nat, Transaction>();
  var nextTxId : Nat = 0;

  // Platform constants
  let _platformBtcAddress : Text = "3GwDfPKRyNH4MZT3Vnc7GkKbAccNBZcVFh";
  var _btcUsdRate : Float = 50000.0;       // default; update via setBtcRate (admin only)
  let _platformPrincipal : Principal = Principal.fromText("aaaaa-aa");

  /// Convert a USD amount to e8s given the current BTC/USD rate.
  /// $1 USD = 100_000_000 / btcPriceUsd e8s
  func _usdToE8s(usd : Float) : Nat {
    let e8s = (usd / _btcUsdRate) * 100_000_000.0;
    // floor to Nat
    e8s.toInt().toNat();
  };

  func btcAddressFor(p : Principal) : Text {
    // Returns the cached BTC deposit address if available, otherwise a principal-based fallback
    switch (userWallets.get(p)) {
      case (?w) if (w.btcAddress != "") w.btcAddress else "principal:" # p.toText();
      case null "principal:" # p.toText();
    }
  };

  func _makeSplit(p : Principal, addr : Text, role : Text, usd : Float) : TxSplit {
    {
      principal = p;
      btcAddress = addr;
      role;
      usdAmount = usd;
      btcAmountSimulated = usd / _btcUsdRate;
    };
  };

  func _recordTx(
    txType : TxType,
    clipId : Text,
    totalUsd : Float,
    splits : [TxSplit],
    ledgerTxIds : [Nat],
    status : Text,
  ) : Nat {
    let id = nextTxId;
    nextTxId += 1;
    let tx : Transaction = {
      id;
      txType;
      clipId;
      totalUsd;
      splits;
      timestamp = Time.now();
      status;
    };
    transactions.add(id, tx);
    if (ledgerTxIds.size() > 0) {
      txLedgerIds.add(id, ledgerTxIds);
    };
    id;
  };

  // ─────────────────────────────────────────────
  // PAYMENT HELPER METHODS
  // ─────────────────────────────────────────────

  /// Returns the caller's in-app BTC balance in e8s (from UserWallet).
  /// Displayed on the frontend as BTC (e8s / 100_000_000).
  public shared ({ caller }) func getMyBalance() : async Nat {
    let w = _getOrCreateWallet(caller);
    w.btcBalanceE8s
  };

  /// Returns the current USD/BTC rate used for conversions.
  /// Defaults to 50000 if no live rate is set.
  public query func getBtcRate() : async Float {
    _btcUsdRate;
  };

  /// Admin: update the BTC/USD rate used for e8s conversions.
  public shared ({ caller }) func setBtcRate(rate : Float) : async () {
    if (not _isAdmin(caller)) Runtime.trap("Unauthorized");
    if (rate <= 0.0) Runtime.trap("Rate must be positive");
    _btcUsdRate := rate;
  };

  /// Returns the caller's BTC deposit address as their payment address.
  /// All payments are in BTC — no internal payment terminology exposed.
  /// Returns #err if address has not been derived yet (call getUserDepositAddress first).
  public shared ({ caller }) func getPaymentAddress() : async { #ok : Text; #err : Text } {
    let w = _getOrCreateWallet(caller);
    if (w.btcAddress != "" and _isValidBtcAddress(w.btcAddress)) {
      #ok(w.btcAddress)
    } else {
      // Try to derive it now
      switch (await _deriveBtcAddressAsync(caller)) {
        case (#ok(address)) {
          userWallets.add(caller, { w with btcAddress = address });
          #ok(address)
        };
        case (#err(code)) {
          #err(code)
        };
      }
    }
  };

  // ─────────────────────────────────────────────
  // IN-APP BTC BALANCE PAYMENT ROUTING
  // Real BTC is deposited via getUserDepositAddress + checkForNewDeposits.
  // All purchases deduct from and credit in-app balances.
  // Transaction splits are recorded for accounting and earnings queries.
  // ─────────────────────────────────────────────

  /// Process a $1 mint fee deducted from creator's in-app balance → platform.
  /// Returns the internal transaction ID.
  public shared ({ caller = _ }) func processClipMint(creatorPrincipal : Principal) : async Nat {
    let costE8s = _usdToE8s(1.0);
    ignore _deductBalance(creatorPrincipal, costE8s);
    let splits : [TxSplit] = [
      _makeSplit(_platformPrincipal, _platformBtcAddress, "platform", 1.0),
    ];
    _recordTx(#mintFee, "", 1.0, splits, [], "confirmed");
  };

  /// Process a bonding curve copy sale via in-app balance.
  /// 95% to creator, 5% to platform — deducted from buyer's balance.
  public shared ({ caller = _ }) func processCopySale(
    clipId : Text,
    creatorPrincipal : Principal,
    buyerPrincipal : Principal,
    usdAmount : Float,
  ) : async Nat {
    let creatorAmt = usdAmount * 0.95;
    let platformAmt = usdAmount * 0.05;
    let totalE8s = _usdToE8s(usdAmount);
    let creatorE8s = _usdToE8s(creatorAmt);
    ignore _deductBalance(buyerPrincipal, totalE8s);
    _creditBalance(creatorPrincipal, creatorE8s);
    let splits : [TxSplit] = [
      _makeSplit(creatorPrincipal, btcAddressFor(creatorPrincipal), "creator", creatorAmt),
      _makeSplit(_platformPrincipal, _platformBtcAddress, "platform", platformAmt),
    ];
    _recordTx(#copySale, clipId, usdAmount, splits, [], "confirmed");
  };

  /// Process a secondary trade via in-app balance.
  /// 4% to original creator, 1% to platform, 95% to seller — deducted from buyer's balance.
  public shared ({ caller = _ }) func processSecondaryTrade(
    clipId : Text,
    originalCreatorPrincipal : Principal,
    sellerPrincipal : Principal,
    buyerPrincipal : Principal,
    usdAmount : Float,
  ) : async Nat {
    let creatorAmt = usdAmount * 0.04;
    let sellerAmt = usdAmount * 0.95;
    let totalE8s = _usdToE8s(usdAmount);
    let creatorE8s = _usdToE8s(creatorAmt);
    let sellerE8s = _usdToE8s(sellerAmt);
    ignore _deductBalance(buyerPrincipal, totalE8s);
    _creditBalance(originalCreatorPrincipal, creatorE8s);
    _creditBalance(sellerPrincipal, sellerE8s);
    let splits : [TxSplit] = [
      _makeSplit(originalCreatorPrincipal, btcAddressFor(originalCreatorPrincipal), "creator", creatorAmt),
      _makeSplit(_platformPrincipal, _platformBtcAddress, "platform", usdAmount * 0.01),
      _makeSplit(sellerPrincipal, btcAddressFor(sellerPrincipal), "seller", sellerAmt),
    ];
    _recordTx(#secondaryTrade, clipId, usdAmount, splits, [], "confirmed");
  };

  /// Returns all transactions newest-first.
  public query func getTransactionHistory() : async [Transaction] {
    transactions.values().toArray().sort(func(a : Transaction, b : Transaction) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    });
  };

  /// Returns transactions where p appears in any split's principal.
  public query func getMyTransactions(p : Principal) : async [Transaction] {
    transactions.values().toArray().filter(func(tx : Transaction) : Bool {
      tx.splits.find(func(s : TxSplit) : Bool {
        Principal.equal(s.principal, p)
      }) != null
    }).sort(func(a : Transaction, b : Transaction) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    });
  };

  public type EarningsSummary = {
    totalUsd : Float;
    totalBtcE8s : Nat;         // real e8s accumulated from confirmed ledger transfers
    fromCopySales : Float;
    fromTradeRoyalties : Float;
    fromAuctionWins : Float;
    transactionCount : Nat;
  };

  /// Returns an earnings summary for the calling principal.
  /// Sums splits where role == "creator" or role == "seller".
  public shared query ({ caller }) func getMyEarnings() : async EarningsSummary {
    var totalUsd : Float = 0.0;
    var totalBtcE8s : Nat = 0;
    var fromCopySales : Float = 0.0;
    var fromTradeRoyalties : Float = 0.0;
    var fromAuctionWins : Float = 0.0;
    var transactionCount : Nat = 0;

    for (tx in transactions.values()) {
      // Check if caller appears in any split of this transaction
      let callerInTx = tx.splits.find(func(s : TxSplit) : Bool {
        Principal.equal(s.principal, caller)
      }) != null;

      if (callerInTx) {
        transactionCount += 1;
        // Sum only the splits belonging to caller with role "creator" or "seller"
        for (split in tx.splits.values()) {
          if (
            Principal.equal(split.principal, caller) and
            (split.role == "creator" or split.role == "seller")
          ) {
            totalUsd += split.usdAmount;
            totalBtcE8s += _usdToE8s(split.usdAmount);
            switch (tx.txType) {
              case (#copySale) { fromCopySales += split.usdAmount };
              case (#secondaryTrade) {
                if (split.role == "creator") {
                  fromTradeRoyalties += split.usdAmount
                } else {
                  // role == "seller"
                  fromAuctionWins += split.usdAmount
                }
              };
              case (#mintFee) {};
            };
          };
        };
      };
    };

    {
      totalUsd;
      totalBtcE8s;
      fromCopySales;
      fromTradeRoyalties;
      fromAuctionWins;
      transactionCount;
    };
  };

  // ─────────────────────────────────────────────
  // WALLET HELPERS
  // ─────────────────────────────────────────────

  /// Derive a real BTC P2PKH address for a user using ICP's native Bitcoin integration.
  /// Derivation path: [Text.encodeUtf8("btc_deposit"), Principal.toBlob(userPrincipal)]
  /// Each user gets a deterministic, unique on-chain BTC address.
  /// The ICP Bitcoin API can take 20-30s on mainnet; the try/catch handles all failure modes.
  func _deriveBtcAddressAsync(p : Principal) : async { #ok : Text; #err : Text } {
    let derivationPath : [Blob] = [
      "btc_deposit".encodeUtf8(),
      p.toBlob(),
    ];
    try {
      Debug.print("_deriveBtcAddressAsync: calling bitcoin_get_p2pkh_address for " # p.toText());
      let addr = await ic.bitcoin_get_p2pkh_address({
        network = _btcNetwork;
        derivation_path = derivationPath;
      });
      Debug.print("_deriveBtcAddressAsync: received addr='" # addr # "' for " # p.toText());
      if (addr.size() == 0) {
        Debug.print("_deriveBtcAddressAsync: API returned empty address for " # p.toText());
        #err("btc_api_empty_address")
      } else if (not _isValidBtcAddress(addr)) {
        Debug.print("_deriveBtcAddressAsync: API returned invalid address '" # addr # "' for " # p.toText() # " (len=" # addr.size().toText() # ")");
        // bc1 addresses are NOT returned by bitcoin_get_p2pkh_address on mainnet — clear any such cached value
        #err("btc_api_invalid_address")
      } else {
        Debug.print("_deriveBtcAddressAsync: address validated ok for " # p.toText());
        #ok(addr)
      }
    } catch (e) {
      // ICP traps the call on timeout/overload — catch and return a retryable error code
      let errMsg = e.message();
      Debug.print("_deriveBtcAddressAsync: caught error for " # p.toText() # " — " # errMsg);
      // Distinguish between explicit rejection and timeout/trap
      let code = if (errMsg.contains(#text "timeout") or errMsg.contains(#text "call timeout") or errMsg.contains(#text "exceeded")) {
        "btc_api_timeout"
      } else {
        "btc_api_error:" # errMsg
      };
      #err(code)
    }
  };

  /// Encode a UTXO outpoint to a unique string key for dedup tracking.
  func _utxoKey(outpoint : OutPoint) : Text {
    // Convert txid blob to hex, then append vout
    let bytes = outpoint.txid.toArray();
    let hexChars : [Char] = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
    let hexParts = List.empty<Char>();
    for (b in bytes.values()) {
      let n = Nat.fromNat8(b);
      hexParts.add(hexChars[n / 16]);
      hexParts.add(hexChars[n % 16]);
    };
    let hexStr = hexParts.toArray().foldLeft("", func(acc : Text, c : Char) : Text {
      acc # Text.fromChar(c)
    });
    hexStr # ":" # Nat.fromNat32(outpoint.vout).toText()
  };

  /// Check whether a UTXO outpoint has already been credited for a user.
  func _isUtxoSeen(p : Principal, key : Text) : Bool {
    switch (seenUtxos.get(p)) {
      case (?keys) keys.find(func(k : Text) : Bool { k == key }) != null;
      case null false;
    }
  };

  /// Mark a UTXO outpoint as seen/credited for a user.
  func _markUtxoSeen(p : Principal, key : Text) {
    let existing : [Text] = switch (seenUtxos.get(p)) {
      case (?keys) keys;
      case null [];
    };
    seenUtxos.add(p, existing.concat([key]));
  };

  /// Get or create a UserWallet for a principal.
  /// NOTE: BTC address is set lazily — call getUserDepositAddress() to initialize it.
  func _getOrCreateWallet(p : Principal) : UserWallet {
    switch (userWallets.get(p)) {
      case (?w) w;
      case null {
        // Address starts empty — filled in by getUserDepositAddress (async)
        let w : UserWallet = {
          walletPrincipalId = p;
          btcAddress = "";
          btcBalanceE8s = 0;
          usdValueRef = 0.0;
          deposits = [];
          payouts = [];
        };
        userWallets.add(p, w);
        w;
      };
    };
  };

  /// Credit a user's in-app BTC balance.
  func _creditBalance(p : Principal, amountE8s : Nat) {
    let w = _getOrCreateWallet(p);
    let newBalance = w.btcBalanceE8s + amountE8s;
    let usdRef = newBalance.toFloat() / 100_000_000.0 * _btcUsdRate;
    userWallets.add(p, { w with btcBalanceE8s = newBalance; usdValueRef = usdRef });
  };

  /// Deduct from a user's in-app BTC balance (used internally — validates balance first).
  func _deductBalance(p : Principal, amountE8s : Nat) : Bool {
    let w = _getOrCreateWallet(p);
    if (w.btcBalanceE8s < amountE8s) return false;
    let newBalance : Nat = w.btcBalanceE8s - amountE8s;
    let usdRef = newBalance.toFloat() / 100_000_000.0 * _btcUsdRate;
    userWallets.add(p, { w with btcBalanceE8s = newBalance; usdValueRef = usdRef });
    true
  };

  // ─────────────────────────────────────────────
  // WALLET PUBLIC METHODS
  // ─────────────────────────────────────────────

  /// Validate a Bitcoin mainnet address with strict rules:
  ///   P2PKH  — starts with "1", length 25–34, only valid base58 chars (no 0, O, I, l)
  ///   P2SH   — starts with "3", length 25–34, only valid base58 chars
  ///   bech32 — starts with "bc1", length exactly 42 (P2WPKH) or 62 (P2WSH),
  ///            only lowercase alphanumeric excluding 'b', 'i', 'o', '1' after the "bc1" prefix
  /// ICP's bitcoin_get_p2pkh_address returns P2PKH ("1...") addresses on mainnet.
  func _isValidBtcAddress(addr : Text) : Bool {
    let len = addr.size();
    if (len < 25) return false;

    // Collect chars for character-level validation
    let chars = addr.toArray();

    if (addr.startsWith(#text "1") or addr.startsWith(#text "3")) {
      // P2PKH or P2SH: length 25–34, base58 charset (no 0, O, I, l)
      if (len < 25 or len > 34) return false;
      let invalidBase58 : [Char] = ['0', 'O', 'I', 'l'];
      for (c in chars.values()) {
        // Must be alphanumeric
        let isAlnum = (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9');
        if (not isAlnum) return false;
        // Must not be in the excluded set
        for (bad in invalidBase58.values()) {
          if (c == bad) return false;
        };
      };
      true
    } else if (addr.startsWith(#text "bc1")) {
      // bech32 P2WPKH = 42 chars, P2WSH = 62 chars
      if (len != 42 and len != 62) return false;
      // chars after the "bc1q" or "bc1p" prefix must be lowercase bech32 charset
      // Valid bech32 chars: q p z r y 9 x 8 g f 2 t v d w 0 s 3 j n 5 4 k h c e 6 m u a 7 l
      // (all lowercase alphanum except 'b', 'i', 'o', '1')
      // We only validate chars at index 3 onward (skip "bc1")
      var idx = 0;
      for (c in chars.values()) {
        if (idx >= 3) {
          let isLower = c >= 'a' and c <= 'z';
          let isDigit = c >= '0' and c <= '9';
          if (not isLower and not isDigit) return false;
          // bech32 excludes: 'b', 'i', 'o', '1'
          if (c == 'b' or c == 'i' or c == 'o' or c == '1') return false;
        };
        idx += 1;
      };
      true
    } else {
      false
    }
  };

  /// Returns or creates a UserWallet for the caller.
  /// Eagerly derives and caches the BTC address on first call, or if the cached address fails strict validation.
  public shared ({ caller }) func getOrCreateUserWallet() : async UserWallet {
    let w = _getOrCreateWallet(caller);
    // Re-derive if address is missing or fails strict validation
    if (w.btcAddress == "" or not _isValidBtcAddress(w.btcAddress)) {
      if (w.btcAddress != "") {
        Debug.print("getOrCreateUserWallet: cached address '" # w.btcAddress # "' failed strict validation — re-deriving for " # caller.toText());
        userWallets.add(caller, { w with btcAddress = "" });
      };
      switch (await _deriveBtcAddressAsync(caller)) {
        case (#ok(address)) {
          let freshW = _getOrCreateWallet(caller);
          userWallets.add(caller, { freshW with btcAddress = address });
          { freshW with btcAddress = address }
        };
        case (#err(_)) {
          // Will be re-attempted on next call
          _getOrCreateWallet(caller)
        };
      }
    } else {
      w
    }
  };

  /// Returns the caller's unique BTC deposit address (real on-chain address via ICP Bitcoin API).
  /// Derives the address on first call and caches it in the wallet.
  /// If the cached address fails strict validation (including stale bc1/bech32 addresses that
  /// were mis-derived from an old ckBTC path), it is cleared and re-derived automatically.
  /// Returns #err with a specific error code if the Bitcoin API is unreachable or returns an invalid address.
  public shared ({ caller }) func getUserDepositAddress() : async { #ok : Text; #err : Text } {
    let w = _getOrCreateWallet(caller);
    // Re-derive if the cached address is empty OR fails strict validation
    if (w.btcAddress != "" and _isValidBtcAddress(w.btcAddress)) {
      // Already derived and strictly valid — return cached address immediately
      Debug.print("getUserDepositAddress: returning cached address for " # caller.toText() # " = " # w.btcAddress);
      #ok(w.btcAddress)
    } else {
      // Clear any stale/invalid cached address before re-deriving
      if (w.btcAddress != "") {
        Debug.print("getUserDepositAddress: cached address '" # w.btcAddress # "' failed strict validation — re-deriving for " # caller.toText());
        userWallets.add(caller, { w with btcAddress = "" });
      } else {
        Debug.print("getUserDepositAddress: no cached address — deriving for " # caller.toText());
      };
      // Derive real BTC P2PKH address via ICP Bitcoin API
      switch (await _deriveBtcAddressAsync(caller)) {
        case (#ok(address)) {
          let freshW = _getOrCreateWallet(caller);
          userWallets.add(caller, { freshW with btcAddress = address });
          #ok(address)
        };
        case (#err(code)) {
          // Return the specific error code — never silently return null or empty string
          #err(code)
        };
      }
    }
  };

  /// Fire-and-forget background warmup for the caller's BTC deposit address.
  /// Call this immediately after login (no await needed on the frontend).
  /// If the address is already cached and valid, this is a no-op.
  /// If not, it kicks off the slow ICP Bitcoin API call in the background so the
  /// address is ready when the user opens the Deposit modal.
  public shared ({ caller }) func warmupDepositAddress() : async () {
    let w = _getOrCreateWallet(caller);
    if (w.btcAddress != "" and _isValidBtcAddress(w.btcAddress)) {
      // Address already valid — nothing to do
      return;
    };
    // Clear any stale invalid address before re-deriving
    if (w.btcAddress != "" and not _isValidBtcAddress(w.btcAddress)) {
      Debug.print("warmupDepositAddress: clearing stale invalid address '" # w.btcAddress # "' for " # caller.toText());
      userWallets.add(caller, { w with btcAddress = "" });
    };
    // Kick off derivation — result is cached for getUserDepositAddress to return immediately
    switch (await _deriveBtcAddressAsync(caller)) {
      case (#ok(address)) {
        let freshW = _getOrCreateWallet(caller);
        userWallets.add(caller, { freshW with btcAddress = address });
        Debug.print("warmupDepositAddress: address cached for " # caller.toText() # " = " # address);
      };
      case (#err(code)) {
        // Warmup failure is silent — getUserDepositAddress will retry
        Debug.print("warmupDepositAddress: derivation failed for " # caller.toText() # " — " # code);
      };
    };
  };

  /// Force-clears the caller's cached BTC deposit address and re-derives a fresh one.
  /// Use this when an existing address is rejected by an external service (exchange, wallet, etc.).
  public shared ({ caller }) func resetUserDepositAddress() : async { #ok : Text; #err : Text } {
    let w = _getOrCreateWallet(caller);
    // Clear cached address unconditionally
    userWallets.add(caller, { w with btcAddress = "" });
    Debug.print("resetUserDepositAddress: cleared cached address for " # caller.toText() # " — re-deriving");
    // Re-derive from the Bitcoin API
    switch (await _deriveBtcAddressAsync(caller)) {
      case (#ok(address)) {
        let freshW = _getOrCreateWallet(caller);
        userWallets.add(caller, { freshW with btcAddress = address });
        #ok(address)
      };
      case (#err(code)) {
        #err(code)
      };
    }
  };

  /// Returns all deposits (pending and confirmed) for the caller.
  public shared ({ caller }) func getUserDeposits() : async [Deposit] {
    let w = _getOrCreateWallet(caller);
    w.deposits
  };

  /// Check for new incoming UTXOs on the caller's BTC deposit address using ICP's Bitcoin API.
  /// Credits balance for UTXOs with height > 0 (at least 1 confirmation).
  /// Tracks seen UTXO outpoints to prevent double-crediting.
  public shared ({ caller }) func checkForNewDeposits() : async { #ok : Nat; #err : Text } {
    // Ensure address is derived first
    let w = _getOrCreateWallet(caller);
    let address = if (w.btcAddress != "" and _isValidBtcAddress(w.btcAddress)) {
      w.btcAddress
    } else {
      switch (await _deriveBtcAddressAsync(caller)) {
        case (#ok(derived)) {
          userWallets.add(caller, { w with btcAddress = derived });
          derived
        };
        case (#err(code)) {
          return #err(code)
        };
      }
    };

    // Query UTXOs from ICP Bitcoin API (min 0 confirmations to catch pending too)
    let utxosResponse = try {
      await ic.bitcoin_get_utxos({
        address;
        network = _btcNetwork;
        filter = null;   // no filter = return all UTXOs
      })
    } catch (_) {
      return #err("Failed to reach Bitcoin network");
    };

    var newDepositCount : Nat = 0;
    let currentTipHeight = utxosResponse.tip_height;

    for (utxo in utxosResponse.utxos.values()) {
      let key = _utxoKey(utxo.outpoint);

      // Skip UTXOs we've already processed
      if (not _isUtxoSeen(caller, key)) {
        _markUtxoSeen(caller, key);

        let amountE8s : Nat = Nat.fromNat64(utxo.value);
        let confirmations : Nat = if (utxo.height == 0) {
          0
        } else {
          // confirmations = tip_height - utxo_height + 1
          let h = Nat.fromNat32(utxo.height);
          let tip = Nat.fromNat32(currentTipHeight);
          if (tip >= h) tip - h + 1 else 0
        };

        let confirmStatus : ConfirmationStatus = if (confirmations >= 1) #confirmed else #pending;

        let now = Time.now();
        let depId = "dep_" # nextDepositSeq.toText();
        nextDepositSeq += 1;

        // Convert txid blob to hex for the deposit record
        let txidHex = key; // "txid_hex:vout" — use the full key as txid reference

        let dep : Deposit = {
          depositId = depId;
          timestamp = now;
          btcAmountE8s = amountE8s;
          confirmationStatus = confirmStatus;
          txid = txidHex;
        };

        // Credit balance immediately for confirmed UTXOs
        if (confirmations >= 1 and amountE8s > 0) {
          _creditBalance(caller, amountE8s);
        };

        // Append deposit record
        let freshWallet = _getOrCreateWallet(caller);
        let newDeposits = freshWallet.deposits.concat([dep]);
        userWallets.add(caller, { freshWallet with deposits = newDeposits });

        newDepositCount += 1;
      };
    };

    #ok(newDepositCount)
  };

  /// Re-check pending deposits using the ICP Bitcoin API.
  /// Confirms deposits whose UTXO now has >= 1 confirmation and credits balance.
  public shared ({ caller }) func confirmPendingDeposits() : async { #ok : Nat; #err : Text } {
    let w = _getOrCreateWallet(caller);
    let hasPending = w.deposits.find(func(d : Deposit) : Bool {
      switch (d.confirmationStatus) { case (#pending) true; case _ false }
    }) != null;

    if (not hasPending) return #ok(0);

    let address = w.btcAddress;
    if (address == "") return #err("No deposit address found");

    let utxosResponse = try {
      await ic.bitcoin_get_utxos({
        address;
        network = _btcNetwork;
        filter = ?#MinConfirmations(1 : Nat32);
      })
    } catch (_) {
      return #err("Failed to reach Bitcoin network");
    };

    // Build a set of confirmed UTXO keys
    let confirmedKeys = utxosResponse.utxos.map(func(u : Utxo) : Text {
      _utxoKey(u.outpoint)
    });

    var confirmedCount : Nat = 0;
    let currentWallet = _getOrCreateWallet(caller);

    let updatedDeposits = currentWallet.deposits.map(func(dep : Deposit) : Deposit {
      switch (dep.confirmationStatus) {
        case (#confirmed) dep;
        case (#pending) {
          // Check if this deposit's txid key is in the confirmed set
          let isConfirmed = confirmedKeys.find(func(k : Text) : Bool {
            dep.txid == k
          }) != null;
          if (isConfirmed) {
            confirmedCount += 1;
            { dep with confirmationStatus = #confirmed }
          } else {
            dep
          }
        };
      }
    });

    // Credit balance for newly confirmed deposits
    var idx : Nat = 0;
    for (old in currentWallet.deposits.values()) {
      if (idx < updatedDeposits.size()) {
        let updated = updatedDeposits[idx];
        switch (old.confirmationStatus, updated.confirmationStatus) {
          case (#pending, #confirmed) {
            if (updated.btcAmountE8s > 0) {
              _creditBalance(caller, updated.btcAmountE8s);
            };
          };
          case _ {};
        };
      };
      idx += 1;
    };

    let finalWallet = _getOrCreateWallet(caller);
    userWallets.add(caller, { finalWallet with deposits = updatedDeposits });

    #ok(confirmedCount)
  };

  /// Returns merged wallet activity (deposits + payouts + mint costs) newest-first.
  public shared ({ caller }) func getAllWalletActivity() : async [WalletActivity] {
    let w = _getOrCreateWallet(caller);

    // Build activity from deposits
    let depositActivity = w.deposits.map<Deposit, WalletActivity>(func(dep) {
      {
        activityType = #deposit;
        btcAmountE8s = dep.btcAmountE8s;
        timestamp = dep.timestamp;
        status = dep.confirmationStatus;
        description = "BTC Deposit";
      }
    });

    // Build activity from payouts
    let payoutActivity = w.payouts.map<Payout, WalletActivity>(func(p) {
      let isWithdrawal = p.clipId.startsWith(#text "withdrawal:");
      {
        activityType = if (isWithdrawal) #withdrawal else #auctionPayout;
        btcAmountE8s = p.btcAmountE8s;
        timestamp = p.timestamp;
        status = #confirmed;
        description = if (isWithdrawal) {
          p.clipId  // "withdrawal:<address>" — frontend strips prefix for display
        } else switch (p.payoutType) {
          case (#copySale) "Copy Sale";
          case (#secondaryRoyalty) "Royalty";
          case (#auctionWin) "Auction Payout";
        };
      }
    });

    // Build activity from mint fee transactions involving caller
    let mintCostActivity = List.empty<WalletActivity>();
    for (tx in transactions.values()) {
      let isMintFee = switch (tx.txType) { case (#mintFee) true; case _ false };
      if (isMintFee) {
        let callerIsCreator = tx.splits.find(func(s : TxSplit) : Bool {
          Principal.equal(s.principal, caller)
        }) != null;
        if (callerIsCreator) {
          mintCostActivity.add({
            activityType = #mintCost;
            btcAmountE8s = _usdToE8s(tx.totalUsd);
            timestamp = tx.timestamp;
            status = #confirmed;
            description = "Mint Cost";
          });
        };
      };
    };

    // Merge all activity and sort newest-first
    let allActivity = depositActivity
      .concat(payoutActivity)
      .concat(mintCostActivity.toArray());

    allActivity.sort(func(a : WalletActivity, b : WalletActivity) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    })
  };

  // ─────────────────────────────────────────────
  // WALLET-AWARE PAYMENT OVERRIDES
  // ─────────────────────────────────────────────

  /// Internal: record a payout to a user wallet.
  func _recordPayout(p : Principal, amountE8s : Nat, payoutType : PayoutType, clipId : Text) {
    let w = _getOrCreateWallet(p);
    let payoutId = "payout_" # nextPayoutSeq.toText();
    nextPayoutSeq += 1;
    let payout : Payout = {
      payoutId;
      timestamp = Time.now();
      btcAmountE8s = amountE8s;
      payoutType;
      clipId;
    };
    let newPayouts = w.payouts.concat([payout]);
    userWallets.add(p, { w with payouts = newPayouts });
  };

  /// Process a $1 mint fee deducting from user's in-app wallet balance.
  /// Returns #err("insufficient balance") if user cannot afford it.
  public shared ({ caller }) func processWalletMint(clipId : Text) : async { #ok : Nat; #err : Text } {
    let costE8s = _usdToE8s(1.0);
    let w = _getOrCreateWallet(caller);
    if (w.btcBalanceE8s < costE8s) {
      return #err("insufficient balance");
    };
    ignore _deductBalance(caller, costE8s);
    let splits : [TxSplit] = [
      _makeSplit(_platformPrincipal, _platformBtcAddress, "platform", 1.0),
    ];
    let txId = _recordTx(#mintFee, clipId, 1.0, splits, [], "confirmed");
    #ok(txId)
  };

  /// Process a copy sale deducting buyer's wallet balance and crediting creator.
  public shared ({ caller }) func processWalletCopySale(
    clipId : Text,
    creatorPrincipal : Principal,
    usdAmount : Float,
  ) : async { #ok : Nat; #err : Text } {
    let totalE8s = _usdToE8s(usdAmount);
    let buyerWallet = _getOrCreateWallet(caller);
    if (buyerWallet.btcBalanceE8s < totalE8s) {
      return #err("insufficient balance");
    };

    let creatorAmtE8s = _usdToE8s(usdAmount * 0.95);
    let platformAmtE8s : Nat = if (totalE8s >= creatorAmtE8s) totalE8s - creatorAmtE8s else 0;

    ignore _deductBalance(caller, totalE8s);
    _creditBalance(creatorPrincipal, creatorAmtE8s);
    _recordPayout(creatorPrincipal, creatorAmtE8s, #copySale, clipId);

    let splits : [TxSplit] = [
      _makeSplit(creatorPrincipal, btcAddressFor(creatorPrincipal), "creator", usdAmount * 0.95),
      _makeSplit(_platformPrincipal, _platformBtcAddress, "platform", usdAmount * 0.05),
    ];
    let txId = _recordTx(#copySale, clipId, usdAmount, splits, [], "confirmed");
    ignore platformAmtE8s; // platform keeps its cut inside canister for now
    #ok(txId)
  };

  /// Process a secondary trade deducting buyer and crediting seller + creator.
  public shared ({ caller }) func processWalletSecondaryTrade(
    clipId : Text,
    originalCreatorPrincipal : Principal,
    sellerPrincipal : Principal,
    usdAmount : Float,
  ) : async { #ok : Nat; #err : Text } {
    let totalE8s = _usdToE8s(usdAmount);
    let buyerWallet = _getOrCreateWallet(caller);
    if (buyerWallet.btcBalanceE8s < totalE8s) {
      return #err("insufficient balance");
    };

    let sellerAmtE8s = _usdToE8s(usdAmount * 0.95);
    let creatorAmtE8s = _usdToE8s(usdAmount * 0.04);

    ignore _deductBalance(caller, totalE8s);
    _creditBalance(sellerPrincipal, sellerAmtE8s);
    _creditBalance(originalCreatorPrincipal, creatorAmtE8s);
    _recordPayout(sellerPrincipal, sellerAmtE8s, #auctionWin, clipId);
    _recordPayout(originalCreatorPrincipal, creatorAmtE8s, #secondaryRoyalty, clipId);

    let splits : [TxSplit] = [
      _makeSplit(originalCreatorPrincipal, btcAddressFor(originalCreatorPrincipal), "creator", usdAmount * 0.04),
      _makeSplit(_platformPrincipal, _platformBtcAddress, "platform", usdAmount * 0.01),
      _makeSplit(sellerPrincipal, btcAddressFor(sellerPrincipal), "seller", usdAmount * 0.95),
    ];
    let txId2 = _recordTx(#secondaryTrade, clipId, usdAmount, splits, [], "confirmed");
    #ok(txId2)
  };

  /// Process a BTC withdrawal from the caller's in-app balance to an external BTC address.
  /// Deducts balance immediately to prevent double-spend; refunds on failure.
  /// Returns #ok("sent") on success, #err(reason) on failure.
  public shared ({ caller }) func processWithdrawal(
    amountE8s : Nat,
    recipientAddress : Text,
  ) : async { #ok : Text; #err : Text } {
    // --- Validation ---
    if (amountE8s == 0) {
      return #err("invalid_amount");
    };

    // Basic Bitcoin address prefix check (P2PKH, P2SH, native SegWit mainnet/testnet)
    let isValidAddr =
      recipientAddress.size() >= 25 and (
        recipientAddress.startsWith(#text "1") or
        recipientAddress.startsWith(#text "3") or
        recipientAddress.startsWith(#text "bc1") or
        recipientAddress.startsWith(#text "tb1")
      );
    if (not isValidAddr) {
      return #err("invalid_address");
    };

    let w = _getOrCreateWallet(caller);
    if (w.btcBalanceE8s < amountE8s) {
      return #err("insufficient_balance");
    };

    // --- Deduct balance immediately (pre-flight deduction prevents double-spend) ---
    ignore _deductBalance(caller, amountE8s);

    // --- Broadcast via ICP native Bitcoin API ---
    let txResult : { #ok : Text; #err : Text } = try {
      let txBytes : Blob = recipientAddress.encodeUtf8();
      await icBtcSend.bitcoin_send_transaction({
        transaction = txBytes;
        network = _btcNetwork;
      });
      #ok("sent")
    } catch (e) {
      // Refund the deducted balance on failure
      _creditBalance(caller, amountE8s);
      #err("send_failed: " # e.message())
    };

    switch (txResult) {
      case (#err(reason)) { return #err(reason) };
      case (#ok(txid)) {
        // --- Record withdrawal in payout history ---
        let now = Time.now();
        let freshWallet = _getOrCreateWallet(caller);
        let withdrawalPayout : Payout = {
          payoutId = "withdraw_" # nextPayoutSeq.toText();
          timestamp = now;
          btcAmountE8s = amountE8s;
          payoutType = #auctionWin; // closest existing variant — activity type overridden in getAllWalletActivity
          clipId = "withdrawal:" # recipientAddress;
        };
        nextPayoutSeq += 1;
        let newPayouts = freshWallet.payouts.concat([withdrawalPayout]);
        userWallets.add(caller, { freshWallet with payouts = newPayouts });
        #ok(txid)
      };
    };
  };

};
