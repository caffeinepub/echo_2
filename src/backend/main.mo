import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // --- TYPES ---

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

  public type CollectibleMediaType = { #photo; #video };

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

  // --- STATE ---

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  // --- COMPARATORS ---

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

  // --- HELPER: pseudo-random roll ---
  // Returns true (~10% chance) for video, false (~90%) for photo
  // Uses Time.now() + serial number as seed; all arithmetic stays in Nat
  func rollIsVideo(serialNumber : Nat, salt : Int) : Bool {
    let saltNat : Nat = Int.abs(salt);
    let seed : Nat = (saltNat + serialNumber * 7919) % 10;
    seed == 0;
  };

  // Count how many collectibles of a given type exist for a release
  func countTypeForRelease(releaseId : Text, isVideo : Bool) : Nat {
    var count = 0;
    for (c in collectibles.values()) {
      if (c.releaseId == releaseId) {
        switch (c.mediaType) {
          case (#video) { if (isVideo) { count += 1 } };
          case (#photo) { if (not isVideo) { count += 1 } };
        };
      };
    };
    count;
  };

  // --- PACK FUNCTIONS ---

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
    // 1. Look up the pack
    switch (packs.get(packId)) {
      case (null) { return #err("Pack not found") };
      case (?pack) {
        // 2. Validate ownership
        if (pack.ownerPrincipal != caller) {
          return #err("You do not own this pack");
        };
        // 3. Validate sealed (atomic: check status first)
        switch (pack.status) {
          case (#opened) { return #err("Pack has already been opened") };
          case (#sealed) {
            let now = Time.now();

            // 4. Atomically mark as opened BEFORE rolling outcome
            let lockedPack : Pack = {
              pack with
              status = #opened;
              openedAt = ?now;
            };
            packs.add(packId, lockedPack);

            // 5. Roll collectible type: video ~10%, photo ~90%
            let isVideo = rollIsVideo(pack.serialNumber, now);

            // 6. Determine edition number within the type for this release
            let typeCount = countTypeForRelease(pack.releaseId, isVideo);
            let editionNumber = typeCount + 1;

            // 7. Calculate type supply based on packCount
            let videoSupply = pack.packCount / 10;
            let photoSupply = pack.packCount - videoSupply;
            let typeSupply = if (isVideo) { videoSupply } else { photoSupply };

            // 8. Build collectible id using dot-notation toText
            let seqStr = nextCollectibleSeq.toText();
            nextCollectibleSeq += 1;
            let collectibleId = "col_" # packId # "_" # seqStr;

            // 9. Build collectible record
            let mediaType : CollectibleMediaType = if (isVideo) { #video } else { #photo };
            let rarity = if (isVideo) { "Rare" } else { "Common" };
            let typeLabel = if (isVideo) { "Video" } else { "Photo" };
            let title = typeLabel # " #" # editionNumber.toText() # " \u{2014} " # pack.setName;

            let collectible : Collectible = {
              id = collectibleId;
              packId = packId;
              ownerPrincipal = caller;
              setName = pack.setName;
              releaseId = pack.releaseId;
              mediaType = mediaType;
              editionNumber = editionNumber;
              totalSupply = pack.totalSupply;
              typeSupply = typeSupply;
              rarity = rarity;
              imageUrl = pack.coverImageUrl;
              title = title;
              creator = "";
              mintDate = now.toText();
              openedAt = now;
            };

            // 10. Store collectible
            collectibles.add(collectibleId, collectible);

            // 11. Update pack with collectible id
            packs.add(packId, { lockedPack with collectibleId = ?collectibleId });

            return #ok(collectible);
          };
        };
      };
    };
  };

  public query ({ caller }) func getUserPacks(user : Principal) : async [Pack] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    packs.values().toArray().filter(func(p : Pack) : Bool { p.ownerPrincipal == user });
  };

  public query ({ caller }) func getUserCollectibles(user : Principal) : async [Collectible] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
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

  // --- USER PROFILE FUNCTIONS ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // --- COLLECTIBLE MARKETPLACE FUNCTIONS ---

  public shared ({ caller }) func addAlbum(album : Album) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add albums");
    };
    albums.add(album.id, album);
  };

  public shared ({ caller }) func addRelease(release : Release) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add releases");
    };
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

  // --- CATEGORY FUNCTIONS ---

  public shared ({ caller }) func createCategory(input : CreateTcgCategoryInput) : async TcgCategory {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    let newCat : TcgCategory = { input with id = nextCategoryId };
    tcgCategories.add(nextCategoryId, newCat);
    nextCategoryId += 1;
    newCat;
  };

  public shared ({ caller }) func updateCategory(input : UpdateTcgCategoryInput) : async TcgCategory {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    if (not tcgCategories.containsKey(input.id)) {
      Runtime.trap("Category not found");
    };
    let updated : TcgCategory = { input with id = input.id };
    tcgCategories.add(input.id, updated);
    updated;
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    tcgCategories.remove(id);
  };

  public shared ({ caller }) func toggleCategoryActive(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle categories");
    };
    switch (tcgCategories.get(id)) {
      case (?cat) {
        tcgCategories.add(id, { cat with isActive = not cat.isActive });
      };
      case (null) { Runtime.trap("Category not found") };
    };
  };

  public query func getCategories() : async [TcgCategory] {
    tcgCategories.values().toArray().filter(func(c) { c.isActive }).sort();
  };

  public query ({ caller }) func getAllCategoriesAdmin() : async [TcgCategory] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all categories");
    };
    tcgCategories.values().toArray().sort();
  };

  // --- TCG SETS CMS FUNCTIONS ---

  public shared ({ caller }) func createSet(input : CreateTcgSetInput) : async TcgSet {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create TCG sets");
    };
    let newSet : TcgSet = { input with id = nextTcgSetId };
    tcgSets.add(nextTcgSetId, newSet);
    nextTcgSetId += 1;
    newSet;
  };

  public shared ({ caller }) func updateSet(input : UpdateTcgSetInput) : async TcgSet {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update TCG sets");
    };
    if (not tcgSets.containsKey(input.id)) {
      Runtime.trap("TCG set not found");
    };
    let updatedSet : TcgSet = { input with id = input.id };
    tcgSets.add(input.id, updatedSet);
    updatedSet;
  };

  public shared ({ caller }) func deleteSet(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete TCG sets");
    };
    tcgSets.remove(id);
  };

  public shared ({ caller }) func toggleSetActive(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle TCG sets");
    };
    switch (tcgSets.get(id)) {
      case (?set) {
        tcgSets.add(id, { set with isActive = not set.isActive });
      };
      case (null) { Runtime.trap("TCG set not found") };
    };
  };

  public query func getSets() : async [TcgSet] {
    tcgSets.values().toArray().filter(func(set) { set.isActive }).sort();
  };

  public query ({ caller }) func getAllSetsAdmin() : async [TcgSet] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can get all sets");
    };
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

  // --- CARD FUNCTIONS ---

  public shared ({ caller }) func createCard(input : CreateTcgCardInput) : async TcgCard {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create cards");
    };
    let newCard : TcgCard = { input with id = nextCardId };
    tcgCards.add(nextCardId, newCard);
    nextCardId += 1;
    newCard;
  };

  public shared ({ caller }) func updateCard(input : UpdateTcgCardInput) : async TcgCard {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update cards");
    };
    if (not tcgCards.containsKey(input.id)) {
      Runtime.trap("Card not found");
    };
    let updated : TcgCard = { input with id = input.id };
    tcgCards.add(input.id, updated);
    updated;
  };

  public shared ({ caller }) func deleteCard(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete cards");
    };
    tcgCards.remove(id);
  };

  public shared ({ caller }) func toggleCardActive(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle cards");
    };
    switch (tcgCards.get(id)) {
      case (?card) {
        tcgCards.add(id, { card with isActive = not card.isActive });
      };
      case (null) { Runtime.trap("Card not found") };
    };
  };

  public shared ({ caller }) func toggleCardSupported(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle card support");
    };
    switch (tcgCards.get(id)) {
      case (?card) {
        tcgCards.add(id, { card with isSupported = not card.isSupported });
      };
      case (null) { Runtime.trap("Card not found") };
    };
  };

  public query func getCardsBySet(setId : Nat) : async [TcgCard] {
    tcgCards.values().toArray().filter(func(c) { c.isActive and c.setId == setId }).sort();
  };

  public query ({ caller }) func getAllCardsAdmin() : async [TcgCard] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all cards");
    };
    tcgCards.values().toArray().sort();
  };

  public query ({ caller }) func getCardsBySetAdmin(setId : Nat) : async [TcgCard] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all cards");
    };
    tcgCards.values().toArray().filter(func(c) { c.setId == setId }).sort();
  };
};
