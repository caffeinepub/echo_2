import { useCallback, useEffect, useRef, useState } from "react";

type CatState = "walking" | "idle" | "sitting" | "reacting";

interface Heart {
  id: number;
  x: number;
  y: number;
}

const CAT_KEYFRAMES = `
  @keyframes tailWag {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(18deg); }
  }
  @keyframes tailWagSit {
    0%, 100% { transform: rotate(0deg); }
    30% { transform: rotate(10deg); }
    70% { transform: rotate(-8deg); }
  }
  @keyframes legSwingL {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  @keyframes legSwingR {
    0%, 100% { transform: translateY(-5px); }
    50% { transform: translateY(0px); }
  }
  @keyframes heartFloat {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
    30% { transform: translate(-50%, -80%) scale(1.3); opacity: 1; }
    100% { transform: translate(-50%, -160%) scale(0.9); opacity: 0; }
  }
  @keyframes catBounce {
    0% { transform: var(--cat-flip) translateY(0px); }
    25% { transform: var(--cat-flip) translateY(-18px); }
    55% { transform: var(--cat-flip) translateY(-6px); }
    75% { transform: var(--cat-flip) translateY(-12px); }
    100% { transform: var(--cat-flip) translateY(0px); }
  }
  @keyframes catSway {
    0%, 100% { transform: var(--cat-flip) rotate(0deg); }
    33% { transform: var(--cat-flip) rotate(2.5deg); }
    66% { transform: var(--cat-flip) rotate(-2deg); }
  }
  @keyframes earFlickL {
    0%, 75%, 100% { transform: rotate(0deg); }
    80% { transform: rotate(-10deg); }
    90% { transform: rotate(6deg); }
    95% { transform: rotate(-4deg); }
  }
  @keyframes earFlickR {
    0%, 78%, 100% { transform: rotate(0deg); }
    83% { transform: rotate(10deg); }
    92% { transform: rotate(-6deg); }
    97% { transform: rotate(3deg); }
  }
  @keyframes blinkEyes {
    0%, 90%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.1); }
  }
  @keyframes pawWalkL {
    0%, 100% { transform: translateX(0px) translateY(0px) rotate(-8deg); }
    50% { transform: translateX(-3px) translateY(-4px) rotate(8deg); }
  }
  @keyframes pawWalkR {
    0%, 100% { transform: translateX(0px) translateY(-4px) rotate(8deg); }
    50% { transform: translateX(3px) translateY(0px) rotate(-8deg); }
  }
  @keyframes floorShadowPulse {
    0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.18; }
    50% { transform: translateX(-50%) scaleX(0.85); opacity: 0.1; }
  }
`;

