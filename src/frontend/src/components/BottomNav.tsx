import { BookOpen, Compass, LayoutGrid, Sparkles } from "lucide-react";

export type Tab = "library" | "releases" | "market" | "collection";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: "library", label: "Library", Icon: BookOpen },
  { id: "releases", label: "Releases", Icon: Sparkles },
  { id: "market", label: "Discover", Icon: Compass },
  { id: "collection", label: "Collection", Icon: LayoutGrid },
];

const ACTIVE_COLOR = "#7ED6B1";
const INACTIVE_COLOR = "#8FA3B2";

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
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
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
        return (
          <button
            type="button"
            key={id}
            data-ocid={`nav.${id}.tab`}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center justify-center gap-1 flex-1 transition-all relative"
            style={{ color }}
          >
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{
                  background: ACTIVE_COLOR,
                  boxShadow: "0 0 10px rgba(126,214,177,0.45)",
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
