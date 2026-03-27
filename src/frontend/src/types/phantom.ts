import type { PublicKey } from "@solana/web3.js";

interface PhantomProvider {
  isPhantom?: boolean;
  isConnected: boolean;
  publicKey: { toString(): string } | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{
    publicKey: { toString(): string };
  }>;
  disconnect(): Promise<void>;
  signTransaction(tx: unknown): Promise<unknown>;
  signMessage(
    msg: Uint8Array,
    encoding: string,
  ): Promise<{ signature: Uint8Array }>;
  on(event: "accountChanged", cb: (publicKey: PublicKey | null) => void): void;
  on(event: string, cb: (...args: unknown[]) => void): void;
  off?(
    event: "accountChanged",
    cb: (publicKey: PublicKey | null) => void,
  ): void;
  off?(event: string, cb: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}
