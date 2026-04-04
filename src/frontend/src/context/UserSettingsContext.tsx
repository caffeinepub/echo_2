import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_user_settings";

interface UserSettings {
  explicitModeOn: boolean;
}

interface UserSettingsCtx {
  explicitModeOn: boolean;
  setExplicitModeOn: (on: boolean) => void;
}

const UserSettingsContext = createContext<UserSettingsCtx | null>(null);

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { explicitModeOn: false };
    return JSON.parse(raw) as UserSettings;
  } catch {
    return { explicitModeOn: false };
  }
}

function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function UserSettingsProvider({
  children,
}: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setExplicitModeOn = useCallback((on: boolean) => {
    setSettings((prev) => ({ ...prev, explicitModeOn: on }));
  }, []);

  return (
    <UserSettingsContext.Provider
      value={{
        explicitModeOn: settings.explicitModeOn,
        setExplicitModeOn,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings(): UserSettingsCtx {
  const ctx = useContext(UserSettingsContext);
  if (!ctx) {
    throw new Error("useUserSettings must be used inside UserSettingsProvider");
  }
  return ctx;
}
