import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../ThemeContext";

interface MarketDetailPageProps {
  id: string;
  onBack: () => void;
}

export function MarketDetailPage({ id, onBack }: MarketDetailPageProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textPrimary = isDark ? "rgba(220, 248, 235, 0.92)" : "#111";
  const textSecondary = isDark ? "rgba(150, 210, 185, 0.65)" : "#6b7280";
  const pageBg = isDark ? "var(--echo-bg)" : "#f8f9fc";

  const panelStyle = isDark
    ? {
        background: "rgba(10, 28, 20, 0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(110, 230, 185, 0.15)",
        boxShadow:
          "0 0 20px rgba(80, 200, 150, 0.08), inset 0 1px 0 rgba(110, 230, 185, 0.07)",
      }
    : {
        background: "white",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      };

  return (
    <div className="min-h-screen pb-32" style={{ background: pageBg }}>
      <div className="px-5 pt-5 pb-2">
        <motion.button
          type="button"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          data-ocid="market_detail.back.button"
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: textSecondary }}
        >
          <ArrowLeft size={15} />
          <span>Discover</span>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-5 pt-6 max-w-xl mx-auto"
      >
        <div className="rounded-2xl px-5 py-6 text-center" style={panelStyle}>
          <p
            className="text-[11px] uppercase tracking-widest mb-2"
            style={{ color: textSecondary }}
          >
            Market Detail
          </p>
          <p className="text-lg font-semibold" style={{ color: textPrimary }}>
            {id}
          </p>
          <p className="text-sm mt-2" style={{ color: textSecondary }}>
            Detailed market data for this slab will appear here.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
