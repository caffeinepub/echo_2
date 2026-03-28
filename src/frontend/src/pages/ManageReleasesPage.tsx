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
  Edit2,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Plus,
  Search,
  Trash2,
  Upload,
  Video,
  X,
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
import { useSolPriceContext } from "../contexts/SolPriceContext";

type FilterStatus = "all" | ReleaseStatus;

const CATEGORY_OPTIONS = [
  "Art",
  "Animation",
  "Fashion",
  "Experimental",
  "Meme",
  "Short Film",
  "Loop",
  "Visual",
  "Ambient",
  "Performance",
];

const STATUS_LABELS: Record<ReleaseStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  live: "Live",
  archived: "Archived",
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
  creator: string;
  videoFileName: string;
  videoDataUrl: string;
  videoExternalUrl: string;
  thumbnailDataUrl: string;
  mintedCount: string;
  artworkDataUrl: string;
  priceUSD: string;
  supply: string;
  maxPerWallet: string;
  releaseDate: string;
  description: string;
  category: string;
  tags: string[];
  rightsStatus: RightsStatus;
  visibility: Visibility;
  status: ReleaseStatus;
  rightsConfirmed: boolean;
}

const DEFAULT_FORM: ReleaseFormData = {
  title: "",
  creator: "",
  videoFileName: "",
  videoDataUrl: "",
  videoExternalUrl: "",
  thumbnailDataUrl: "",
  mintedCount: "0",
  artworkDataUrl: "",
  priceUSD: "5",
  supply: "",
  maxPerWallet: "3",
  releaseDate: "",
  description: "",
  category: "Visual",
  tags: [],
  rightsStatus: "original",
  visibility: "private",
  status: "draft",
  rightsConfirmed: false,
};

function releaseToForm(r: AdminRelease): ReleaseFormData {
  return {
    title: r.title,
    creator: r.creator,
    videoFileName: r.videoFileName ?? "",
    videoDataUrl: r.videoDataUrl ?? "",
    videoExternalUrl: r.videoExternalUrl ?? "",
    thumbnailDataUrl: r.thumbnailDataUrl ?? "",
    mintedCount: String(r.mintedCount ?? 0),
    artworkDataUrl: r.artworkDataUrl ?? "",
    priceUSD: "5",
    supply: String(r.supply),
    maxPerWallet: String(r.maxPerWallet ?? 3),
    releaseDate: r.releaseDate ?? "",
    description: r.description ?? "",
    category: r.category ?? "Visual",
    tags: r.tags ?? [],
    rightsStatus: r.rightsStatus,
    visibility: r.visibility,
    status: r.status,
    rightsConfirmed: false,
  };
}

