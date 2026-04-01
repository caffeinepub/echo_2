import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
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

  public type UserProfile = {
    name : Text;
  };

  // --- STATE ---

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let albums = Map.empty<Text, Album>();
  let releases = Map.empty<Text, Release>();
  let marketListings = Map.empty<Nat, MarketListing>();

  let tcgSets = Map.empty<Nat, TcgSet>();
  var nextTcgSetId = 17;

  let userProfiles = Map.empty<Principal, UserProfile>();

  // --- COMPARATORS ---

  module TcgSet {
    public func compare(tcg1 : TcgSet, tcg2 : TcgSet) : Order.Order {
      // Sort by sortOrder (ascending), then releaseYear (descending for same sortOrder)
      switch (Nat.compare(tcg1.sortOrder, tcg2.sortOrder)) {
        case (#less) { #less };
        case (#greater) { #greater };
        case (#equal) {
          Nat.compare(tcg2.releaseYear, tcg1.releaseYear);
        };
      };
    };
  };

  module Album {
    public func compare(album1 : Album, album2 : Album) : Order.Order {
      Text.compare(album1.id, album2.id);
    };
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

  public query ({ caller }) func getAlbums() : async [Album] {
    albums.values().toArray().sort();
  };

  public query ({ caller }) func getReleases() : async [Release] {
    releases.values().toArray();
  };

  public query ({ caller }) func getMarketListings() : async [MarketListing] {
    marketListings.values().toArray();
  };

  public query ({ caller }) func getAlbumById(id : Text) : async ?Album {
    albums.get(id);
  };

  // --- TCG SETS CMS FUNCTIONS ---

  public shared ({ caller }) func createSet(input : CreateTcgSetInput) : async TcgSet {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create TCG sets");
    };

    let newSet : TcgSet = {
      input with
      id = nextTcgSetId;
    };

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

    let updatedSet : TcgSet = {
      input with
      id = input.id;
    };

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
        let updatedSet : TcgSet = {
          set with
          isActive = not set.isActive;
        };
        tcgSets.add(id, updatedSet);
      };
      case (null) {
        Runtime.trap("TCG set not found");
      };
    };
  };

  public query ({ caller }) func getSets() : async [TcgSet] {
    tcgSets.values().toArray().filter(func(set) { set.isActive }).sort();
  };

  public query ({ caller }) func getAllSetsAdmin() : async [TcgSet] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can get all sets");
    };
    tcgSets.values().toArray().sort();
  };

  public query ({ caller }) func getSetBySlug(slug : Text) : async ?TcgSet {
    tcgSets.values().toArray().find(func(set) { set.slug == slug });
  };

  public query ({ caller }) func getSetById(id : Nat) : async ?TcgSet {
    tcgSets.get(id);
  };

  public query ({ caller }) func searchSetsByName(searchTerm : Text) : async [TcgSet] {
    tcgSets.values().toArray().filter(func(set) { set.setName.contains(#text searchTerm) });
  };

  public query ({ caller }) func getFeaturedSets() : async [TcgSet] {
    tcgSets.values().toArray().filter(func(set) { set.featured });
  };

  public query ({ caller }) func getPokemonSets() : async [TcgSet] {
    tcgSets.values().toArray().filter(func(set) { set.tcgCategory == "Pokemon" });
  };
};
