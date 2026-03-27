import { useState } from "react";

// Stub hook — wire up real wallet/Internet Identity here later
export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);

  function connect() {
    // TODO: integrate Internet Identity
    setIsConnected(true);
    setPrincipal("rrkah-fqaaa-aaaaa-aaaaq-cai");
  }

  function disconnect() {
    setIsConnected(false);
    setPrincipal(null);
  }

  return { isConnected, principal, connect, disconnect };
}
