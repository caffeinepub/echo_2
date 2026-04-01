import { ArrowLeft, Calendar, Hash, Layers, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTheme } from "../ThemeContext";
import type { TcgSet } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface SetDetailPageProps {
  slug: string;
  onBack: () => void;
}

export function SetDetailPage({ slug, onBack }: SetDetailPageProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [set, setSet] = useState<TcgSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { actor, isFetching } = useActor();

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    setNotFound(false);
    actor
      .getSetBySlug(slug)
      .then((result) => {
        if (result) {
          setSet(result);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [actor, isFetching, slug]);

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
        border: "1px solid oklch(0.9 0.005 185)",
        boxShadow:
          "0 2px 8px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.04)",
      };

  const textPrimary = isDark ? "rgba(220, 248, 235, 0.92)" : "#111";
  const textSecondary = isDark ? "rgba(150, 210, 185, 0.65)" : "#6b7280";
  const pageBg = isDark ? "var(--echo-bg)" : "#f8f9fc";
  const placeholderBg = isDark ? "rgba(20, 50, 35, 0.6)" : "#eef0f2";
  const placeholderText = isDark ? "rgba(130, 190, 160, 0.5)" : "#9ca3af";

  return (
    <div
      style={{ minHeight: "100vh", background: pageBg, paddingBottom: "32px" }}
      className="px-4 md:px-6 pt-4 max-w-2xl mx-auto"
    >
      {/* Back button */}
      <button
        type="button"
        data-ocid="set_detail.back_button"
        onClick={onBack}
        className="flex items-center gap-2 mb-5 transition-opacity hover:opacity-70"
        style={{
          color: textSecondary,
          fontSize: "14px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {loading && (
        <div
          data-ocid="set_detail.loading_state"
          className="flex flex-col gap-4"
        >
          <div
            className="w-full rounded-2xl"
            style={{
              height: "240px",
              background: isDark ? "rgba(20,50,35,0.4)" : "#e9ecef",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: "24px",
              width: "60%",
              borderRadius: "8px",
              background: isDark ? "rgba(20,50,35,0.4)" : "#e9ecef",
            }}
          />
          <div
            style={{
              height: "16px",
              width: "40%",
              borderRadius: "8px",
              background: isDark ? "rgba(20,50,35,0.4)" : "#e9ecef",
            }}
          />
        </div>
      )}

      {!loading && notFound && (
        <div
          data-ocid="set_detail.error_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <p
            style={{
              color: textPrimary,
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Set not found
          </p>
          <p style={{ color: textSecondary, fontSize: "13px" }}>
            This set doesn't exist or may have been removed.
          </p>
        </div>
      )}

      {!loading && set && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-4"
        >
          {/* Cover image card */}
          <div
            className="w-full rounded-2xl overflow-hidden"
            style={panelStyle}
          >
            <div
              className="w-full flex items-center justify-center"
              style={{
                background: isDark ? "rgba(8, 22, 15, 0.5)" : "#f8f9fa",
                minHeight: "220px",
              }}
            >
              {set.coverImageUrl ? (
                <img
                  src={set.coverImageUrl}
                  alt={set.setName}
                  className="object-contain"
                  style={{
                    maxHeight: "200px",
                    maxWidth: "100%",
                    padding: "16px",
                  }}
                />
              ) : (
                <div
                  className="flex flex-col items-center justify-center rounded-xl"
                  style={{
                    background: placeholderBg,
                    minHeight: "160px",
                    width: "60%",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: placeholderText,
                    }}
                  >
                    {set.setCode}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: placeholderText,
                      letterSpacing: "0.1em",
                    }}
                  >
                    NO IMAGE
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Set info card */}
          <div className="rounded-2xl p-5" style={panelStyle}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h1
                  style={{
                    color: textPrimary,
                    fontSize: "22px",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginBottom: "4px",
                  }}
                >
                  {set.setName}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: isDark
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(16,185,129,0.08)",
                      color: "#10b981",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    {set.setCode}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: isDark ? "rgba(100,130,120,0.2)" : "#f3f4f6",
                      color: textSecondary,
                      border: isDark
                        ? "1px solid rgba(110,230,185,0.1)"
                        : "1px solid #e5e7eb",
                    }}
                  >
                    {set.tcgCategory}
                  </span>
                  {set.featured && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "rgba(245,158,11,0.12)",
                        color: "#f59e0b",
                        border: "1px solid rgba(245,158,11,0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <Star size={9} /> Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata row */}
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} style={{ color: "#10b981" }} />
                <span style={{ color: textSecondary, fontSize: "12px" }}>
                  {Number(set.releaseYear)}
                </span>
              </div>
              {set.cardCount !== undefined && set.cardCount !== null && (
                <div className="flex items-center gap-1.5">
                  <Layers size={12} style={{ color: "#10b981" }} />
                  <span style={{ color: textSecondary, fontSize: "12px" }}>
                    {Number(set.cardCount)} cards
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Hash size={12} style={{ color: "#10b981" }} />
                <span style={{ color: textSecondary, fontSize: "12px" }}>
                  {set.slug}
                </span>
              </div>
            </div>
          </div>

          {/* Listings placeholder */}
          <div
            className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={panelStyle}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: isDark
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(16,185,129,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <Layers size={18} color="#10b981" />
            </div>
            <p
              style={{
                color: textPrimary,
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              Listings for this set coming soon
            </p>
            <p style={{ color: textSecondary, fontSize: "12px" }}>
              Be the first to list cards from {set.setName}.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
