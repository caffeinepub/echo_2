import { useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SplashScreen } from "./components/SplashScreen";
import { PackStyleProvider } from "./context/PackStyleContext";
import { UserSettingsProvider } from "./context/UserSettingsContext";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { PetPage } from "./pages/PetPage";

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {showSplash && <SplashScreen />}
      <main className="min-h-screen">
        <PetPage />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <UserSettingsProvider>
      <ThemeProvider>
        <PackStyleProvider>
          <InternetIdentityProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </InternetIdentityProvider>
        </PackStyleProvider>
      </ThemeProvider>
    </UserSettingsProvider>
  );
}
