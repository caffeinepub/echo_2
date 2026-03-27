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

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around bg-background/75 backdrop-blur-xl border-t border-border h-[68px]">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            type="button"
            key={id}
            data-ocid={`nav.${id}.tab`}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 text-xs font-medium tracking-wide uppercase transition-colors relative
              ${isActive ? "text-echo-blue" : "text-muted-foreground hover:text-foreground"}`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-echo-blue" />
            )}
            <Icon size={20} />
            <span className="text-[10px]">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
