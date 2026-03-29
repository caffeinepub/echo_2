import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Archive,
  ArrowLeft,
  CheckCircle2 as CheckCircle2Icon,
  Edit2,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Music,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { ADMIN_WALLET_ADDRESS } from "../config/admin";
import {
  type AdminRelease,
  type ReleaseStatus,
  type RightsStatus,
  type Visibility,
  useAdminReleases,
} from "../context/AdminReleasesContext";
import { useWalletContext } from "../context/WalletContext";

type FilterStatus = "all" | ReleaseStatus;

const STATUS_LABELS: Record<ReleaseStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  live: "Live",
  archived: "Archived",
  submitted: "Submitted",
  rejected: "Rejected",
};

const RIGHTS_LABELS: Record<RightsStatus, string> = {
  original: "Original / Owned by me",
  licensed: "Licensed / Cleared",
  private_test: "Private test upload",
};

const VISIBILITY_LABELS: Record<Visibility, string> = {
  private: "Private",
  scheduled: "Scheduled",
  public: "Public",
};

function StatusBadge({ status }: { status: ReleaseStatus }) {
  const styles: Record<ReleaseStatus, React.CSSProperties> = {
    draft: {
      background: "rgba(100,116,139,0.18)",
      color: "#94a3b8",
      border: "1px solid rgba(100,116,139,0.3)",
    },
    scheduled: {
      background: "rgba(245,158,11,0.15)",
      color: "#f59e0b",
      border: "1px solid rgba(245,158,11,0.3)",
    },
    live: {
      background: "rgba(16,185,129,0.15)",
      color: "#10b981",
      border: "1px solid rgba(16,185,129,0.3)",
    },
    archived: {
      background: "rgba(71,85,105,0.15)",
      color: "#64748b",
      border: "1px solid rgba(71,85,105,0.25)",
    },
    submitted: {
      background: "rgba(245,158,11,0.15)",
      color: "#f59e0b",
      border: "1px solid rgba(245,158,11,0.3)",
    },
    rejected: {
      background: "rgba(239,68,68,0.15)",
      color: "#ef4444",
      border: "1px solid rgba(239,68,68,0.3)",
    },
  };
  return (
    <span
      style={{
        ...styles[status],
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: "4px",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {status === "live" && <span style={{ marginRight: "4px" }}>●</span>}
      {STATUS_LABELS[status]}
    </span>
  );
}

function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  const icon =
    visibility === "private" ? (
      <Lock size={9} />
    ) : visibility === "public" ? (
      <Globe size={9} />
    ) : (
      <Eye size={9} />
    );
  const styles: Record<Visibility, React.CSSProperties> = {
    private: {
      color: "#f87171",
      background: "rgba(248,113,113,0.12)",
      border: "1px solid rgba(248,113,113,0.25)",
    },
    scheduled: {
      color: "#fbbf24",
      background: "rgba(251,191,36,0.12)",
      border: "1px solid rgba(251,191,36,0.25)",
    },
    public: {
      color: "#34d399",
      background: "rgba(52,211,153,0.12)",
      border: "1px solid rgba(52,211,153,0.25)",
    },
  };
  return (
    <span
      style={{
        ...styles[visibility],
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        padding: "2px 7px",
        borderRadius: "4px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {VISIBILITY_LABELS[visibility]}
    </span>
  );
}

interface ReleaseFormData {
  title: string;
  artist: string;
  audioFileName: string;
  audioDataUrl: string;
  audioExternalUrl: string;
  mintedCount: string;
  artworkDataUrl: string;
  priceSOL: string;
  supply: string;
  releaseDate: string;
  description: string;
  genre: string;
  rightsStatus: RightsStatus;
  visibility: Visibility;
  status: ReleaseStatus;
  rightsConfirmed: boolean;
  coverMotionDataUrl: string;
  motionEnabled: boolean;
}

const DEFAULT_FORM: ReleaseFormData = {
  title: "",
  artist: "",
  audioFileName: "",
  audioDataUrl: "",
  audioExternalUrl: "",
  mintedCount: "0",
  artworkDataUrl: "",
  priceSOL: "",
  supply: "",
  releaseDate: "",
  description: "",
  genre: "",
  rightsStatus: "original",
  visibility: "private",
  status: "draft",
  rightsConfirmed: false,
  coverMotionDataUrl: "",
  motionEnabled: false,
};

function releaseToForm(r: AdminRelease): ReleaseFormData {
  return {
    title: r.title,
    artist: r.artist,
    audioFileName: r.audioFileName ?? "",
    audioDataUrl: r.audioDataUrl ?? "",
    audioExternalUrl: r.audioExternalUrl ?? "",
    mintedCount: String(r.mintedCount ?? 0),
    artworkDataUrl: r.artworkDataUrl ?? "",
    priceSOL: String(r.priceSOL),
    supply: String(r.supply),
    releaseDate: r.releaseDate ?? "",
    description: r.description ?? "",
    genre: r.genre ?? "",
    rightsStatus: r.rightsStatus,
    visibility: r.visibility,
    status: r.status,
    rightsConfirmed: false,
    coverMotionDataUrl: r.coverMotion ?? "",
    motionEnabled: r.motionEnabled ?? false,
  };
}

function ReleaseFormModal({
  open,
  onClose,
  editRelease,
  onSave,
  isLight = false,
}: {
  open: boolean;
  onClose: () => void;
  editRelease: AdminRelease | null;
  onSave: (data: ReleaseFormData, id?: string) => void;
  isLight?: boolean;
}) {
  const [form, setForm] = useState<ReleaseFormData>(
    editRelease ? releaseToForm(editRelease) : DEFAULT_FORM,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof ReleaseFormData, string>>
  >({});
  const audioRef = useRef<HTMLInputElement>(null);
  const artworkRef = useRef<HTMLInputElement>(null);
  const motionRef = useRef<HTMLInputElement>(null);

  function set(field: keyof ReleaseFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("audioFileName", file.name);
    if (file.size > 8 * 1024 * 1024) {
      console.warn(
        "Audio file is large (>8MB). Consider using an external URL instead.",
      );
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      set("audioDataUrl", ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleArtworkChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      set("artworkDataUrl", ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleMotionChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      set("coverMotionDataUrl", ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof ReleaseFormData, string>> = {};
    if (!form.title.trim()) errs.title = "Track title is required";
    if (!form.artist.trim()) errs.artist = "Artist name is required";
    if (!form.audioFileName && !editRelease?.audioFileName)
      errs.audioFileName = "Audio file is required";
    if (!form.artworkDataUrl && !editRelease?.artworkDataUrl)
      errs.artworkDataUrl = "Artwork is required";
    if (
      !form.priceSOL ||
      Number.isNaN(Number(form.priceSOL)) ||
      Number(form.priceSOL) < 0
    )
      errs.priceSOL = "Valid price is required";
    if (
      !form.supply ||
      Number.isNaN(Number(form.supply)) ||
      Number(form.supply) < 1
    )
      errs.supply = "Supply must be at least 1";

    const needsRights = form.status === "live" || form.visibility === "public";
    if (needsRights && !form.rightsConfirmed)
      errs.rightsConfirmed = "You must confirm rights before publishing";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave(form, editRelease?.id);
    onClose();
  }

  const needsRights = form.status === "live" || form.visibility === "public";

  // Sync form reset with open state via effect
  useEffect(() => {
    if (open) {
      setForm(editRelease ? releaseToForm(editRelease) : DEFAULT_FORM);
      setErrors({});
    }
  }, [open, editRelease]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: isLight ? "#f8f9fc" : "var(--echo-bg, #0a0a0f)",
        overflowY: "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch" as const,
        paddingTop: "calc(72px + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(120px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Sticky inner header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 61,
          background: isLight ? "#ffffff" : "var(--echo-bg, #0a0a0f)",
          borderBottom: `1px solid ${isLight ? "#e8ecf3" : "var(--echo-border)"}`,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: isLight ? "#5b6475" : "var(--echo-text-secondary)",
            display: "flex",
            alignItems: "center",
            padding: "4px",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <span
          style={{
            flex: 1,
            fontWeight: 700,
            fontSize: "16px",
            color: isLight ? "#0f172a" : "var(--echo-text)",
          }}
        >
          {editRelease ? "Edit Release" : "New Release"}
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          data-ocid="release.modal.submit_button"
          style={{
            background: "oklch(0.45 0.20 290)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          {editRelease ? "Save Changes" : "Create Release"}
        </button>
      </div>

      {/* Scrollable form body */}
      <div
        style={{
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
        onFocus={(e) => {
          const el = e.target as HTMLElement;
          if (
            el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.tagName === "SELECT"
          ) {
            setTimeout(
              () => el.scrollIntoView({ behavior: "smooth", block: "center" }),
              300,
            );
          }
        }}
      >
        <div className="flex flex-col gap-4 mt-2">
          {/* Track Title */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Track Title <span style={{ color: "#f87171" }}>*</span>
            </Label>
            <Input
              data-ocid="release.title.input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Enter track title"
              style={{
                background: "var(--echo-input-bg)",
                border: errors.title
                  ? "1px solid #f87171"
                  : "1px solid var(--echo-border)",
                color: "var(--echo-text)",
                borderRadius: "8px",
              }}
            />
            {errors.title && (
              <span
                data-ocid="release.title.error"
                style={{ color: "#f87171", fontSize: "11px" }}
              >
                {errors.title}
              </span>
            )}
          </div>

          {/* Artist Name */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Artist Name <span style={{ color: "#f87171" }}>*</span>
            </Label>
            <Input
              data-ocid="release.artist.input"
              value={form.artist}
              onChange={(e) => set("artist", e.target.value)}
              placeholder="Enter artist name"
              style={{
                background: "var(--echo-input-bg)",
                border: errors.artist
                  ? "1px solid #f87171"
                  : "1px solid var(--echo-border)",
                color: "var(--echo-text)",
                borderRadius: "8px",
              }}
            />
            {errors.artist && (
              <span
                data-ocid="release.artist.error"
                style={{ color: "#f87171", fontSize: "11px" }}
              >
                {errors.artist}
              </span>
            )}
          </div>

          {/* Audio File */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Audio File (WAV) <span style={{ color: "#f87171" }}>*</span>
            </Label>
            <button
              type="button"
              onClick={() => audioRef.current?.click()}
              data-ocid="release.audio.upload_button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "var(--echo-input-bg)",
                border: errors.audioFileName
                  ? "1px solid #f87171"
                  : "1px dashed var(--echo-border)",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              <Upload
                size={15}
                style={{ color: "var(--echo-text-secondary)", flexShrink: 0 }}
              />
              <span
                style={{
                  color: form.audioFileName
                    ? "var(--echo-text)"
                    : "var(--echo-text-dark)",
                  fontSize: "13px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {form.audioFileName ||
                  editRelease?.audioFileName ||
                  "Click to select WAV file"}
              </span>
            </button>
            <input
              ref={audioRef}
              type="file"
              accept="audio/wav,audio/x-wav,.wav"
              onChange={handleAudioChange}
              style={{ display: "none" }}
            />
            {errors.audioFileName && (
              <span
                data-ocid="release.audio.error"
                style={{ color: "#f87171", fontSize: "11px" }}
              >
                {errors.audioFileName}
              </span>
            )}
          </div>

          {/* External Audio URL */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              External Audio URL (optional)
            </Label>
            <input
              type="url"
              value={form.audioExternalUrl}
              onChange={(e) => set("audioExternalUrl", e.target.value)}
              placeholder="https://arweave.net/... or IPFS link"
              data-ocid="release.audio_url.input"
              style={{
                background: "var(--echo-input-bg)",
                border: "1px solid var(--echo-border)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--echo-text)",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <span style={{ color: "var(--echo-text-dark)", fontSize: "11px" }}>
              Use a hosted URL (Arweave/IPFS/CDN) instead of or in addition to
              uploading a file.
            </span>
          </div>

          {/* Minted Count */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Minted Count
            </Label>
            <input
              type="number"
              min="0"
              value={form.mintedCount}
              onChange={(e) => set("mintedCount", e.target.value)}
              data-ocid="release.minted_count.input"
              style={{
                background: "var(--echo-input-bg)",
                border: "1px solid var(--echo-border)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--echo-text)",
                fontSize: "13px",
                outline: "none",
                width: "160px",
              }}
            />
          </div>

          {/* Artwork */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Artwork <span style={{ color: "#f87171" }}>*</span>
            </Label>
            <button
              type="button"
              onClick={() => artworkRef.current?.click()}
              data-ocid="release.artwork.upload_button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "var(--echo-input-bg)",
                border: errors.artworkDataUrl
                  ? "1px solid #f87171"
                  : "1px dashed var(--echo-border)",
                cursor: "pointer",
              }}
            >
              {form.artworkDataUrl || editRelease?.artworkDataUrl ? (
                <img
                  src={form.artworkDataUrl || editRelease?.artworkDataUrl}
                  alt="Artwork preview"
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "6px",
                    background: "var(--echo-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Music size={16} style={{ color: "var(--echo-text-dark)" }} />
                </div>
              )}
              <span
                style={{ color: "var(--echo-text-dark)", fontSize: "13px" }}
              >
                {form.artworkDataUrl || editRelease?.artworkDataUrl
                  ? "Change artwork"
                  : "Click to select image"}
              </span>
            </button>
            <input
              ref={artworkRef}
              type="file"
              accept="image/*"
              onChange={handleArtworkChange}
              style={{ display: "none" }}
            />
            {errors.artworkDataUrl && (
              <span
                data-ocid="release.artwork.error"
                style={{ color: "#f87171", fontSize: "11px" }}
              >
                {errors.artworkDataUrl}
              </span>
            )}
          </div>

          {/* Animated Cover */}
          <div className="flex flex-col gap-1.5">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Animated Cover (MP4 / WebM)
            </Label>
            <button
              type="button"
              onClick={() => motionRef.current?.click()}
              data-ocid="release.motion_cover.upload_button"
              style={{
                background: "var(--echo-input-bg)",
                border: "1px solid var(--echo-border)",
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
            >
              <span
                style={{ color: "var(--echo-text-dark)", fontSize: "13px" }}
              >
                {form.coverMotionDataUrl || editRelease?.coverMotion
                  ? "Change animated cover"
                  : "Click to select video"}
              </span>
            </button>
            <input
              ref={motionRef}
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleMotionChange}
              style={{ display: "none" }}
            />
            {(form.coverMotionDataUrl || editRelease?.coverMotion) && (
              <video
                src={form.coverMotionDataUrl || editRelease?.coverMotion}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: "100%",
                  maxHeight: 160,
                  borderRadius: 8,
                  objectFit: "cover",
                  marginTop: 4,
                }}
              />
            )}
            <div className="flex items-center gap-2 mt-1">
              <input
                id="motion-enabled"
                type="checkbox"
                checked={form.motionEnabled}
                onChange={(e) => set("motionEnabled", e.target.checked)}
                data-ocid="release.motion_enabled.checkbox"
                style={{
                  accentColor: "oklch(0.55 0.25 290)",
                  width: 14,
                  height: 14,
                }}
              />
              <label
                htmlFor="motion-enabled"
                style={{
                  color: "var(--echo-text-secondary)",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Enable animated cover
              </label>
            </div>
          </div>

          {/* Price + Supply */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <Label
                style={{
                  color: "var(--echo-text-secondary)",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Price (SOL) <span style={{ color: "#f87171" }}>*</span>
              </Label>
              <Input
                data-ocid="release.price.input"
                type="number"
                step="0.01"
                min="0"
                value={form.priceSOL}
                onChange={(e) => set("priceSOL", e.target.value)}
                placeholder="0.00"
                style={{
                  background: "var(--echo-input-bg)",
                  border: errors.priceSOL
                    ? "1px solid #f87171"
                    : "1px solid var(--echo-border)",
                  color: "var(--echo-text)",
                  borderRadius: "8px",
                }}
              />
              {errors.priceSOL && (
                <span
                  data-ocid="release.price.error"
                  style={{ color: "#f87171", fontSize: "11px" }}
                >
                  {errors.priceSOL}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <Label
                style={{
                  color: "var(--echo-text-secondary)",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Edition Supply <span style={{ color: "#f87171" }}>*</span>
              </Label>
              <Input
                data-ocid="release.supply.input"
                type="number"
                min="1"
                step="1"
                value={form.supply}
                onChange={(e) => set("supply", e.target.value)}
                placeholder="150"
                style={{
                  background: "var(--echo-input-bg)",
                  border: errors.supply
                    ? "1px solid #f87171"
                    : "1px solid var(--echo-border)",
                  color: "var(--echo-text)",
                  borderRadius: "8px",
                }}
              />
              {errors.supply && (
                <span
                  data-ocid="release.supply.error"
                  style={{ color: "#f87171", fontSize: "11px" }}
                >
                  {errors.supply}
                </span>
              )}
            </div>
          </div>

          {/* Release Date */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Release Date
            </Label>
            <Input
              data-ocid="release.date.input"
              type="date"
              value={form.releaseDate}
              onChange={(e) => set("releaseDate", e.target.value)}
              style={{
                background: "var(--echo-input-bg)",
                border: "1px solid var(--echo-border)",
                color: "var(--echo-text)",
                borderRadius: "8px",
              }}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Description
            </Label>
            <Textarea
              data-ocid="release.description.textarea"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional description..."
              rows={3}
              style={{
                background: "var(--echo-input-bg)",
                border: "1px solid var(--echo-border)",
                color: "var(--echo-text)",
                borderRadius: "8px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Genre */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Genre / Tag
            </Label>
            <Input
              data-ocid="release.genre.input"
              value={form.genre}
              onChange={(e) => set("genre", e.target.value)}
              placeholder="e.g. Electronic, Ambient, Hip-Hop"
              style={{
                background: "var(--echo-input-bg)",
                border: "1px solid var(--echo-border)",
                color: "var(--echo-text)",
                borderRadius: "8px",
              }}
            />
          </div>

          {/* Rights Status — admin only */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Rights Status <span style={{ color: "#f87171" }}>*</span>
              <span
                style={{
                  marginLeft: "6px",
                  fontSize: "10px",
                  color: "oklch(0.65 0.20 290)",
                  fontWeight: 500,
                }}
              >
                Admin Only
              </span>
            </Label>
            <Select
              value={form.rightsStatus}
              onValueChange={(v) => set("rightsStatus", v as RightsStatus)}
            >
              <SelectTrigger
                data-ocid="release.rights.select"
                style={{
                  background: "var(--echo-input-bg)",
                  border: "1px solid var(--echo-border)",
                  color: "var(--echo-text)",
                  borderRadius: "8px",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "var(--echo-panel)",
                  border: "1px solid var(--echo-border)",
                }}
              >
                <SelectItem value="original">Original / Owned by me</SelectItem>
                <SelectItem value="licensed">Licensed / Cleared</SelectItem>
                <SelectItem value="private_test">
                  Private test upload
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Visibility <span style={{ color: "#f87171" }}>*</span>
            </Label>
            <Select
              value={form.visibility}
              onValueChange={(v) => set("visibility", v as Visibility)}
            >
              <SelectTrigger
                data-ocid="release.visibility.select"
                style={{
                  background: "var(--echo-input-bg)",
                  border: "1px solid var(--echo-border)",
                  color: "var(--echo-text)",
                  borderRadius: "8px",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "var(--echo-panel)",
                  border: "1px solid var(--echo-border)",
                }}
              >
                <SelectItem value="private">
                  Private — hidden from all public views
                </SelectItem>
                <SelectItem value="scheduled">
                  Scheduled — visible with countdown
                </SelectItem>
                <SelectItem value="public">
                  Public — available in Releases tab
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Release Status <span style={{ color: "#f87171" }}>*</span>
            </Label>
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as ReleaseStatus)}
            >
              <SelectTrigger
                data-ocid="release.status.select"
                style={{
                  background: "var(--echo-input-bg)",
                  border: "1px solid var(--echo-border)",
                  color: "var(--echo-text)",
                  borderRadius: "8px",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "var(--echo-panel)",
                  border: "1px solid var(--echo-border)",
                }}
              >
                <SelectItem value="draft">
                  Draft — not visible to users
                </SelectItem>
                <SelectItem value="scheduled">
                  Scheduled — visible with countdown
                </SelectItem>
                <SelectItem value="live">
                  Live — available in Releases tab
                </SelectItem>
                <SelectItem value="archived">
                  Archived — hidden, kept in admin history
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rights Confirmation */}
          {needsRights && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                background: "rgba(245,158,11,0.08)",
                border: errors.rightsConfirmed
                  ? "1px solid #f87171"
                  : "1px solid rgba(245,158,11,0.25)",
              }}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id="rights-confirm"
                  data-ocid="release.rights.checkbox"
                  checked={form.rightsConfirmed}
                  onCheckedChange={(checked) =>
                    set("rightsConfirmed", !!checked)
                  }
                  style={{ marginTop: "2px" }}
                />
                <label
                  htmlFor="rights-confirm"
                  style={{
                    color: "var(--echo-text)",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    cursor: "pointer",
                  }}
                >
                  I confirm I have the rights or permission to upload this
                  track.
                </label>
              </div>
              {errors.rightsConfirmed && (
                <span
                  data-ocid="release.rights.error"
                  style={{
                    color: "#f87171",
                    fontSize: "11px",
                    marginTop: "6px",
                    display: "block",
                  }}
                >
                  {errors.rightsConfirmed}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              data-ocid="release.modal.cancel_button"
              className="flex-1"
              style={{
                border: "1px solid var(--echo-border)",
                color: "var(--echo-text-secondary)",
                background: "transparent",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              data-ocid="release.modal.submit_button"
              className="flex-1"
              style={{
                background: "oklch(0.45 0.20 290)",
                color: "white",
                border: "none",
              }}
            >
              {editRelease ? "Save Changes" : "Create Release"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({
  releaseName,
  onConfirm,
  onCancel,
}: {
  releaseName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      data-ocid="release.delete.dialog"
      style={{
        padding: "10px 14px",
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <span style={{ color: "var(--echo-text)", fontSize: "12px" }}>
        Delete <strong>{releaseName}</strong>? This cannot be undone.
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          data-ocid="release.delete.confirm_button"
          onClick={onConfirm}
          style={{
            padding: "4px 12px",
            borderRadius: "6px",
            background: "rgba(239,68,68,0.85)",
            color: "white",
            fontSize: "12px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
        <button
          type="button"
          data-ocid="release.delete.cancel_button"
          onClick={onCancel}
          style={{
            padding: "4px 12px",
            borderRadius: "6px",
            background: "transparent",
            color: "var(--echo-text-secondary)",
            fontSize: "12px",
            border: "1px solid var(--echo-border)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface ManageReleasesPageProps {
  onBack: () => void;
}

export function ManageReleasesPage({ onBack }: ManageReleasesPageProps) {
  const { walletAddress } = useWalletContext();
  const {
    releases,
    addRelease,
    updateRelease,
    deleteRelease,
    publishRelease,
    unpublishRelease,
    archiveRelease,
    approveRelease,
    rejectRelease,
  } = useAdminReleases();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRelease, setEditRelease] = useState<AdminRelease | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Access control
  const isAdmin =
    ADMIN_WALLET_ADDRESS !== "" && walletAddress === ADMIN_WALLET_ADDRESS;
  const isConnected = !!walletAddress;

  // Filtered list
  // Note: "submitted" and "rejected" are never shown in public feeds (useReleasesData
  // uses an allowlist: only live/scheduled statuses pass through)
  const submissions = releases.filter((r) => r.status === "submitted");

  const filtered = releases
    .filter((r) => {
      // Never show submitted/rejected in the main admin list unless specifically filtering for submitted
      if (r.status === "submitted" || r.status === "rejected") {
        return filterStatus === "submitted" || filterStatus === r.status;
      }
      const matchesStatus = filterStatus === "all" || r.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.artist.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    })
    .filter((r) => {
      // When showing "submitted" filter, only show submitted items (handled above)
      if (filterStatus === "submitted") return r.status === "submitted";
      // For "rejected" filter show rejected
      if (filterStatus === "rejected") return r.status === "rejected";
      return true;
    });

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null);

  function handleSave(data: ReleaseFormData, id?: string) {
    const releaseData = {
      title: data.title.trim(),
      artist: data.artist.trim(),
      audioFileName: data.audioFileName || undefined,
      audioDataUrl: data.audioDataUrl || undefined,
      audioExternalUrl: data.audioExternalUrl || undefined,
      artworkDataUrl: data.artworkDataUrl || undefined,
      priceSOL: Number(data.priceSOL),
      supply: Math.floor(Number(data.supply)),
      mintedCount: Math.floor(Number(data.mintedCount || 0)),
      releaseDate: data.releaseDate || undefined,
      description: data.description.trim() || undefined,
      genre: data.genre.trim() || undefined,
      rightsStatus: data.rightsStatus,
      visibility: data.visibility,
      status: data.status,
      coverMotion: data.coverMotionDataUrl || undefined,
      motionEnabled: data.motionEnabled || undefined,
    };
    if (id) {
      updateRelease(id, releaseData);
    } else {
      addRelease(releaseData);
    }
  }

  function openEdit(release: AdminRelease) {
    setEditRelease(release);
    setModalOpen(true);
  }

  function openNew() {
    setEditRelease(null);
    setModalOpen(true);
  }

  const FILTER_PILLS: { id: FilterStatus; label: string }[] = [
    { id: "all", label: "All" },
    { id: "draft", label: "Draft" },
    { id: "scheduled", label: "Scheduled" },
    { id: "live", label: "Live" },
    { id: "archived", label: "Archived" },
    { id: "submitted", label: "Submitted" },
  ];

  const submittedCount = releases.filter(
    (r) => r.status === "submitted",
  ).length;

  const panelBg = isLight ? "#ffffff" : "var(--echo-panel)";
  const pageBg = isLight ? "#f8f9fc" : "var(--echo-bg)";
  const borderColor = isLight ? "#e8ecf3" : "var(--echo-border)";
  const textPrimary = isLight ? "#0f172a" : "var(--echo-text)";
  const textSecondary = isLight ? "#5b6475" : "var(--echo-text-secondary)";

  // === ACCESS DENIED SCREEN ===
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          data-ocid="admin.access.panel"
          style={{
            background: panelBg,
            border: `1px solid ${borderColor}`,
            borderRadius: "16px",
            padding: "40px 32px",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <button
            type="button"
            onClick={onBack}
            data-ocid="admin.access.back_button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: textSecondary,
              fontSize: "13px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              marginBottom: "28px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Lock size={24} style={{ color: "#f87171" }} />
          </div>

          <h2
            style={{
              color: textPrimary,
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "10px",
            }}
          >
            {!isConnected ? "Wallet Required" : "Access Denied"}
          </h2>
          <p
            style={{
              color: textSecondary,
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            {!isConnected
              ? "Connect your Phantom wallet to access this page."
              : "This page is restricted to the admin wallet. Your connected wallet does not have access."}
          </p>
        </div>
      </div>
    );
  }

  // === ADMIN CMS ===
  return (
    <div
      style={{ minHeight: "100vh", background: pageBg, paddingBottom: "32px" }}
    >
      {modalOpen ? null : (
        <>
          {/* Page header */}
          <div
            style={{
              padding: "20px 20px 0",
              position: "sticky",
              top: "72px",
              zIndex: 30,
              background: pageBg,
              borderBottom: `1px solid ${borderColor}`,
              paddingBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <button
                  type="button"
                  onClick={onBack}
                  data-ocid="admin.page.back_button"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                    border: `1px solid ${borderColor}`,
                    color: textSecondary,
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={15} />
                </button>
                <div>
                  <h1
                    style={{
                      color: textPrimary,
                      fontSize: "18px",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    Manage Releases
                  </h1>
                  <p
                    style={{
                      color: textSecondary,
                      fontSize: "11px",
                      marginTop: "3px",
                    }}
                  >
                    {releases.length} release{releases.length !== 1 ? "s" : ""}{" "}
                    · Admin CMS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openNew}
                data-ocid="admin.release.open_modal_button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  background: "oklch(0.45 0.20 290)",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 16px oklch(0.45 0.20 290 / 0.35)",
                }}
              >
                <Plus size={15} /> New Release
              </button>
            </div>

            {/* Search + Filters */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div style={{ position: "relative" }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: textSecondary,
                    pointerEvents: "none",
                  }}
                />
                <input
                  data-ocid="admin.search.input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or artist..."
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 34px",
                    borderRadius: "8px",
                    background: isLight ? "#ffffff" : "var(--echo-input-bg)",
                    border: `1px solid ${borderColor}`,
                    color: textPrimary,
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: textSecondary,
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  overflowX: "auto",
                  paddingBottom: "2px",
                }}
              >
                {FILTER_PILLS.map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    data-ocid={`admin.filter.${pill.id}.tab`}
                    onClick={() => setFilterStatus(pill.id)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background:
                        filterStatus === pill.id
                          ? "oklch(0.45 0.20 290)"
                          : "transparent",
                      color: filterStatus === pill.id ? "white" : textSecondary,
                      border:
                        filterStatus === pill.id
                          ? "1px solid transparent"
                          : `1px solid ${borderColor}`,
                      boxShadow:
                        filterStatus === pill.id
                          ? "0 0 12px oklch(0.45 0.20 290 / 0.3)"
                          : "none",
                    }}
                  >
                    {pill.label}
                    {pill.id === "submitted" && submittedCount > 0 && (
                      <span
                        style={{
                          marginLeft: "5px",
                          background:
                            filterStatus === "submitted"
                              ? "rgba(255,255,255,0.25)"
                              : "rgba(245,158,11,0.85)",
                          color:
                            filterStatus === "submitted" ? "white" : "#0a0a0f",
                          borderRadius: "10px",
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "1px 5px",
                          lineHeight: "1.4",
                          display: "inline-block",
                        }}
                      >
                        {submittedCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Incoming Submissions inbox — shown on "all" or "submitted" filter */}
          {(filterStatus === "all" || filterStatus === "submitted") &&
            submissions.length > 0 && (
              <div style={{ padding: "16px 20px 0" }}>
                {/* Inbox header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "3px",
                      height: "20px",
                      borderRadius: "2px",
                      background: "#f59e0b",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <h2
                      style={{
                        color: textPrimary,
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      Incoming Submissions
                    </h2>
                    <p
                      style={{
                        color: "#f59e0b",
                        fontSize: "11px",
                        marginTop: "2px",
                      }}
                    >
                      Submitted by community · {submissions.length} pending
                    </p>
                  </div>
                </div>

                {/* Submission rows */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {submissions.map((sub, idx) => (
                    <div
                      key={sub.id}
                      data-ocid={`admin.submission.item.${idx + 1}`}
                      style={{
                        background: panelBg,
                        border: "1px solid rgba(245,158,11,0.2)",
                        borderLeft: "3px solid #f59e0b",
                        borderRadius: "12px",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {/* Row: artwork + info */}
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Artwork */}
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "8px",
                            flexShrink: 0,
                            overflow: "hidden",
                            background: isLight
                              ? "#f0f1f5"
                              : "rgba(255,255,255,0.06)",
                            border: `1px solid ${borderColor}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {sub.artworkDataUrl ? (
                            <img
                              src={sub.artworkDataUrl}
                              alt={sub.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <Music
                              size={20}
                              style={{ color: textSecondary, opacity: 0.5 }}
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              color: textPrimary,
                              fontSize: "14px",
                              fontWeight: 600,
                              marginBottom: "2px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {sub.title}
                          </p>
                          <p
                            style={{
                              color: textSecondary,
                              fontSize: "12px",
                              marginBottom: "4px",
                            }}
                          >
                            {sub.artist}
                            {sub.genre ? ` · ${sub.genre}` : ""}
                          </p>
                          <p
                            style={{
                              color: textSecondary,
                              fontSize: "11px",
                              fontFamily: "monospace",
                              opacity: 0.7,
                              marginBottom: "4px",
                            }}
                          >
                            {sub.submittedBy
                              ? `${sub.submittedBy.slice(0, 6)}...${sub.submittedBy.slice(-4)}`
                              : "Unknown"}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            <StatusBadge status="submitted" />
                            {sub.submittedAt && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: textSecondary,
                                }}
                              >
                                {new Date(sub.submittedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price / Supply */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p
                            style={{
                              color: textPrimary,
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            {sub.priceSOL} SOL
                          </p>
                          <p style={{ color: textSecondary, fontSize: "11px" }}>
                            {sub.supply} eds
                          </p>
                        </div>
                      </div>

                      {/* Approve popover state */}
                      {approvingId === sub.id && (
                        <div
                          data-ocid="admin.submission.approve.dialog"
                          style={{
                            background: isLight
                              ? "#f8f9fc"
                              : "rgba(255,255,255,0.05)",
                            border: `1px solid ${borderColor}`,
                            borderRadius: "8px",
                            padding: "10px 14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <p
                            style={{
                              color: textPrimary,
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            Approve as:
                          </p>
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              data-ocid="admin.submission.approve_live.button"
                              onClick={() => {
                                approveRelease(sub.id, "live");
                                setApprovingId(null);
                              }}
                              style={{
                                padding: "5px 12px",
                                borderRadius: "6px",
                                background: "rgba(16,185,129,0.15)",
                                color: "#10b981",
                                border: "1px solid rgba(16,185,129,0.3)",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              ● Publish Now
                            </button>
                            <button
                              type="button"
                              data-ocid="admin.submission.approve_draft.button"
                              onClick={() => {
                                approveRelease(sub.id, "draft");
                                setApprovingId(null);
                              }}
                              style={{
                                padding: "5px 12px",
                                borderRadius: "6px",
                                background: "rgba(100,116,139,0.15)",
                                color: "#94a3b8",
                                border: "1px solid rgba(100,116,139,0.3)",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Save as Draft
                            </button>
                            <button
                              type="button"
                              data-ocid="admin.submission.cancel.button"
                              onClick={() => setApprovingId(null)}
                              style={{
                                padding: "5px 12px",
                                borderRadius: "6px",
                                background: "transparent",
                                color: textSecondary,
                                border: `1px solid ${borderColor}`,
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reject confirm */}
                      {rejectConfirmId === sub.id && (
                        <div
                          data-ocid="admin.submission.reject.dialog"
                          style={{
                            padding: "10px 14px",
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "8px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{ color: textPrimary, fontSize: "12px" }}
                          >
                            Reject <strong>{sub.title}</strong>? It will be
                            hidden from all feeds.
                          </span>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              type="button"
                              data-ocid="admin.submission.reject.confirm_button"
                              onClick={() => {
                                rejectRelease(sub.id);
                                setRejectConfirmId(null);
                              }}
                              style={{
                                padding: "4px 12px",
                                borderRadius: "6px",
                                background: "rgba(239,68,68,0.85)",
                                color: "white",
                                fontSize: "12px",
                                fontWeight: 600,
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              data-ocid="admin.submission.reject.cancel_button"
                              onClick={() => setRejectConfirmId(null)}
                              style={{
                                padding: "4px 12px",
                                borderRadius: "6px",
                                background: "transparent",
                                color: textSecondary,
                                fontSize: "12px",
                                border: `1px solid ${borderColor}`,
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <ActionButton
                          icon={<CheckCircle2Icon size={12} />}
                          label="Approve"
                          ocid={`admin.submission.approve.button.${idx + 1}`}
                          onClick={() =>
                            setApprovingId(
                              approvingId === sub.id ? null : sub.id,
                            )
                          }
                          variant="publish"
                          isLight={isLight}
                        />
                        <ActionButton
                          icon={<Edit2 size={12} />}
                          label="Edit"
                          ocid={`admin.submission.edit_button.${idx + 1}`}
                          onClick={() => openEdit(sub)}
                          variant="neutral"
                          isLight={isLight}
                        />
                        <ActionButton
                          icon={<XCircle size={12} />}
                          label="Reject"
                          ocid={`admin.submission.reject_button.${idx + 1}`}
                          onClick={() =>
                            setRejectConfirmId(
                              rejectConfirmId === sub.id ? null : sub.id,
                            )
                          }
                          variant="danger"
                          isLight={isLight}
                        />
                        <ActionButton
                          icon={<Trash2 size={12} />}
                          label="Delete"
                          ocid={`admin.submission.delete_button.${idx + 1}`}
                          onClick={() => setConfirmDeleteId(sub.id)}
                          variant="danger"
                          isLight={isLight}
                        />
                      </div>

                      {/* Delete confirm for submission */}
                      {confirmDeleteId === sub.id && (
                        <DeleteConfirm
                          releaseName={sub.title}
                          onConfirm={() => {
                            deleteRelease(sub.id);
                            setConfirmDeleteId(null);
                          }}
                          onCancel={() => setConfirmDeleteId(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Release list (admin's own releases, excluding submissions) */}
          {filterStatus !== "submitted" && (
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {filtered.length === 0 ? (
                <div
                  data-ocid="admin.release.empty_state"
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    background: panelBg,
                    border: `1px dashed ${borderColor}`,
                    borderRadius: "12px",
                  }}
                >
                  <Music
                    size={32}
                    style={{
                      color: textSecondary,
                      margin: "0 auto 14px",
                      opacity: 0.5,
                    }}
                  />
                  <p
                    style={{
                      color: textPrimary,
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: "6px",
                    }}
                  >
                    {searchQuery || filterStatus !== "all"
                      ? "No releases match"
                      : "No releases yet"}
                  </p>
                  <p
                    style={{
                      color: textSecondary,
                      fontSize: "13px",
                      marginBottom: "18px",
                    }}
                  >
                    {searchQuery || filterStatus !== "all"
                      ? "Try a different search or filter."
                      : "Create your first release to get started."}
                  </p>
                  {filterStatus === "all" && !searchQuery && (
                    <button
                      type="button"
                      onClick={openNew}
                      data-ocid="admin.release.empty_state.open_modal_button"
                      style={{
                        padding: "8px 20px",
                        borderRadius: "10px",
                        background: "oklch(0.45 0.20 290)",
                        color: "white",
                        fontSize: "13px",
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      + New Release
                    </button>
                  )}
                </div>
              ) : (
                filtered.map((release, idx) => (
                  <div
                    key={release.id}
                    data-ocid={`admin.release.item.${idx + 1}`}
                    style={{
                      background: panelBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "12px",
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {/* Row: artwork + info + status */}
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Artwork */}
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "8px",
                          flexShrink: 0,
                          overflow: "hidden",
                          background: isLight
                            ? "#f0f1f5"
                            : "rgba(255,255,255,0.06)",
                          border: `1px solid ${borderColor}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {release.artworkDataUrl ? (
                          <img
                            src={release.artworkDataUrl}
                            alt={release.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Music
                            size={20}
                            style={{ color: textSecondary, opacity: 0.5 }}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            color: textPrimary,
                            fontSize: "14px",
                            fontWeight: 600,
                            marginBottom: "2px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {release.title}
                        </p>
                        <p
                          style={{
                            color: textSecondary,
                            fontSize: "12px",
                            marginBottom: "6px",
                          }}
                        >
                          {release.artist}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "5px",
                            alignItems: "center",
                          }}
                        >
                          <StatusBadge status={release.status} />
                          <VisibilityBadge visibility={release.visibility} />
                        </div>
                      </div>

                      {/* Price / Supply */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p
                          style={{
                            color: textPrimary,
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          {release.priceSOL} SOL
                        </p>
                        <p style={{ color: textSecondary, fontSize: "11px" }}>
                          {release.supply} eds
                        </p>
                      </div>
                    </div>

                    {/* Rights + Genre + Date row */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          color: "oklch(0.65 0.20 290)",
                          background: "rgba(120,80,255,0.12)",
                          border: "1px solid rgba(120,80,255,0.2)",
                          borderRadius: "4px",
                          padding: "2px 7px",
                          fontWeight: 500,
                        }}
                      >
                        {RIGHTS_LABELS[release.rightsStatus]}
                      </span>
                      {release.genre && (
                        <span
                          style={{
                            fontSize: "10px",
                            color: textSecondary,
                            background: isLight
                              ? "#f4f5f8"
                              : "rgba(255,255,255,0.06)",
                            borderRadius: "4px",
                            padding: "2px 7px",
                          }}
                        >
                          {release.genre}
                        </span>
                      )}
                      {release.releaseDate && (
                        <span
                          style={{
                            fontSize: "10px",
                            color: textSecondary,
                            marginLeft: "auto",
                          }}
                        >
                          {new Date(release.releaseDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      )}
                    </div>

                    {/* Confirm delete */}
                    {confirmDeleteId === release.id && (
                      <DeleteConfirm
                        releaseName={release.title}
                        onConfirm={() => {
                          deleteRelease(release.id);
                          setConfirmDeleteId(null);
                        }}
                        onCancel={() => setConfirmDeleteId(null)}
                      />
                    )}

                    {/* Actions */}
                    <div
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      <ActionButton
                        icon={<Edit2 size={12} />}
                        label="Edit"
                        ocid={`admin.release.edit_button.${idx + 1}`}
                        onClick={() => openEdit(release)}
                        variant="neutral"
                        isLight={isLight}
                      />

                      {(release.status === "draft" ||
                        release.status === "scheduled") && (
                        <ActionButton
                          icon={<Globe size={12} />}
                          label="Publish"
                          ocid={`admin.release.publish.button.${idx + 1}`}
                          onClick={() => publishRelease(release.id)}
                          variant="publish"
                          isLight={isLight}
                        />
                      )}

                      {release.status === "live" && (
                        <ActionButton
                          icon={<EyeOff size={12} />}
                          label="Unpublish"
                          ocid={`admin.release.unpublish.button.${idx + 1}`}
                          onClick={() => unpublishRelease(release.id)}
                          variant="neutral"
                          isLight={isLight}
                        />
                      )}

                      {(release.status === "live" ||
                        release.status === "scheduled") && (
                        <ActionButton
                          icon={<Archive size={12} />}
                          label="Archive"
                          ocid={`admin.release.archive.button.${idx + 1}`}
                          onClick={() => archiveRelease(release.id)}
                          variant="neutral"
                          isLight={isLight}
                        />
                      )}

                      <ActionButton
                        icon={<Trash2 size={12} />}
                        label="Delete"
                        ocid={`admin.release.delete_button.${idx + 1}`}
                        onClick={() => setConfirmDeleteId(release.id)}
                        variant="danger"
                        isLight={isLight}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
      {/* Upload/Edit Modal */}
      <ReleaseFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditRelease(null);
        }}
        editRelease={editRelease}
        onSave={handleSave}
        isLight={isLight}
      />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  ocid,
  onClick,
  variant,
  isLight,
}: {
  icon: React.ReactNode;
  label: string;
  ocid: string;
  onClick: () => void;
  variant: "neutral" | "publish" | "danger";
  isLight: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    neutral: {
      background: isLight ? "#f4f5f8" : "rgba(255,255,255,0.06)",
      color: isLight ? "#5b6475" : "rgba(255,255,255,0.65)",
      border: `1px solid ${isLight ? "#e8ecf3" : "rgba(255,255,255,0.1)"}`,
    },
    publish: {
      background: "rgba(16,185,129,0.12)",
      color: "#10b981",
      border: "1px solid rgba(16,185,129,0.3)",
    },
    danger: {
      background: "rgba(239,68,68,0.10)",
      color: "#f87171",
      border: "1px solid rgba(239,68,68,0.25)",
    },
  };

  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "5px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "opacity 0.15s",
        ...styles[variant],
      }}
    >
      {icon}
      {label}
    </button>
  );
}
