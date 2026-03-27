import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

actor {
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

  module Album {
    public func compare(album1 : Album, album2 : Album) : Order.Order {
      Text.compare(album1.id, album2.id);
    };
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

  let albums = Map.empty<Text, Album>();
  let releases = Map.empty<Text, Release>();
  let marketListings = Map.empty<Nat, MarketListing>();

  // Sample functions for adding albums/releases (could be extended)
  public shared ({ caller }) func addAlbum(album : Album) : async () {
    albums.add(album.id, album);
  };

  public shared ({ caller }) func addRelease(release : Release) : async () {
    releases.add(release.album.id, release);
  };

  // Query functions
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
};
