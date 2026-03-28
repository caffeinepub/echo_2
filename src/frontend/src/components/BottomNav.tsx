import { BookOpen, Compass, Sparkles } from "lucide-react";

export type Tab = "library" | "releases" | "market";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: "library", label: "Library", Icon: BookOpen },
  { id: "releases", label: "Releases", Icon: Sparkles },
  { id: "market", label: "Discover", Icon: Compass },
];

const VIOLET = "oklch(0.65 0.20 290)";
const VIOLET_GLOW = "0 0 12px oklch(0.55 0.25 290 / 0.45)";

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
        return (
          <button
            type="button"
            key={id}
            data-ocid={`nav.${id}.tab`}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center justify-center gap-1 flex-1 text-xs font-medium tracking-wide uppercase transition-all relative"
            style={{
              color: isActive ? VIOLET : "var(--echo-text-dark)",
            }}
          >
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{
                  background: VIOLET,
                  boxShadow: VIOLET_GLOW,
                }}
              />
            )}
            <Icon size={20} />
            <span
              className="text-[10px]"
              style={{
                color: isActive ? VIOLET : "var(--echo-text-dark)",
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
