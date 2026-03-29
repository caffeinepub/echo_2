import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Film,
  Image,
  Plus,
  Upload,
  Video,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { useAdminReleases } from "../context/AdminReleasesContext";
import { useWalletContext } from "../context/WalletContext";

interface Props {
  onBack: () => void;
}

type SubmitView = "list" | "form" | "success";

interface SubmitFormData {
  title: string;
  artist: string;
  videoFileName: string;
  videoDataUrl: string;
  artworkDataUrl: string;
  coverMotionDataUrl: string;
  priceSOL: string;
  supply: string;
  maxPerWallet: string;
  genre: string;
  tags: string;
  description: string;
}

const DEFAULT_FORM: SubmitFormData = {
  title: "",
  artist: "",
  videoFileName: "",
  videoDataUrl: "",
  artworkDataUrl: "",
  coverMotionDataUrl: "",
  priceSOL: "0.035",
  supply: "100",
  maxPerWallet: "2",
  genre: "",
  tags: "",
  description: "",
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function CreatorSubmitPage({ onBack }: Props) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { walletAddress } = useWalletContext();
  const { releases, submitRelease } = useAdminReleases();

  const [subView, setSubView] = useState<SubmitView>("list");
  const [form, setForm] = useState<SubmitFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SubmitFormData, string>>
  >({});

  const videoRef = useRef<HTMLInputElement>(null);
  const artworkRef = useRef<HTMLInputElement>(null);
  const motionRef = useRef<HTMLInputElement>(null);

  const mySubmissions = releases.filter((r) => r.submittedBy === walletAddress);

  const pageBg = isLight ? "#f8f9fc" : "var(--echo-bg, #0a0a0f)";
  const panelBg = isLight ? "#ffffff" : "var(--echo-panel, #12121a)";
  const borderColor = isLight
    ? "#e8ecf3"
    : "var(--echo-border, rgba(255,255,255,0.08))";
  const textPrimary = isLight ? "#0f172a" : "var(--echo-text, #f0f0ff)";
  const textSecondary = isLight
    ? "#5b6475"
    : "var(--echo-text-secondary, rgba(240,240,255,0.55))";
  const inputBg = isLight ? "#ffffff" : "rgba(255,255,255,0.05)";

  function set<K extends keyof SubmitFormData>(key: K, val: SubmitFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("videoFileName", file.name);
    const reader = new FileReader();
    reader.onload = (ev) => set("videoDataUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleArtworkChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("artworkDataUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleMotionChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      set("coverMotionDataUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof SubmitFormData, string>> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.artist.trim()) errs.artist = "Creator name is required";
    if (!form.videoFileName) errs.videoFileName = "Video file is required";
    if (!form.artworkDataUrl) errs.artworkDataUrl = "Thumbnail is required";
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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    submitRelease({
      title: form.title.trim(),
      artist: form.artist.trim(),
      audioFileName: form.videoFileName,
      audioDataUrl: form.videoDataUrl || undefined,
      artworkDataUrl: form.artworkDataUrl || undefined,
      coverMotion: form.coverMotionDataUrl || undefined,
      motionEnabled: !!form.coverMotionDataUrl,
      priceSOL: Number(form.priceSOL),
      supply: Math.floor(Number(form.supply)),
      mintedCount: 0,
      genre: form.genre.trim() || undefined,
      description: form.description.trim() || undefined,
      rightsStatus: "original",
      visibility: "private",
      status: "submitted",
      submittedBy: walletAddress ?? undefined,
      submittedAt: new Date().toISOString(),
    });
    setSubView("success");
  }

  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string; border: string }
  > = {
    submitted: {
      label: "Submitted",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.25)",
    },
    approved: {
      label: "Approved",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.25)",
    },
    live: {
      label: "Approved",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.25)",
    },
    draft: {
      label: "Approved",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.25)",
    },
    scheduled: {
      label: "Approved",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.25)",
    },
    rejected: {
      label: "Rejected",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.25)",
    },
  };

  // === SUCCESS SCREEN ===
  if (subView === "success") {
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
          data-ocid="creator.submit.success_state"
          style={{
            background: panelBg,
            border: `1px solid ${borderColor}`,
            borderRadius: "20px",
            padding: "48px 32px",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <CheckCircle2
              size={56}
              style={{ color: "#10b981", margin: "0 auto", display: "block" }}
            />
          </div>
          <h2
            style={{
              color: textPrimary,
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Submitted for Review
          </h2>
          <p
            style={{
              color: textSecondary,
              fontSize: "14px",
              lineHeight: "1.7",
              marginBottom: "8px",
            }}
          >
            Your release was submitted for review.
          </p>
          <p
            style={{
              color: textSecondary,
              fontSize: "13px",
              lineHeight: "1.6",
              marginBottom: "32px",
            }}
          >
            We’ll notify you once it’s been reviewed by our team.
          </p>
          <button
            type="button"
            data-ocid="creator.submit.view_submissions.button"
            onClick={() => {
              setForm(DEFAULT_FORM);
              setErrors({});
              setSubView("list");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 24px",
              borderRadius: "10px",
              background: "oklch(0.45 0.18 200)",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            View My Submissions
          </button>
        </div>
      </div>
    );
  }

  // === SUBMISSION FORM ===
  if (subView === "form") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: pageBg,
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch" as const,
          paddingTop: "calc(72px + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(120px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Sticky header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 61,
            background: isLight ? "#ffffff" : "var(--echo-bg, #0a0a0f)",
            borderBottom: `1px solid ${borderColor}`,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={() => setSubView("list")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: textSecondary,
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
              color: textPrimary,
            }}
          >
            Submit a Release
          </span>
          <button
            type="button"
            data-ocid="creator.submit.submit_button"
            onClick={handleSubmit}
            style={{
              background: "oklch(0.45 0.18 200)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </div>

        {/* Form body */}
        <div
          style={{
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
          onFocus={(e) => {
            const el = e.target as HTMLElement;
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
              setTimeout(
                () =>
                  el.scrollIntoView({ behavior: "smooth", block: "center" }),
                300,
              );
            }
          }}
        >
          <div className="flex flex-col gap-4 mt-2">
            {/* Title */}
            <FieldGroup label="Video Title" required error={errors.title}>
              <Input
                data-ocid="creator.title.input"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Enter your video title"
                style={{
                  background: inputBg,
                  border: errors.title
                    ? "1px solid #f87171"
                    : `1px solid ${borderColor}`,
                  color: textPrimary,
                  borderRadius: "8px",
                }}
              />
            </FieldGroup>

            {/* Creator name */}
            <FieldGroup label="Creator Name" required error={errors.artist}>
              <Input
                data-ocid="creator.artist.input"
                value={form.artist}
                onChange={(e) => set("artist", e.target.value)}
                placeholder="Your creator name"
                style={{
                  background: inputBg,
                  border: errors.artist
                    ? "1px solid #f87171"
                    : `1px solid ${borderColor}`,
                  color: textPrimary,
                  borderRadius: "8px",
                }}
              />
            </FieldGroup>

            {/* Video upload */}
            <FieldGroup
              label="Video File"
              required
              error={errors.videoFileName}
            >
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={handleVideoChange}
              />
              <button
                type="button"
                data-ocid="creator.video.upload_button"
                onClick={() => videoRef.current?.click()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: inputBg,
                  border: errors.videoFileName
                    ? "1px solid #f87171"
                    : `1px dashed ${borderColor}`,
                  color: textSecondary,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                <Video size={16} style={{ flexShrink: 0 }} />
                {form.videoFileName ? (
                  <span
                    style={{
                      color: textPrimary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {form.videoFileName}
                  </span>
                ) : (
                  "Choose video file (MP4, WebM, MOV)"
                )}
              </button>
            </FieldGroup>

            {/* Thumbnail */}
            <FieldGroup
              label="Thumbnail / Artwork"
              required
              error={errors.artworkDataUrl}
            >
              <input
                ref={artworkRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleArtworkChange}
              />
              {form.artworkDataUrl ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <img
                    src={form.artworkDataUrl}
                    alt="Thumbnail"
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: `1px solid ${borderColor}`,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => artworkRef.current?.click()}
                    style={{
                      fontSize: "12px",
                      color: "oklch(0.65 0.18 200)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  data-ocid="creator.artwork.upload_button"
                  onClick={() => artworkRef.current?.click()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background: inputBg,
                    border: errors.artworkDataUrl
                      ? "1px solid #f87171"
                      : `1px dashed ${borderColor}`,
                    color: textSecondary,
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    fontSize: "13px",
                  }}
                >
                  <Image size={16} style={{ flexShrink: 0 }} />
                  Choose thumbnail image
                </button>
              )}
            </FieldGroup>

            {/* Motion artwork (optional) */}
            <FieldGroup label="Motion Artwork (optional)">
              <input
                ref={motionRef}
                type="file"
                accept="video/mp4,video/webm"
                style={{ display: "none" }}
                onChange={handleMotionChange}
              />
              <button
                type="button"
                data-ocid="creator.motion.upload_button"
                onClick={() => motionRef.current?.click()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: inputBg,
                  border: `1px dashed ${borderColor}`,
                  color: textSecondary,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                <Film size={16} style={{ flexShrink: 0 }} />
                {form.coverMotionDataUrl
                  ? "Motion file selected ✔"
                  : "Upload looping MP4/WebM for animated cover"}
              </button>
            </FieldGroup>

            {/* Price */}
            <FieldGroup
              label="Price per Mint (SOL)"
              required
              error={errors.priceSOL}
            >
              <Input
                data-ocid="creator.price.input"
                type="number"
                step="0.001"
                min="0"
                value={form.priceSOL}
                onChange={(e) => set("priceSOL", e.target.value)}
                style={{
                  background: inputBg,
                  border: errors.priceSOL
                    ? "1px solid #f87171"
                    : `1px solid ${borderColor}`,
                  color: textPrimary,
                  borderRadius: "8px",
                }}
              />
            </FieldGroup>

            {/* Supply */}
            <FieldGroup label="Edition Supply" required error={errors.supply}>
              <Input
                data-ocid="creator.supply.input"
                type="number"
                min="1"
                value={form.supply}
                onChange={(e) => set("supply", e.target.value)}
                style={{
                  background: inputBg,
                  border: errors.supply
                    ? "1px solid #f87171"
                    : `1px solid ${borderColor}`,
                  color: textPrimary,
                  borderRadius: "8px",
                }}
              />
            </FieldGroup>

            {/* Max per wallet */}
            <FieldGroup label="Max per Wallet">
              <Input
                data-ocid="creator.maxperwallet.input"
                type="number"
                min="1"
                value={form.maxPerWallet}
                onChange={(e) => set("maxPerWallet", e.target.value)}
                style={{
                  background: inputBg,
                  border: `1px solid ${borderColor}`,
                  color: textPrimary,
                  borderRadius: "8px",
                }}
              />
            </FieldGroup>

            {/* Genre */}
            <FieldGroup label="Genre">
              <Input
                data-ocid="creator.genre.input"
                value={form.genre}
                onChange={(e) => set("genre", e.target.value)}
                placeholder="e.g. Electronic, Ambient, Art..."
                style={{
                  background: inputBg,
                  border: `1px solid ${borderColor}`,
                  color: textPrimary,
                  borderRadius: "8px",
                }}
              />
            </FieldGroup>

            {/* Tags */}
            <FieldGroup label="Tags (optional)">
              <Input
                data-ocid="creator.tags.input"
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="glitch, neon, surreal…"
                style={{
                  background: inputBg,
                  border: `1px solid ${borderColor}`,
                  color: textPrimary,
                  borderRadius: "8px",
                }}
              />
            </FieldGroup>

            {/* Description */}
            <FieldGroup label="Description (optional)">
              <Textarea
                data-ocid="creator.description.textarea"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Tell us about this video drop…"
                rows={3}
                style={{
                  background: inputBg,
                  border: `1px solid ${borderColor}`,
                  color: textPrimary,
                  borderRadius: "8px",
                  resize: "vertical",
                }}
              />
            </FieldGroup>

            {/* Notice */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <p
                style={{
                  color: "#f59e0b",
                  fontSize: "12px",
                  lineHeight: "1.6",
                }}
              >
                <strong>Review required:</strong> Your submission will be
                reviewed by our team before appearing in the public feed. You
                will not be able to self-publish.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === MY SUBMISSIONS LIST ===
  return (
    <div
      style={{ minHeight: "100vh", background: pageBg, paddingBottom: "32px" }}
    >
      {/* Header */}
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
            marginBottom: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              data-ocid="creator.page.back_button"
              onClick={onBack}
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
                Submit a Release
              </h1>
              <p
                style={{
                  color: textSecondary,
                  fontSize: "11px",
                  marginTop: "3px",
                }}
              >
                {mySubmissions.length} submission
                {mySubmissions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            data-ocid="creator.submit.open_modal_button"
            onClick={() => {
              setForm(DEFAULT_FORM);
              setErrors({});
              setSubView("form");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "10px",
              background: "oklch(0.45 0.18 200)",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 16px oklch(0.45 0.18 200 / 0.3)",
            }}
          >
            <Plus size={15} /> Submit New
          </button>
        </div>
      </div>

      {/* List */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {mySubmissions.length === 0 ? (
          <div
            data-ocid="creator.submissions.empty_state"
            style={{
              padding: "56px 24px",
              textAlign: "center",
              background: panelBg,
              border: `1px dashed ${borderColor}`,
              borderRadius: "12px",
            }}
          >
            <Upload
              size={32}
              style={{
                color: textSecondary,
                margin: "0 auto 14px",
                opacity: 0.4,
                display: "block",
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
              No submissions yet
            </p>
            <p
              style={{
                color: textSecondary,
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              Submit your first release for review.
            </p>
            <button
              type="button"
              data-ocid="creator.empty.submit_button"
              onClick={() => {
                setForm(DEFAULT_FORM);
                setErrors({});
                setSubView("form");
              }}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                background: "oklch(0.45 0.18 200)",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              + Submit a Release
            </button>
          </div>
        ) : (
          mySubmissions.map((r, idx) => {
            const sc = statusConfig[r.status] ?? statusConfig.submitted;
            return (
              <div
                key={r.id}
                data-ocid={`creator.submissions.item.${idx + 1}`}
                style={{
                  background: panelBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "12px",
                  padding: "14px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    flexShrink: 0,
                    overflow: "hidden",
                    background: isLight ? "#f0f1f5" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${borderColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {r.artworkDataUrl ? (
                    <img
                      src={r.artworkDataUrl}
                      alt={r.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Video
                      size={18}
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
                    {r.title}
                  </p>
                  <p
                    style={{
                      color: textSecondary,
                      fontSize: "12px",
                      marginBottom: "6px",
                    }}
                  >
                    {r.artist}
                    {r.genre ? ` · ${r.genre}` : ""}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        background: sc.bg,
                        color: sc.color,
                        border: `1px solid ${sc.border}`,
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {r.status === "submitted" && (
                        <span style={{ marginRight: "3px" }}>⏳</span>
                      )}
                      {r.status === "rejected" && (
                        <span style={{ marginRight: "3px" }}>✕</span>
                      )}
                      {(r.status === "live" ||
                        r.status === "draft" ||
                        r.status === "scheduled") && (
                        <span style={{ marginRight: "3px" }}>✓</span>
                      )}
                      {sc.label}
                    </span>
                    {r.submittedAt && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: textSecondary,
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <Clock size={10} />
                        {formatRelativeTime(r.submittedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Label
        style={{
          color: isLight ? "#5b6475" : "var(--echo-text-secondary)",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label} {required && <span style={{ color: "#f87171" }}>*</span>}
      </Label>
      {children}
      {error && (
        <span style={{ color: "#f87171", fontSize: "11px" }}>{error}</span>
      )}
    </div>
  );
}
