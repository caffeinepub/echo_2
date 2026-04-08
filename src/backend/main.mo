import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";



actor {
  // ─────────────────────────────────────────────
  // INLINE ACCESS CONTROL (replaces missing authorization/ package)
  // ─────────────────────────────────────────────

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
  // SEED VIDEO CLIPS
  // Times are approximate nanoseconds relative to a recent reference point.
  // Using Int literals offset from a base to simulate clips within last 7 days.
  // Base ≈ 2026-04-07T00:00:00 UTC in nanoseconds: 1744070400000000000
  // ─────────────────────────────────────────────
  let _seedBase : Int = 1_744_070_400_000_000_000; // 2026-04-07 00:00 UTC

  videoClips.add("clip_001", {
    clip_id = "clip_001";
    creator_principal_id = Principal.fromText("2vxsx-fae"); // anonymous placeholder
    video_file_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    preview_loop_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    timestamp = _seedBase - 518_400_000_000_000; // 6 days ago
    title = ?"Golden Hour Vibes";
    hashtags = ["goldenhour", "sunset", "vibes"];
    explicit_flag = false;
    like_count = 1842;
    like_timestamps = [];
    likes_last_hour = 0;
    likes_last_6_hours = 0;
    likes_last_24_hours = 0;
  });

  videoClips.add("clip_002", {
    clip_id = "clip_002";
    creator_principal_id = Principal.fromText("2vxsx-fae");
    video_file_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
    preview_loop_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
    timestamp = _seedBase - 432_000_000_000_000; // 5 days ago
    title = ?"City Lights After Midnight";
    hashtags = ["citylights", "nightlife", "urban"];
    explicit_flag = false;
    like_count = 3210;
    like_timestamps = [];
    likes_last_hour = 0;
    likes_last_6_hours = 0;
    likes_last_24_hours = 0;
  });

  videoClips.add("clip_003", {
    clip_id = "clip_003";
    creator_principal_id = Principal.fromText("2vxsx-fae");
    video_file_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    preview_loop_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    timestamp = _seedBase - 345_600_000_000_000; // 4 days ago
    title = ?"Coastal Drift";
    hashtags = ["coastaldrift", "ocean", "summer"];
    explicit_flag = false;
    like_count = 987;
    like_timestamps = [];
    likes_last_hour = 0;
    likes_last_6_hours = 0;
    likes_last_24_hours = 0;
  });

  videoClips.add("clip_004", {
    clip_id = "clip_004";
    creator_principal_id = Principal.fromText("2vxsx-fae");
    video_file_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
    preview_loop_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
    timestamp = _seedBase - 259_200_000_000_000; // 3 days ago
    title = ?"Mountain Echo";
    hashtags = ["mountains", "nature", "hiking"];
    explicit_flag = false;
    like_count = 2554;
    like_timestamps = [];
    likes_last_hour = 0;
    likes_last_6_hours = 0;
    likes_last_24_hours = 0;
  });

  videoClips.add("clip_005", {
    clip_id = "clip_005";
    creator_principal_id = Principal.fromText("2vxsx-fae");
    video_file_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";
    preview_loop_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";
    timestamp = _seedBase - 172_800_000_000_000; // 2 days ago
    title = ?"Street Art Dispatch";
    hashtags = ["streetart", "graffiti", "culture"];
    explicit_flag = false;
    like_count = 4102;
    like_timestamps = [];
    likes_last_hour = 0;
    likes_last_6_hours = 0;
    likes_last_24_hours = 0;
  });

  videoClips.add("clip_006", {
    clip_id = "clip_006";
    creator_principal_id = Principal.fromText("2vxsx-fae");
    video_file_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";
    preview_loop_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";
    timestamp = _seedBase - 86_400_000_000_000; // 1 day ago
    title = ?"Neon Rain";
    hashtags = ["neon", "rain", "nightcity"];
    explicit_flag = false;
    like_count = 1530;
    like_timestamps = [];
    likes_last_hour = 0;
    likes_last_6_hours = 0;
    likes_last_24_hours = 0;
  });

  videoClips.add("clip_007", {
    clip_id = "clip_007";
    creator_principal_id = Principal.fromText("2vxsx-fae");
    video_file_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4";
    preview_loop_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4";
    timestamp = _seedBase - 28_800_000_000_000; // 8 hours ago
    title = ?"Desert Dawn";
    hashtags = ["desert", "dawn", "travel"];
    explicit_flag = false;
    like_count = 720;
    like_timestamps = [];
    likes_last_hour = 0;
    likes_last_6_hours = 0;
    likes_last_24_hours = 0;
  });

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
    let seq = nextClipSeq.toText();
    nextClipSeq += 1;
    let clip_id = "clip_" # seq;
    let clip : VideoClip = {
      clip_id;
      creator_principal_id = caller;
      video_file_url;
      preview_loop_url;
      timestamp = Time.now();
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

  /// Like a clip. Each caller can only like once. Returns new like_count.
  public shared ({ caller }) func likeClip(clip_id : Text) : async LikeResult {
    switch (videoClips.get(clip_id)) {
      case (null) { #notFound };
      case (?clip) {
        // Check duplicate
        let alreadyLiked = clip.like_timestamps.find(func(entry : (Principal, Int)) : Bool {
          Principal.equal(entry.0, caller)
        }) != null;
        if (alreadyLiked) return #alreadyLiked;

        let now = Time.now();
        let newTimestamps = clip.like_timestamps.concat([(caller, now)]);
        let updated : VideoClip = { clip with
          like_count = clip.like_count + 1;
          like_timestamps = newTimestamps;
        };
        videoClips.add(clip_id, updated);
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
  // priceHistory: clipId → up to 10 most recent PricePoints (newest first)
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
    // Use last sale price from history if available, else bonding curve
    switch (priceHistory.get(clipId)) {
      case (?points) {
        if (points.size() > 0) {
          points[0].salePrice
        } else {
          bondingCurveStartPrice + (bondingCurvePriceIncrement * _getSoldCount(clipId).toFloat())
        }
      };
      case null {
        bondingCurveStartPrice + (bondingCurvePriceIncrement * _getSoldCount(clipId).toFloat())
      };
    };
  };

  // Internal: record a confirmed sale
  func _recordSale(clipId : Text, editionNumber : Nat, salePrice : Float) {
    let now = Time.now();
    let newPoint : PricePoint = { editionNumber; salePrice; timestamp = now };

    let existing : [PricePoint] = switch (priceHistory.get(clipId)) {
      case (?pts) pts;
      case null [];
    };

    // Prepend new point and keep only last 10
    let combined = [newPoint].concat(existing);
    let trimmed = if (combined.size() > 10) {
      combined.sliceToArray(0, 10)
    } else {
      combined
    };
    priceHistory.add(clipId, trimmed);

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
      case (?pts) pts; // already stored newest first
      case null [];
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
  // SIMULATED PAYMENT ROUTING
  // ─────────────────────────────────────────────

  public type TxType = { #mintFee; #copySale; #secondaryTrade };

  public type TxSplit = {
    principal : Principal;
    btcAddress : Text;
    role : Text;
    usdAmount : Float;
    btcAmountSimulated : Float;
  };

  public type Transaction = {
    id : Nat;
    txType : TxType;
    clipId : Text;
    totalUsd : Float;
    splits : [TxSplit];
    timestamp : Int;
    status : Text;
  };

  let transactions = Map.empty<Nat, Transaction>();
  var nextTxId : Nat = 0;

  let _platformBtcAddress : Text = "3GwDfPKRyNH4MZT3Vnc7GkKbAccNBZcVFh";
  let _btcUsdRate : Float = 50000.0;
  let _platformPrincipal : Principal = Principal.fromText("aaaaa-aa");

  func btcAddressFor(p : Principal) : Text {
    "principal:" # p.toText()
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

  func _recordTx(txType : TxType, clipId : Text, totalUsd : Float, splits : [TxSplit]) : Nat {
    let id = nextTxId;
    nextTxId += 1;
    let tx : Transaction = {
      id;
      txType;
      clipId;
      totalUsd;
      splits;
      timestamp = Time.now();
      status = "simulated";
    };
    transactions.add(id, tx);
    id;
  };

  /// Record a $1 mint fee. 100% to platform wallet.
  public shared func processClipMint(creatorPrincipal : Principal) : async Nat {
    let splits : [TxSplit] = [
      _makeSplit(_platformPrincipal, _platformBtcAddress, "platform", 1.0),
    ];
    _recordTx(#mintFee, "", 1.0, splits);
  };

  /// Record a bonding curve copy sale. 95% to creator, 5% to platform.
  public shared func processCopySale(
    clipId : Text,
    creatorPrincipal : Principal,
    buyerPrincipal : Principal,
    usdAmount : Float,
  ) : async Nat {
    let creatorAmt = usdAmount * 0.95;
    let platformAmt = usdAmount * 0.05;
    let splits : [TxSplit] = [
      _makeSplit(creatorPrincipal, btcAddressFor(creatorPrincipal), "creator", creatorAmt),
      _makeSplit(_platformPrincipal, _platformBtcAddress, "platform", platformAmt),
    ];
    _recordTx(#copySale, clipId, usdAmount, splits);
  };

  /// Record a secondary trade. 4% to original creator, 1% to platform, 95% to seller.
  public shared func processSecondaryTrade(
    clipId : Text,
    originalCreatorPrincipal : Principal,
    sellerPrincipal : Principal,
    buyerPrincipal : Principal,
    usdAmount : Float,
  ) : async Nat {
    let creatorAmt = usdAmount * 0.04;
    let platformAmt = usdAmount * 0.01;
    let sellerAmt = usdAmount * 0.95;
    let splits : [TxSplit] = [
      _makeSplit(originalCreatorPrincipal, btcAddressFor(originalCreatorPrincipal), "creator", creatorAmt),
      _makeSplit(_platformPrincipal, _platformBtcAddress, "platform", platformAmt),
      _makeSplit(sellerPrincipal, btcAddressFor(sellerPrincipal), "seller", sellerAmt),
    ];
    _recordTx(#secondaryTrade, clipId, usdAmount, splits);
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
    totalBtc : Float;
    fromCopySales : Float;
    fromTradeRoyalties : Float;
    fromAuctionWins : Float;
    transactionCount : Nat;
  };

  /// Returns an earnings summary for the calling principal.
  /// Sums splits where role == "creator" or role == "seller".
  public shared query ({ caller }) func getMyEarnings() : async EarningsSummary {
    var totalUsd : Float = 0.0;
    var totalBtc : Float = 0.0;
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
            totalBtc += split.btcAmountSimulated;
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
      totalBtc;
      fromCopySales;
      fromTradeRoyalties;
      fromAuctionWins;
      transactionCount;
    };
  };
};
