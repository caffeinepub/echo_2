import { ShoppingBag, Sparkles, Tag, Video } from "lucide-react";
import { usePackStyle } from "../context/PackStyleContext";

export type Tab = "library" | "releases" | "collection" | "market";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: "library", label: "Mint", Icon: Video },
  { id: "releases", label: "Releases", Icon: Sparkles },
  { id: "collection", label: "Collection", Icon: ShoppingBag },
  { id: "market", label: "Market", Icon: Tag },
];

const INACTIVE_COLOR = "#8E8E93";

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { activeStyle } = usePackStyle();
  const { accentR, accentG, accentB } = activeStyle;
  const activeColor = `rgb(${accentR},${accentG},${accentB})`;
  const activeGlow = `rgba(${accentR},${accentG},${accentB},0.45)`;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around h-[68px] backdrop-blur-xl border-t"
      style={{
        background: "var(--echo-nav-bg)",
        borderColor: "var(--echo-nav-border)",
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        const color = isActive ? activeColor : INACTIVE_COLOR;
        const opacity = isActive ? 1 : 0.65;
        return (
          <button
            type="button"
            key={id}
            data-ocid={`nav.${id}.tab`}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center justify-center gap-1 flex-1 transition-all relative"
            style={{ color, opacity }}
          >
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{
                  background: activeColor,
                  boxShadow: `0 0 10px ${activeGlow}`,
                }}
              />
            )}
            <Icon size={20} />
            <span
              style={{
                color,
                fontSize: "11px",
                fontFamily:
                  "'DM Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: 500,
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
