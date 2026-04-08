import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle,
  Clock,
  Copy,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Variant_pending_confirmed, WalletActivityType } from "../backend.d";
import type { Deposit, WalletActivity } from "../backend.d";
import { useDepositPolling, useWalletContext } from "../context/WalletContext";

// ─── QR code via canvas ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    QRCode: any;
  }
}

function QRCodeDisplay({ value }: { value: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!value) return;

    function render() {
      if (!containerRef.current || !window.QRCode) return;
      containerRef.current.innerHTML = "";
      try {
        new window.QRCode(containerRef.current, {
          text: value,
          width: 160,
          height: 160,
          colorDark: "#7C3AED",
          colorLight: "#ffffff",
          correctLevel: window.QRCode.CorrectLevel.M,
        });
        setLoaded(true);
      } catch {
        setError(true);
      }
    }

    if (window.QRCode) {
      render();
      return;
    }

    // Load library dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
    script.onload = () => {
      render();
    };
    script.onerror = () => setError(true);
    document.head.appendChild(script);
  }, [value]);

  if (error) {
    return (
      <div
        style={{
          width: 160,
          height: 160,
          border: "2px dashed rgba(124,58,237,0.35)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: "rgba(124,58,237,0.7)",
          textAlign: "center",
          padding: 8,
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        QR unavailable
        <br />
        Copy address
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {!loaded && (
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: 12,
            background: "rgba(124,58,237,0.06)",
            border: "2px solid rgba(124,58,237,0.2)",
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        />
      )}
      <div
        ref={containerRef}
        data-ocid="deposit.qr_code"
        style={{
          opacity: loaded ? 1 : 0,
          borderRadius: 12,
          overflow: "hidden",
          border: "2px solid rgba(124,58,237,0.25)",
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const E8S_PER_BTC = 100_000_000;

function e8sToBtc(e8s: bigint): string {
  return (Number(e8s) / E8S_PER_BTC).toFixed(8);
}

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function activityLabel(type: WalletActivityType): string {
  if (type === WalletActivityType.deposit) return "Deposit";
  if (type === WalletActivityType.mintCost) return "Mint Cost";
  if (type === WalletActivityType.auctionPayout) return "Auction Payout";
  if (type === WalletActivityType.withdrawal) return "Withdrawal";
  return "Activity";
}

function activityIcon(type: WalletActivityType) {
  if (type === WalletActivityType.deposit)
    return <ArrowDownToLine size={13} style={{ color: "#10b981" }} />;
  if (type === WalletActivityType.mintCost)
    return <span style={{ fontSize: 13 }}>🔥</span>;
  if (type === WalletActivityType.withdrawal)
    return <Send size={13} style={{ color: "#7C3AED" }} />;
  return <span style={{ fontSize: 13 }}>⭐</span>;
}

// ─── DepositModal ─────────────────────────────────────────────────────────────

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  btcPrice: number | null;
}

export function DepositModal({ open, onClose, btcPrice }: DepositModalProps) {
  const {
    depositAddress,
    addressLoading,
    addressError,
    retryAddressFetch,
    deposits,
    walletActivity,
    btcBalance,
    checkDeposits,
    refreshDeposits,
  } = useWalletContext();

  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Poll for new deposits every 30s while open
  useDepositPolling(open);

  // Initial fetch when modal opens — only if address not already loaded
  useEffect(() => {
    if (open && !depositAddress) {
      refreshDeposits();
    }
  }, [open, depositAddress, refreshDeposits]);

  const handleCopy = useCallback(() => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [depositAddress]);

  const handleManualCheck = useCallback(async () => {
    setIsChecking(true);
    await checkDeposits();
    setIsChecking(false);
  }, [checkDeposits]);

  if (!open) return null;

  const pendingDeposits = deposits.filter(
    (d) => d.confirmationStatus === Variant_pending_confirmed.pending,
  );
  const confirmedDeposits = deposits.filter(
    (d) => d.confirmationStatus === Variant_pending_confirmed.confirmed,
  );

  const usdBalance =
    btcBalance !== null && btcPrice !== null ? btcBalance * btcPrice : null;

  // Derived address display state
  const isAddressLoading =
    addressLoading || (depositAddress === null && addressError === null);
  const isAddressError = !isAddressLoading && addressError !== null;
  const isAddressReady =
    !isAddressLoading && !isAddressError && !!depositAddress;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        data-ocid="deposit.modal"
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(124,58,237,0.20)",
          boxShadow:
            "0 20px 60px rgba(124,58,237,0.12), 0 0 0 1px rgba(124,58,237,0.06)",
          padding: "20px 16px 32px",
          maxHeight: "88dvh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(124,58,237,0.10)",
                border: "1px solid rgba(124,58,237,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowDownToLine size={15} style={{ color: "#7C3AED" }} />
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#0D1520",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Fund your Minty Wallet
            </span>
          </div>
          <button
            type="button"
            data-ocid="deposit.modal.close"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.05)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Current balance pill */}
        <div
          style={{
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.18)",
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#8BAEC8",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Current Balance
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#7C3AED",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {btcBalance !== null ? (
              <>
                {btcBalance.toFixed(5)} BTC
                {usdBalance !== null && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#8BAEC8",
                      marginLeft: 6,
                    }}
                  >
                    ($
                    {usdBalance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    )
                  </span>
                )}
              </>
            ) : (
              "— BTC"
            )}
          </span>
        </div>

        {/* Instruction */}
        <p
          style={{
            fontSize: 13,
            color: "#5B7FA6",
            marginBottom: 16,
            lineHeight: 1.5,
            fontFamily: "DM Sans, sans-serif",
            textAlign: "center",
          }}
        >
          Send BTC to this address to fund your Minty wallet.
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          {isAddressLoading && (
            <div
              data-ocid="deposit.qr_loading"
              style={{
                width: 160,
                height: 160,
                borderRadius: 12,
                background: "rgba(124,58,237,0.06)",
                border: "2px solid rgba(124,58,237,0.18)",
                animation: "pulse 1.4s ease-in-out infinite",
              }}
            />
          )}
          {isAddressError && (
            <div
              data-ocid="deposit.qr_error"
              style={{
                width: 160,
                height: 160,
                borderRadius: 12,
                background: "rgba(239,68,68,0.04)",
                border: "2px dashed rgba(239,68,68,0.25)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={28} style={{ color: "rgba(239,68,68,0.6)" }} />
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(239,68,68,0.7)",
                  fontFamily: "DM Sans, sans-serif",
                  textAlign: "center",
                  padding: "0 12px",
                  lineHeight: 1.4,
                }}
              >
                Could not load
                <br />
                QR code
              </span>
            </div>
          )}
          {isAddressReady && <QRCodeDisplay value={depositAddress!} />}
        </div>

        {/* Address box */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              color: "#8BAEC8",
              marginBottom: 5,
              textAlign: "center",
              fontFamily: "DM Sans, sans-serif",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Your deposit address
          </div>

          {/* Loading state */}
          {isAddressLoading && (
            <div
              data-ocid="deposit.address_loading"
              style={{
                height: 40,
                borderRadius: 12,
                background: "rgba(124,58,237,0.04)",
                border: "1px solid rgba(124,58,237,0.15)",
                animation: "pulse 1.4s ease-in-out infinite",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(124,58,237,0.5)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Generating your deposit address…
              </span>
            </div>
          )}

          {/* Error state */}
          {isAddressError && (
            <div
              data-ocid="deposit.address_error"
              style={{
                borderRadius: 12,
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.18)",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle
                  size={13}
                  style={{ color: "#ef4444", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: "#ef4444",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  Could not load deposit address.
                </span>
              </div>
              <button
                type="button"
                data-ocid="deposit.address_retry"
                onClick={retryAddressFetch}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#7C3AED",
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.28)",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <RefreshCw size={11} />
                Try again
              </button>
            </div>
          )}

          {/* Success state */}
          {isAddressReady && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{
                background: "rgba(0,0,0,0.02)",
                border: "1px solid #D0DFEF",
              }}
            >
              <span
                data-ocid="deposit.address_text"
                className="flex-1 truncate font-mono"
                style={{ fontSize: 11, color: "#7C3AED" }}
              >
                {depositAddress}
              </span>
              <button
                type="button"
                data-ocid="deposit.copy_button"
                onClick={handleCopy}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 500,
                  color: copied ? "#10b981" : "#7C3AED",
                  background: copied
                    ? "rgba(16,185,129,0.08)"
                    : "rgba(124,58,237,0.08)",
                  border: copied
                    ? "1px solid rgba(16,185,129,0.25)"
                    : "1px solid rgba(124,58,237,0.25)",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <Copy size={10} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>

        {/* Min confirmations note */}
        <div
          style={{
            fontSize: 11,
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: 20,
            fontFamily: "DM Sans, sans-serif",
            lineHeight: 1.5,
          }}
        >
          Minimum 1 confirmation required · Do not send other currencies
        </div>

        {/* Manual check button */}
        <button
          type="button"
          data-ocid="deposit.check_button"
          onClick={handleManualCheck}
          disabled={isChecking}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: 13,
            fontWeight: 600,
            color: isChecking ? "#9ca3af" : "#7C3AED",
            background: isChecking
              ? "rgba(0,0,0,0.03)"
              : "rgba(124,58,237,0.07)",
            border: `1px solid ${isChecking ? "#D0DFEF" : "rgba(124,58,237,0.25)"}`,
            borderRadius: 12,
            cursor: isChecking ? "not-allowed" : "pointer",
            marginBottom: 20,
            transition: "all 0.2s ease",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {isChecking ? "Checking…" : "Check for new deposits"}
        </button>

        {/* Pending deposits */}
        {pendingDeposits.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#9ca3af",
                marginBottom: 8,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Pending
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pendingDeposits.map((dep) => (
                <div
                  key={dep.depositId}
                  data-ocid="deposit.pending_item"
                  style={{
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Clock
                    size={14}
                    style={{ color: "#d97706", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#d97706",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {e8sToBtc(dep.btcAmountE8s)} BTC
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      Deposit detected, awaiting confirmation
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#d97706",
                      background: "rgba(245,158,11,0.12)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      borderRadius: 20,
                      padding: "2px 8px",
                      fontWeight: 600,
                      fontFamily: "DM Sans, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                    }}
                  >
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed deposits */}
        {confirmedDeposits.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#9ca3af",
                marginBottom: 8,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Confirmed
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {confirmedDeposits.slice(0, 5).map((dep) => (
                <div
                  key={dep.depositId}
                  data-ocid="deposit.confirmed_item"
                  style={{
                    background: "rgba(16,185,129,0.05)",
                    border: "1px solid rgba(16,185,129,0.20)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <CheckCircle
                    size={14}
                    style={{ color: "#10b981", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#059669",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      +{e8sToBtc(dep.btcAmountE8s)} BTC
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {formatDate(dep.timestamp)}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#059669",
                      background: "rgba(16,185,129,0.10)",
                      border: "1px solid rgba(16,185,129,0.22)",
                      borderRadius: 20,
                      padding: "2px 8px",
                      fontWeight: 600,
                      fontFamily: "DM Sans, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                    }}
                  >
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wallet activity history (compact) */}
        {walletActivity.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#9ca3af",
                marginBottom: 8,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Recent Activity
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {walletActivity.slice(0, 6).map((act, idx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable index
                  key={idx}
                  data-ocid="deposit.activity_row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    background: "rgba(0,0,0,0.02)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    borderRadius: 10,
                  }}
                >
                  <span style={{ flexShrink: 0 }}>
                    {activityIcon(act.activityType)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {activityLabel(act.activityType)}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#9ca3af",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {formatDate(act.timestamp)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color:
                          act.activityType === WalletActivityType.deposit
                            ? "#059669"
                            : act.activityType === WalletActivityType.withdrawal
                              ? "#7C3AED"
                              : "#7C3AED",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {act.activityType === WalletActivityType.deposit
                        ? "+"
                        : "−"}
                      {e8sToBtc(act.btcAmountE8s)} BTC
                    </div>
                    {act.status === Variant_pending_confirmed.pending && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "#d97706",
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        Pending
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {deposits.length === 0 && walletActivity.length === 0 && (
          <div
            data-ocid="deposit.empty_state"
            style={{
              textAlign: "center",
              padding: "20px 16px",
              background: "rgba(124,58,237,0.04)",
              border: "1px solid rgba(124,58,237,0.12)",
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>₿</div>
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                margin: 0,
                fontFamily: "DM Sans, sans-serif",
                lineHeight: 1.5,
              }}
            >
              No deposits yet — send BTC to the address above to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
