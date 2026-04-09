// migration.mo — no-op migration.
//
// The ckBTCMinter binding was never a stable variable in the deployed canister
// (it was declared as a local factory function). There is nothing to migrate.
// This module satisfies the (with migration = Migration.run) annotation while
// making no changes to actor state.
module {
  public type OldActor = {};
  public type NewActor = {};

  public func run(_old : OldActor) : NewActor {
    {};
  };
};
