import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ReleaseStatus = "draft" | "scheduled" | "live" | "archived";
export type RightsStatus = "original" | "licensed" | "private_test";
export type Visibility = "private" | "scheduled" | "public";

export interface AdminRelease {
  id: string;
  title: string;
  artist: string;
  audioFileName?: string;
  audioDataUrl?: string;
  audioExternalUrl?: string;
  artworkDataUrl?: string;
  priceSOL: number;
  supply: number;
  mintedCount?: number;
  releaseDate?: string;
  description?: string;
  genre?: string;
  rightsStatus: RightsStatus;
  visibility: Visibility;
  status: ReleaseStatus;
  createdAt: string;
  updatedAt: string;
}

interface AdminReleasesContextValue {
  releases: AdminRelease[];
  addRelease: (
    data: Omit<AdminRelease, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateRelease: (id: string, data: Partial<AdminRelease>) => void;
  deleteRelease: (id: string) => void;
  publishRelease: (id: string) => void;
  unpublishRelease: (id: string) => void;
  archiveRelease: (id: string) => void;
}

const LS_KEY = "echo_admin_releases";

function loadReleases(): AdminRelease[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as AdminRelease[]) : [];
  } catch {
    return [];
  }
}

function saveReleases(releases: AdminRelease[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(releases));
  } catch {
    // quota exceeded
  }
}

const AdminReleasesContext = createContext<AdminReleasesContextValue | null>(
  null,
);

export function AdminReleasesProvider({
  children,
}: { children: React.ReactNode }) {
  const [releases, setReleases] = useState<AdminRelease[]>(() =>
    loadReleases(),
  );

  useEffect(() => {
    saveReleases(releases);
  }, [releases]);

  const addRelease = useCallback(
    (data: Omit<AdminRelease, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const release: AdminRelease = {
        ...data,
        id: `release_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      setReleases((prev) => [release, ...prev]);
    },
    [],
  );

  const updateRelease = useCallback(
    (id: string, data: Partial<AdminRelease>) => {
      setReleases((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, ...data, updatedAt: new Date().toISOString() }
            : r,
        ),
      );
    },
    [],
  );

  const deleteRelease = useCallback((id: string) => {
    setReleases((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const publishRelease = useCallback((id: string) => {
    setReleases((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "live" as ReleaseStatus,
              visibility: "public" as Visibility,
              updatedAt: new Date().toISOString(),
            }
          : r,
      ),
    );
  }, []);

  const unpublishRelease = useCallback((id: string) => {
    setReleases((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "draft" as ReleaseStatus,
              updatedAt: new Date().toISOString(),
            }
          : r,
      ),
    );
  }, []);

  const archiveRelease = useCallback((id: string) => {
    setReleases((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "archived" as ReleaseStatus,
              updatedAt: new Date().toISOString(),
            }
          : r,
      ),
    );
  }, []);

  return (
    <AdminReleasesContext.Provider
      value={{
        releases,
        addRelease,
        updateRelease,
        deleteRelease,
        publishRelease,
        unpublishRelease,
        archiveRelease,
      }}
    >
      {children}
    </AdminReleasesContext.Provider>
  );
}

export function useAdminReleases(): AdminReleasesContextValue {
  const ctx = useContext(AdminReleasesContext);
  if (!ctx)
    throw new Error(
      "useAdminReleases must be used within AdminReleasesProvider",
    );
  return ctx;
}