// ─── Thumbnail Frame Picker ──────────────────────────────────────────────────
function ThumbnailFramePicker({
  videoSrc,
  onCapture,
  capturedFrame,
  isLight,
}: {
  videoSrc: string;
  onCapture: (dataUrl: string) => void;
  capturedFrame: string;
  isLight: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrubTime, setScrubTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.src = videoSrc;
    v.onloadedmetadata = () => setVideoDuration(v.duration || 0);
  }, [videoSrc]);

  function handleScrub(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    setScrubTime(t);
    if (videoRef.current) {
      videoRef.current.currentTime = t;
    }
  }

  function captureFrame() {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 320;
    canvas.height = v.videoHeight || 180;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCapture(dataUrl);
  }

  const borderColor = isLight ? "#E6EAF2" : "var(--echo-border)";
  const textColor = isLight ? "#5b6475" : "var(--echo-text-secondary)";

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: textColor,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Select Thumbnail Frame
      </p>
      {/* Preview video */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="metadata"
        style={{
          width: "100%",
          borderRadius: 6,
          maxHeight: 180,
          background: "#000",
          objectFit: "contain",
        }}
      />
      {/* Scrubber */}
      {videoDuration > 0 && (
        <input
          type="range"
          min={0}
          max={videoDuration}
          step={0.1}
          value={scrubTime}
          onChange={handleScrub}
          data-ocid="release.thumbnail.drag_handle"
          style={{ width: "100%", accentColor: "#7C3AED" }}
        />
      )}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          onClick={captureFrame}
          data-ocid="release.thumbnail.upload_button"
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            background: "oklch(0.45 0.20 290)",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Capture Frame
        </button>
        {capturedFrame && (
          <img
            src={capturedFrame}
            alt="Captured thumbnail"
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: 4,
              border: `1px solid ${borderColor}`,
            }}
          />
        )}
        {capturedFrame && (
          <span
            style={{ fontSize: 11, color: isLight ? "#16A34A" : "#34d399" }}
          >
            Frame captured ✓
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Tags Input ──────────────────────────────────────────────────────────────
function TagsInput({
  tags,
  onChange,
  isLight,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  isLight: boolean;
}) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  const borderColor = isLight ? "#E6EAF2" : "var(--echo-border)";
  const textColor = isLight ? "#0f172a" : "var(--echo-text)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="e.g. dreamy, glitch, neon"
          data-ocid="release.tags.input"
          style={{
            flex: 1,
            padding: "9px 12px",
            borderRadius: 8,
            background: isLight ? "#ffffff" : "var(--echo-input-bg)",
            border: `1px solid ${borderColor}`,
            color: textColor,
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={addTag}
          data-ocid="release.tags.primary_button"
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            background: "oklch(0.45 0.20 290)",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 9px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 500,
                background: isLight
                  ? "rgba(124,58,237,0.08)"
                  : "rgba(124,58,237,0.15)",
                color: isLight
                  ? "rgba(109,40,217,0.8)"
                  : "rgba(167,139,250,0.8)",
                border: `1px solid ${isLight ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.25)"}`,
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                <X
                  size={10}
                  color={
                    isLight ? "rgba(109,40,217,0.6)" : "rgba(167,139,250,0.6)"
                  }
                />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
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
  const { solPrice } = useSolPriceContext();
  const [form, setForm] = useState<ReleaseFormData>(
    editRelease ? releaseToForm(editRelease) : DEFAULT_FORM,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof ReleaseFormData, string>>
  >({});
  const videoInputRef = useRef<HTMLInputElement>(null);
  const artworkRef = useRef<HTMLInputElement>(null);
  const [videoPreviewSrc, setVideoPreviewSrc] = useState("");

  function set(
    field: keyof ReleaseFormData,
    value: string | boolean | string[],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("videoFileName", file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      set("videoDataUrl", dataUrl);
      setVideoPreviewSrc(dataUrl);
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

  function validate(): boolean {
    const errs: Partial<Record<keyof ReleaseFormData, string>> = {};
    if (!form.title.trim()) errs.title = "Video title is required";
    if (!form.creator.trim()) errs.creator = "Creator name is required";
    if (!form.videoFileName && !editRelease?.videoFileName)
      errs.videoFileName = "Video file is required";
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
  const solEquivalent = solPrice > 0 ? (5 / solPrice).toFixed(4) : "...";

  useEffect(() => {
    if (open) {
      setForm(editRelease ? releaseToForm(editRelease) : DEFAULT_FORM);
      setErrors({});
      setVideoPreviewSrc(editRelease?.videoDataUrl ?? "");
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
          {editRelease ? "Edit Release" : "New Video Release"}
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
          {/* Video Title */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Video Title <span style={{ color: "#f87171" }}>*</span>
            </Label>
            <Input
              data-ocid="release.title.input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Enter video title"
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

          {/* Creator Name */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Creator Name <span style={{ color: "#f87171" }}>*</span>
            </Label>
            <Input
              data-ocid="release.creator.input"
              value={form.creator}
              onChange={(e) => set("creator", e.target.value)}
              placeholder="Enter creator name"
              style={{
                background: "var(--echo-input-bg)",
                border: errors.creator
                  ? "1px solid #f87171"
                  : "1px solid var(--echo-border)",
                color: "var(--echo-text)",
                borderRadius: "8px",
              }}
            />
            {errors.creator && (
              <span
                data-ocid="release.creator.error"
                style={{ color: "#f87171", fontSize: "11px" }}
              >
                {errors.creator}
              </span>
            )}
          </div>

          {/* Video File */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Video File <span style={{ color: "#f87171" }}>*</span>
            </Label>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              data-ocid="release.video.upload_button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "var(--echo-input-bg)",
                border: errors.videoFileName
                  ? "1px solid #f87171"
                  : "1px dashed var(--echo-border)",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              <Video
                size={15}
                style={{ color: "var(--echo-text-secondary)", flexShrink: 0 }}
              />
              <span
                style={{
                  color: form.videoFileName
                    ? "var(--echo-text)"
                    : "var(--echo-text-dark)",
                  fontSize: "13px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {form.videoFileName ||
                  editRelease?.videoFileName ||
                  "Click to select video file (MP4, WebM, MOV)"}
              </span>
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              style={{ display: "none" }}
            />
            {errors.videoFileName && (
              <span
                data-ocid="release.video.error"
                style={{ color: "#f87171", fontSize: "11px" }}
              >
                {errors.videoFileName}
              </span>
            )}
          </div>

          {/* Thumbnail Frame Picker — shows after video uploaded */}
          {(videoPreviewSrc || editRelease?.videoDataUrl) && (
            <div className="flex flex-col gap-1">
              <Label
                style={{
                  color: "var(--echo-text-secondary)",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Thumbnail Frame
              </Label>
              <ThumbnailFramePicker
                videoSrc={videoPreviewSrc || editRelease?.videoDataUrl || ""}
                onCapture={(dataUrl) => set("thumbnailDataUrl", dataUrl)}
                capturedFrame={form.thumbnailDataUrl}
                isLight={isLight}
              />
            </div>
          )}

          {/* External Video URL */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              External Video URL (optional)
            </Label>
            <input
              type="url"
              value={form.videoExternalUrl}
              onChange={(e) => set("videoExternalUrl", e.target.value)}
              placeholder="https://arweave.net/... or IPFS link"
              data-ocid="release.video_url.input"
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
          </div>

          {/* Artwork / Fallback thumbnail */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Fallback Artwork (optional)
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
                border: "1px dashed var(--echo-border)",
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
                  <Upload
                    size={16}
                    style={{ color: "var(--echo-text-dark)" }}
                  />
                </div>
              )}
              <span
                style={{ color: "var(--echo-text-dark)", fontSize: "13px" }}
              >
                {form.artworkDataUrl || editRelease?.artworkDataUrl
                  ? "Change artwork"
                  : "Click to select fallback image"}
              </span>
            </button>
            <input
              ref={artworkRef}
              type="file"
              accept="image/*"
              onChange={handleArtworkChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Category <span style={{ color: "#f87171" }}>*</span>
            </Label>
            <Select
              value={form.category}
              onValueChange={(v) => set("category", v)}
            >
              <SelectTrigger
                data-ocid="release.category.select"
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
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Tags
            </Label>
            <TagsInput
              tags={form.tags}
              onChange={(tags) => set("tags", tags)}
              isLight={isLight}
            />
          </div>

          {/* Edition Supply + Max Per Wallet */}
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
            <div className="flex flex-col gap-1 flex-1">
              <Label
                style={{
                  color: "var(--echo-text-secondary)",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Max per wallet
              </Label>
              <Input
                data-ocid="release.max_per_wallet.input"
                type="number"
                min="1"
                step="1"
                value={form.maxPerWallet}
                onChange={(e) => set("maxPerWallet", e.target.value)}
                placeholder="3"
                style={{
                  background: "var(--echo-input-bg)",
                  border: "1px solid var(--echo-border)",
                  color: "var(--echo-text)",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>

          {/* Price (default $5) */}
          <div className="flex flex-col gap-1">
            <Label
              style={{
                color: "var(--echo-text-secondary)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Price (default $5)
            </Label>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "var(--echo-input-bg)",
                border: "1px solid var(--echo-border)",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--echo-text)",
                }}
              >
                $5.00
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--echo-text-dark)",
                  fontFamily: "monospace",
                }}
              >
                ≈ {solEquivalent} SOL at current rate
              </span>
            </div>
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
              Release Date (optional)
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
              Description (optional)
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

          {/* Rights Status */}
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
                  video.
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
  } = useAdminReleases();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRelease, setEditRelease] = useState<AdminRelease | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isAdmin =
    ADMIN_WALLET_ADDRESS !== "" && walletAddress === ADMIN_WALLET_ADDRESS;
  const isConnected = !!walletAddress;

  const filtered = releases.filter((r) => {
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.creator.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  function handleSave(data: ReleaseFormData, id?: string) {
    const solEquivalent =
      typeof (window as any).__solPrice === "number" &&
      (window as any).__solPrice > 0
        ? 5 / (window as any).__solPrice
        : 0.035; // fallback ~$5 at ~$142 SOL
    const releaseData = {
      title: data.title.trim(),
      creator: data.creator.trim(),
      videoFileName: data.videoFileName || undefined,
      videoDataUrl: data.videoDataUrl || undefined,
      videoExternalUrl: data.videoExternalUrl || undefined,
      thumbnailDataUrl: data.thumbnailDataUrl || undefined,
      artworkDataUrl: data.artworkDataUrl || undefined,
      priceSOL: solEquivalent,
      supply: Math.floor(Number(data.supply)),
      mintedCount: Math.floor(Number(data.mintedCount || 0)),
      maxPerWallet: Math.floor(Number(data.maxPerWallet || 3)),
      releaseDate: data.releaseDate || undefined,
      description: data.description.trim() || undefined,
      category: data.category,
      tags: data.tags,
      rightsStatus: data.rightsStatus,
      visibility: data.visibility,
      status: data.status,
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
  ];

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
              : "This page is restricted to the admin wallet."}
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
                    {releases.length} video{releases.length !== 1 ? "s" : ""} ·
                    Admin CMS
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
                  placeholder="Search by title or creator..."
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
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Release list */}
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
                <Video
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
                    : "No video releases yet"}
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
                    : "Create your first video drop to get started."}
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
                    {/* Thumbnail / Artwork */}
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
                      {release.thumbnailDataUrl || release.artworkDataUrl ? (
                        <img
                          src={
                            release.thumbnailDataUrl || release.artworkDataUrl
                          }
                          alt={release.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Video
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
                          marginBottom: "4px",
                        }}
                      >
                        {release.creator}
                      </p>
                      {release.category && (
                        <span
                          style={{
                            fontSize: "9px",
                            padding: "1px 6px",
                            borderRadius: 3,
                            background: "rgba(124,58,237,0.12)",
                            color: "rgba(167,139,250,0.8)",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: "6px",
                            display: "inline-block",
                          }}
                        >
                          {release.category}
                        </span>
                      )}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "5px",
                          alignItems: "center",
                          marginTop: 4,
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
                        $5.00
                      </p>
                      <p style={{ color: textSecondary, fontSize: "11px" }}>
                        {release.supply} eds
                      </p>
                    </div>
                  </div>

                  {/* Rights + Date row */}
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
                    {release.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
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
                        {tag}
                      </span>
                    ))}
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

// Suppress unused import
const _Badge = Badge;
void _Badge;
