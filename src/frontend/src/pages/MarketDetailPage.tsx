import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { SolSymbol } from "../components/SolSymbol";
import { ALBUMS } from "../data/albums";

interface MarketDetailPageProps {
  albumId: string;
  onBack: () => void;
}

const PRICE_HISTORY = [
  { date: "Mar 24", price: 2.1, buyer: "r3ab...2kxq" },
  { date: "Mar 19", price: 1.9, buyer: "4nwt...hf3p" },
  { date: "Mar 11", price: 2.3, buyer: "xpq9...rt7z" },
  { date: "Feb 28", price: 1.7, buyer: "mqy2...6b4s" },
];

const RECENT_SALES = [
  { text: "pale.moon bought #089", price: "2.8", time: "5m ago" },
  { text: "#021 sold for", price: "2.4", time: "44m ago" },
  { text: "orbit.nine listed #007 for", price: "2.1", time: "11m ago" },
];

export function MarketDetailPage({ albumId, onBack }: MarketDetailPageProps) {
  const album = ALBUMS.find((a) => a.id === albumId);
  const [listPrice, setListPrice] = useState("");
  const [listed, setListed] = useState(false);

  if (!album) return null;

  function handleConfirmListing() {
    if (!listPrice) return;
    setListed(true);
  }

  return (
    <div className="px-6 md:px-12 pt-6 pb-4">
      <motion.button
        type="button"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        data-ocid="market_detail.back.button"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft size={16} />
        <span>Market</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-8"
      >
        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden glow-mixed shadow-album">
          <img
            src={album.artworkSrc}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {album.title}
        </h1>
        <p className="text-sm text-muted-foreground">{album.artist}</p>
      </motion.div>

      <div className="max-w-sm mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Collection
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-4 justify-between">
            {[
              { label: "Supply", value: String(album.supply) },
              { label: "In Circulation", value: String(album.minted) },
              { label: "Owners", value: String(album.owners) },
              { label: "Floor", value: "2.1", solPrice: true as const },
              { label: "Last Sale", value: "2.4", solPrice: true as const },
            ].map(({ label, value, solPrice }) => (
              <div key={label} className="text-center min-w-[56px]">
                <p className="text-lg font-bold text-foreground font-mono">
                  {solPrice ? (
                    <>
                      <SolSymbol /> {value}
                    </>
                  ) : (
                    value
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Price History
          </h2>
          <div className="space-y-2">
            {PRICE_HISTORY.map((entry) => (
              <div
                key={`${entry.date}-${entry.buyer}`}
                data-ocid="market_detail.item.1"
                className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
              >
                <span className="text-xs text-muted-foreground">
                  {entry.date}
                </span>
                <span className="text-sm font-medium text-foreground font-mono">
                  <SolSymbol /> {entry.price}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {entry.buyer}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Recent Sales
          </h2>
          <div className="space-y-1.5">
            {RECENT_SALES.map((entry) => (
              <div
                key={`${entry.text}-${entry.time}`}
                className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
              >
                <span className="text-xs text-muted-foreground flex-1 min-w-0 truncate mr-2">
                  {entry.text}{" "}
                  <span className="font-mono text-foreground/70">
                    <SolSymbol /> {entry.price}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-muted-foreground/50 shrink-0">
                  {entry.time}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            List for Sale
          </h2>
          {listed ? (
            <div
              data-ocid="market_detail.success_state"
              className="text-center py-4"
            >
              <p className="text-sm font-semibold text-foreground">
                Listed for <SolSymbol /> {listPrice}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your album is now listed on the market.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="number"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  placeholder="Enter price in SOL"
                  data-ocid="market_detail.price.input"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-echo-blue transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  SOL
                </span>
              </div>
              <button
                type="button"
                onClick={handleConfirmListing}
                disabled={!listPrice}
                data-ocid="market_detail.confirm_button"
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Listing
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