function CatSVG({ state }: { state: CatState }) {
  const isWalking = state === "walking";
  const isSitting = state === "sitting";
  const isIdle = state === "idle";

  return (
    <svg
      width="88"
      height="100"
      viewBox="0 0 88 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
      aria-hidden="true"
      role="img"
    >
      <title>Cat mascot</title>
      {/* Floor shadow */}
      <ellipse
        cx="44"
        cy="95"
        rx="26"
        ry="5"
        fill="#1a1a1a"
        style={{
          animation: isWalking
            ? "floorShadowPulse 0.5s ease-in-out infinite"
            : undefined,
          opacity: 0.14,
          transformOrigin: "44px 95px",
        }}
      />

      {/* Tail — walking */}
      {!isSitting && (
        <path
          d="M 50 72 Q 72 62 76 46"
          stroke="#1a1a1a"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          style={{
            transformOrigin: "50px 72px",
            animation: isWalking
              ? "tailWag 0.7s ease-in-out infinite"
              : "tailWag 2.4s ease-in-out infinite",
          }}
        />
      )}

      {/* Sitting tail */}
      {isSitting && (
        <path
          d="M 50 80 Q 68 82 66 94"
          stroke="#1a1a1a"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          style={{
            transformOrigin: "50px 80px",
            animation: "tailWagSit 3s ease-in-out infinite",
          }}
        />
      )}

      {/* Body */}
      <ellipse
        cx="44"
        cy={isSitting ? "75" : "70"}
        rx="22"
        ry={isSitting ? "18" : "20"}
        fill="#1a1a1a"
      />

      {/* Head */}
      <circle cx="44" cy="40" r="22" fill="#1a1a1a" />

      {/* Left ear outer */}
      <polygon
        points="24,26 14,8 32,18"
        fill="#1a1a1a"
        style={{
          transformOrigin: "23px 17px",
          animation: "earFlickL 4.5s ease-in-out infinite",
        }}
      />
      {/* Left ear inner */}
      <polygon
        points="24,24 18,12 30,19"
        fill="#ffb3c1"
        style={{
          transformOrigin: "23px 17px",
          animation: "earFlickL 4.5s ease-in-out infinite",
        }}
      />

      {/* Right ear outer */}
      <polygon
        points="64,26 74,8 56,18"
        fill="#1a1a1a"
        style={{
          transformOrigin: "65px 17px",
          animation: "earFlickR 5.2s ease-in-out infinite",
        }}
      />
      {/* Right ear inner */}
      <polygon
        points="64,24 70,12 58,19"
        fill="#ffb3c1"
        style={{
          transformOrigin: "65px 17px",
          animation: "earFlickR 5.2s ease-in-out infinite",
        }}
      />

      {/* Eyes + blink */}
      <g
        style={{
          animation: "blinkEyes 5s ease-in-out infinite",
          transformOrigin: "44px 39px",
        }}
      >
        <ellipse cx="34" cy="39" rx="6" ry="6.5" fill="white" />
        <ellipse cx="54" cy="39" rx="6" ry="6.5" fill="white" />
        <ellipse cx="35" cy="40" rx="3.5" ry="4" fill="#0f0f0f" />
        <ellipse cx="55" cy="40" rx="3.5" ry="4" fill="#0f0f0f" />
        <circle cx="36.5" cy="38" r="1.4" fill="white" />
        <circle cx="56.5" cy="38" r="1.4" fill="white" />
        <circle cx="34" cy="41.5" r="0.8" fill="white" opacity="0.5" />
        <circle cx="54" cy="41.5" r="0.8" fill="white" opacity="0.5" />
      </g>

      {/* Nose */}
      <ellipse cx="44" cy="47" rx="3" ry="2" fill="#ffb3c1" />

      {/* Mouth */}
      <path
        d="M 41 49 Q 44 52 47 49"
        stroke="#777"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Whiskers left */}
      <line
        x1="10"
        y1="44"
        x2="36"
        y2="46"
        stroke="#aaaaaa"
        strokeWidth="0.9"
        opacity="0.7"
      />
      <line
        x1="10"
        y1="47"
        x2="36"
        y2="47.5"
        stroke="#aaaaaa"
        strokeWidth="0.9"
        opacity="0.7"
      />
      <line
        x1="12"
        y1="50"
        x2="36"
        y2="49"
        stroke="#aaaaaa"
        strokeWidth="0.9"
        opacity="0.7"
      />

      {/* Whiskers right */}
      <line
        x1="78"
        y1="44"
        x2="52"
        y2="46"
        stroke="#aaaaaa"
        strokeWidth="0.9"
        opacity="0.7"
      />
      <line
        x1="78"
        y1="47"
        x2="52"
        y2="47.5"
        stroke="#aaaaaa"
        strokeWidth="0.9"
        opacity="0.7"
      />
      <line
        x1="76"
        y1="50"
        x2="52"
        y2="49"
        stroke="#aaaaaa"
        strokeWidth="0.9"
        opacity="0.7"
      />

      {/* Walking legs */}
      {isWalking && (
        <>
          <ellipse
            cx="30"
            cy="87"
            rx="9"
            ry="6"
            fill="#1a1a1a"
            style={{
              animation: "pawWalkL 0.3s ease-in-out infinite",
              transformOrigin: "30px 87px",
            }}
          />
          <ellipse
            cx="54"
            cy="87"
            rx="9"
            ry="6"
            fill="#1a1a1a"
            style={{
              animation: "pawWalkR 0.3s ease-in-out infinite",
              transformOrigin: "54px 87px",
            }}
          />
        </>
      )}

      {/* Idle / reacting paws */}
      {(isIdle || state === "reacting") && (
        <>
          <ellipse cx="30" cy="87" rx="9" ry="5.5" fill="#1a1a1a" />
          <ellipse cx="54" cy="87" rx="9" ry="5.5" fill="#1a1a1a" />
        </>
      )}

      {/* Sitting paws */}
      {isSitting && (
        <>
          <ellipse cx="31" cy="90" rx="11" ry="7" fill="#1a1a1a" />
          <ellipse cx="55" cy="90" rx="11" ry="7" fill="#1a1a1a" />
          <line
            x1="26"
            y1="91"
            x2="28"
            y2="94"
            stroke="#333"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="31"
            y1="92"
            x2="31"
            y2="95"
            stroke="#333"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="36"
            y1="91"
            x2="34"
            y2="94"
            stroke="#333"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="50"
            y1="91"
            x2="52"
            y2="94"
            stroke="#333"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="55"
            y1="92"
            x2="55"
            y2="95"
            stroke="#333"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="60"
            y1="91"
            x2="58"
            y2="94"
            stroke="#333"
            strokeWidth="1"
            opacity="0.5"
          />
        </>
      )}
    </svg>
  );
}

