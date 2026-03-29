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

  const shouldAnimate =
    animate &&
    motionEnabled &&
    coverMotion &&
    !prefersReducedMotion &&
    !videoError;

  // Assign src lazily when animation first starts
  useEffect(() => {
    if (!shouldAnimate || !videoRef.current) return;
    if (!srcAssigned.current) {
      videoRef.current.src = coverMotion!;
      srcAssigned.current = true;
    }
  }, [shouldAnimate, coverMotion]);

  // IntersectionObserver — pause when off-screen
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldAnimate) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!animate) return;
        if (entries[0].intersectionRatio < 0.1) {
          el.pause();
        } else {
          el.play().catch(() => {});
        }
      },
      { threshold: [0, 0.1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [shouldAnimate, animate]);

  // Visibility API — pause when tab hidden
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldAnimate) return;
    function onVisibilityChange() {
      if (!el) return;
      if (document.hidden) {
        el.pause();
      } else if (animate) {
        el.play().catch(() => {});
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [shouldAnimate, animate]);

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
      {shouldAnimate ? (
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
