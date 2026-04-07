import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // ─── Old types (inlined from previous version) ───────────────────────────
  type UserRole = { #admin; #guest; #user };

  type OldActor = {
    accessControlState : {
      var adminAssigned : Bool;
      userRoles : Map.Map<Principal, UserRole>;
    };
  };

  // ─── New types ────────────────────────────────────────────────────────────
  type NewActor = {
    roleMap : Map.Map<Principal, UserRole>;
    var firstAdminSet : Bool;
  };

  // ─── Migration function ───────────────────────────────────────────────────
  // Consumes accessControlState and maps it to the new inlined role fields.
  public func run(old : OldActor) : NewActor {
    {
      roleMap = old.accessControlState.userRoles;
      var firstAdminSet = old.accessControlState.adminAssigned;
    };
  };
};
