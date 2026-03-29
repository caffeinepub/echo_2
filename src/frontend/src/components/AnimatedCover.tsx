import { useEffect, useRef, useState } from "react";

interface AnimatedCoverProps {
  coverImage: string;
  coverMotion?: string;
  motionEnabled?: boolean;
  animate: boolean;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

export function AnimatedCover({
  coverImage,
  coverMotion,
  motionEnabled,
  animate,
  className,
  style,
  alt = "",
}: AnimatedCoverProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const srcAssigned = useRef(false);

  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Show video whenever coverMotion is available, not just when animate=true
  const shouldShowVideo =
    motionEnabled && !!coverMotion && !prefersReducedMotion && !videoError;

  // Only play when both visible and animate prop is true
  const shouldPlay = animate && shouldShowVideo;

  // Assign src lazily on first render when video is shown
  useEffect(() => {
    if (!shouldShowVideo || !videoRef.current) return;
    if (!srcAssigned.current) {
      videoRef.current.src = coverMotion!;
      srcAssigned.current = true;
    }
  }, [shouldShowVideo, coverMotion]);

  // Control play/pause based on shouldPlay
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldShowVideo) return;
    if (shouldPlay) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [shouldPlay, shouldShowVideo]);

  // IntersectionObserver — pause when off-screen
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldShowVideo) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio < 0.1) {
          el.pause();
        } else if (shouldPlay) {
          el.play().catch(() => {});
        }
      },
      { threshold: [0, 0.1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [shouldShowVideo, shouldPlay]);

  // Visibility API — pause when tab hidden
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldShowVideo) return;
    function onVisibilityChange() {
      if (!el) return;
      if (document.hidden) {
        el.pause();
      } else if (shouldPlay) {
        el.play().catch(() => {});
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [shouldShowVideo, shouldPlay]);

  const mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {shouldShowVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={coverImage}
          onError={() => setVideoError(true)}
          style={mediaStyle}
        />
      ) : (
        <img src={coverImage} alt={alt} style={mediaStyle} />
      )}
    </div>
  );
}