function playMeow() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.18);
    osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.32);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.36);
    osc.onended = () => ctx.close();
  } catch {
    // AudioContext not available — silent fallback
  }
}

export function PetPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const posRef = useRef({ x: 160, y: 280 });
  const [pos, setPos] = useState({ x: 160, y: 280 });

  const velRef = useRef({ vx: 0, vy: 0 });
  const [facingLeft, setFacingLeft] = useState(false);

  const [catState, setCatState] = useState<CatState>("walking");
  const catStateRef = useRef<CatState>("walking");

  const frameCountRef = useRef(0);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const [hearts, setHearts] = useState<Heart[]>([]);

  // Init random velocity on mount
  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    velRef.current = {
      vx: Math.cos(angle) * 1.8,
      vy: Math.sin(angle) * 1.2,
    };
  }, []);

  const scheduleStateReturn = useCallback((duration: number) => {
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    stateTimerRef.current = setTimeout(() => {
      catStateRef.current = "walking";
      setCatState("walking");
      const currentAngle = Math.atan2(velRef.current.vy, velRef.current.vx);
      const newAngle = currentAngle + (Math.random() - 0.5) * 1.2;
      const speed = 1.6 + Math.random() * 0.8;
      velRef.current = {
        vx: Math.cos(newAngle) * speed,
        vy: Math.sin(newAngle) * speed,
      };
    }, duration);
  }, []);

  // rAF movement loop
  useEffect(() => {
    const PADDING = 60;

    function loop() {
      const container = containerRef.current;
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        const minX = PADDING;
        const maxX = width - PADDING;
        const minY = PADDING;
        const maxY = height - PADDING;

        if (catStateRef.current === "walking") {
          const p = posRef.current;
          const v = velRef.current;

          let nx = p.x + v.vx;
          let ny = p.y + v.vy;

          // Bounce off edges
          if (nx < minX) {
            nx = minX;
            velRef.current.vx = Math.abs(v.vx) + Math.random() * 0.2;
          }
          if (nx > maxX) {
            nx = maxX;
            velRef.current.vx = -(Math.abs(v.vx) + Math.random() * 0.2);
          }
          if (ny < minY) {
            ny = minY;
            velRef.current.vy = Math.abs(v.vy) + Math.random() * 0.2;
          }
          if (ny > maxY) {
            ny = maxY;
            velRef.current.vy = -(Math.abs(v.vy) + Math.random() * 0.2);
          }

          // Clamp speed
          const speed = Math.sqrt(
            velRef.current.vx ** 2 + velRef.current.vy ** 2,
          );
          if (speed > 2.4) {
            velRef.current.vx = (velRef.current.vx / speed) * 2.4;
            velRef.current.vy = (velRef.current.vy / speed) * 2.4;
          }
          if (speed < 0.9) {
            const s = 0.9 / speed;
            velRef.current.vx *= s;
            velRef.current.vy *= s;
          }

          posRef.current = { x: nx, y: ny };
          setPos({ x: nx, y: ny });
          setFacingLeft(velRef.current.vx < 0);

          // Randomly change state
          frameCountRef.current++;
          if (frameCountRef.current > 300 + Math.floor(Math.random() * 200)) {
            frameCountRef.current = 0;
            const pick = Math.random();
            if (pick < 0.25) {
              catStateRef.current = "idle";
              setCatState("idle");
              scheduleStateReturn(800 + Math.random() * 600);
            } else if (pick < 0.45) {
              catStateRef.current = "sitting";
              setCatState("sitting");
              scheduleStateReturn(1000 + Math.random() * 800);
            } else {
              const a =
                Math.atan2(velRef.current.vy, velRef.current.vx) +
                (Math.random() - 0.5) * 1.5;
              const sp = 0.8 + Math.random() * 0.6;
              velRef.current = { vx: Math.cos(a) * sp, vy: Math.sin(a) * sp };
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    };
  }, [scheduleStateReturn]);

  const spawnHeart = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setHearts((prev) => [...prev, { id, x, y }]);
    setTimeout(
      () => setHearts((prev) => prev.filter((h) => h.id !== id)),
      1100,
    );
  }, []);

  const triggerReaction = useCallback(() => {
    if (catStateRef.current === "reacting") return;
    const prevState = catStateRef.current;
    catStateRef.current = "reacting";
    setCatState("reacting");
    playMeow();

    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        spawnHeart(
          posRef.current.x + (Math.random() - 0.5) * 30,
          posRef.current.y - 20,
        );
      }, i * 80);
    }

    setTimeout(() => {
      catStateRef.current = prevState;
      setCatState(prevState);
    }, 650);
  }, [spawnHeart]);

  const handleCatTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      triggerReaction();
    },
    [triggerReaction],
  );

  const handleCatKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        triggerReaction();
      }
    },
    [triggerReaction],
  );

  const catFlip = facingLeft ? "scaleX(-1)" : "scaleX(1)";
  const catAnimation =
    catState === "reacting"
      ? "catBounce 0.55s ease-out"
      : catState === "idle"
        ? "catSway 3s ease-in-out infinite"
        : "none";

  return (
    <div
      ref={containerRef}
      data-ocid="pet.canvas_target"
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100svh - 64px - 68px)",
        background:
          "linear-gradient(160deg, #f0f5f2 0%, #eef4f0 50%, #f2f0f5 100%)",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Keyframe animations */}
      <style>{CAT_KEYFRAMES}</style>

      {/* Subtle dot pattern background */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.06,
          pointerEvents: "none",
        }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <title>Background decoration</title>
        <defs>
          <pattern
            id="pet-dots"
            x="0"
            y="0"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="16" cy="16" r="1.5" fill="#7ED6B1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pet-dots)" />
      </svg>

      {/* Cat */}
      <button
        type="button"
        aria-label="Pet the cat"
        onClick={handleCatTap}
        onKeyDown={handleCatKeyDown}
        data-ocid="pet.button"
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          ["--cat-flip" as string]: catFlip,
          transform: `translate(-50%, -50%) ${catFlip}`,
          cursor: "pointer",
          animation: catAnimation,
          transition:
            catState === "walking"
              ? "left 0.08s linear, top 0.08s linear"
              : "left 0.2s ease-out, top 0.2s ease-out",
          pointerEvents: "all",
          WebkitTapHighlightColor: "transparent",
          willChange: "transform, left, top",
          zIndex: 10,
          outline: "none",
        }}
      >
        <CatSVG state={catState} />
      </button>

      {/* Floating hearts */}
      {hearts.map((h) => (
        <div
          key={h.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: h.x,
            top: h.y,
            fontSize: "22px",
            lineHeight: 1,
            animation: "heartFloat 1.1s ease-out forwards",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          🩷
        </div>
      ))}

      {/* Hint text */}
      <p
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "11px",
          color: "#b8c4bd",
          fontFamily:
            "'DM Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          letterSpacing: "0.08em",
          fontWeight: 400,
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        tap to say hello
      </p>
    </div>
  );
}
