// migration.mo — upgrades from ckBTC-based wallet to native Bitcoin integration.
//
// Old stable fields being retired:
//   ckbtcLedger — actor ref to ckBTC ledger canister (no longer used)
//   _ckbtcFee   — Nat constant (10), no longer needed
//   ic          — management canister actor ref typed for http_request only
//
// New stable fields:
//   ic          — same management canister (aaaaa-aa) but typed for Bitcoin API
//
// All other stable state (wallets, clips, rounds, etc.) is unchanged and
// inherited implicitly — only the three retired/changed fields appear here.

module {
  // ─── Old actor types (exactly as declared in the previous version) ─────────

  type OldAccount = { owner : Principal; subaccount : ?Blob };

  type OldTransferFromArgs = {
    spender_subaccount : ?Blob;
    from : OldAccount;
    to : OldAccount;
    amount : Nat;
    fee : ?Nat;
    memo : ?Blob;
    created_at_time : ?Nat64;
  };

  type OldTransferFromError = {
    #BadFee : { expected_fee : Nat };
    #BadBurn : { min_burn_amount : Nat };
    #InsufficientFunds : { balance : Nat };
    #InsufficientAllowance : { allowance : Nat };
    #TooOld;
    #CreatedInFuture : { ledger_time : Nat64 };
    #Duplicate : { duplicate_of : Nat };
    #TemporarilyUnavailable;
    #GenericError : { error_code : Nat; message : Text };
  };

  type OldTransferFromResult = { #Ok : Nat; #Err : OldTransferFromError };

  type OldCkbtcLedger = actor {
    icrc1_balance_of : OldAccount -> async Nat;
    icrc2_transfer_from : OldTransferFromArgs -> async OldTransferFromResult;
  };

  type OldHttpHeader = { name : Text; value : Text };

  type OldHttpRequestResult = {
    status : Nat;
    headers : [OldHttpHeader];
    body : Blob;
  };

  type OldHttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    headers : [OldHttpHeader];
    body : ?Blob;
    method : { #get; #post; #head };
    transform : ?{
      function : shared ({ response : OldHttpRequestResult; context : Blob }) -> async OldHttpRequestResult;
      context : Blob;
    };
    is_replicated : ?Bool;
  };

  type OldIc = actor {
    http_request : OldHttpRequestArgs -> async OldHttpRequestResult;
  };

  // ─── New Bitcoin API types ─────────────────────────────────────────────────

  type BitcoinNetwork = { #Mainnet; #Testnet; #Regtest };
  type OutPoint = { txid : Blob; vout : Nat32 };
  type Utxo = { outpoint : OutPoint; value : Nat64; height : Nat32 };
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

  type NewIc = actor {
    bitcoin_get_utxos : GetUtxosRequest -> async GetUtxosResponse;
    bitcoin_get_p2pkh_address : GetP2pkhAddressRequest -> async Text;
  };

  // ─── Migration input / output ──────────────────────────────────────────────

  public type OldActor = {
    ic : OldIc;
    ckbtcLedger : OldCkbtcLedger;
    _ckbtcFee : Nat;
  };

  public type NewActor = {
    ic : NewIc;
  };

  // Consume the three old fields; produce the new `ic` pointing at the same
  // management canister principal (aaaaa-aa).
  public func run(_old : OldActor) : NewActor {
    {
      ic = actor ("aaaaa-aa") : NewIc;
    };
  };
};
