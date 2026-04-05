import Map "mo:core/Map";

module {
  type OldActor = { /* old state */ };
  type NewActor = { /* new state */ };
  public func run(old : OldActor) : NewActor {
    /* initial migration - fill in old to new state mapping here */
    old;
  };
};

