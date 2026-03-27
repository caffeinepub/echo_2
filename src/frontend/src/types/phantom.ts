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
  on(event: string, cb: () => void): void;
  off(event: string, cb: () => void): void;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export {};
