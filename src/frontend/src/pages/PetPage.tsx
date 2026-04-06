import { useCallback, useEffect, useRef, useState } from "react";

type CatState = "walking" | "idle" | "sitting" | "tapped";
type Direction = -1 | 1;

interface Sparkle {
  id: number;
  x: number;
  y: number;
}

function playMeow() {
  try {
    const ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio not available
  }
}

export function PetPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 140, y: 200 });
  const [dir, setDir] = useState<Direction>(1);
  const [catState, setCatState] = useState<CatState>("walking");
  const [walkFrame, setWalkFrame] = useState(0);
  const [tailAngle, setTailAngle] = useState(0);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const sparkleIdRef = useRef(0);

  const stateRef = useRef({ pos, dir, catState });
  stateRef.current = { pos, dir, catState };

  // Walk cycle animation
  useEffect(() => {
    if (catState !== "walking") return;
    const id = setInterval(() => {
      setWalkFrame((f) => (f + 1) % 4);
    }, 140);
    return () => clearInterval(id);
  }, [catState]);

  // Tail sway
  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 0.08;
      setTailAngle(Math.sin(t) * 18);
    }, 40);
    return () => clearInterval(id);
  }, []);

  // Movement logic
  const getBounds = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { maxX: 280, maxY: 400 };
    return { maxX: el.clientWidth - 72, maxY: el.clientHeight - 100 };
  }, []);

  useEffect(() => {
    const step = () => {
      const { catState: cs, pos: p, dir: d } = stateRef.current;
      if (cs !== "walking") return;
      const { maxX, maxY } = getBounds();
      const speed = 1.4;
      let newX = p.x + d * speed;
      let newDir = d;

      if (newX <= 0) {
        newX = 0;
        newDir = 1;
      } else if (newX >= maxX) {
        newX = maxX;
        newDir = -1;
      }

      // Slight vertical drift
      let newY = p.y + (Math.random() - 0.5) * 0.4;
      newY = Math.max(60, Math.min(maxY, newY));

      if (newDir !== d) setDir(newDir);
      setPos({ x: newX, y: newY });
    };

    const id = setInterval(step, 16);
    return () => clearInterval(id);
  }, [getBounds]);

  // State machine: randomly pause/sit/walk
  useEffect(() => {
    const schedule = () => {
      const current = stateRef.current.catState;
      let nextDelay: number;
      if (current === "walking") {
        const roll = Math.random();
        if (roll < 0.45) {
          setCatState("idle");
          nextDelay = 1200 + Math.random() * 1800;
        } else if (roll < 0.65) {
          setCatState("sitting");
          nextDelay = 2000 + Math.random() * 3000;
          if (Math.random() < 0.5) setDir((d) => (d === 1 ? -1 : 1));
        } else {
          setDir((d) => (d === 1 ? -1 : 1));
          nextDelay = 1800 + Math.random() * 2500;
        }
      } else if (current === "tapped") {
        nextDelay = 800;
        setCatState("walking");
      } else {
        setCatState("walking");
        nextDelay = 2500 + Math.random() * 3500;
      }
      return nextDelay;
    };

    let timeout: ReturnType<typeof setTimeout>;
    const run = () => {
      const delay = schedule();
      timeout = setTimeout(run, delay);
    };
    timeout = setTimeout(run, 2500 + Math.random() * 2000);
    return () => clearTimeout(timeout);
  }, []);

  const handleCatClick = useCallback(() => {
    playMeow();
    setCatState("tapped");
    const id = ++sparkleIdRef.current;
    setSparkles((s) => [
      ...s,
      { id, x: stateRef.current.pos.x + 36, y: stateRef.current.pos.y - 10 },
    ]);
    setTimeout(() => {
      setSparkles((s) => s.filter((sp) => sp.id !== id));
    }, 900);
    setTimeout(() => {
      setCatState("walking");
    }, 700);
  }, []);

  // Walk leg angles
  const legAngles = [
    [12, -18, -12, 18], // frame 0
    [18, -12, -18, 12], // frame 1
    [8, -22, -8, 22], // frame 2
    [-8, 8, 8, -8], // frame 3
  ];
  const currentLegs =
    catState === "walking" ? legAngles[walkFrame] : [0, 0, 0, 0];

  const isFlipped = dir === -1;
  const isSitting = catState === "sitting";
  const isTapped = catState === "tapped";

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full"
      style={{
        height: "100vh",
        background: "var(--echo-surface, #f5f5f5)",
        minHeight: 380,
      }}
    >
      {/* Subtle hint text */}
      <p
        style={{
          position: "absolute",
          top: 18,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'DM Sans', Inter, sans-serif",
          fontSize: 13,
          color: "var(--echo-muted, #aaa)",
          letterSpacing: "0.04em",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        tap the cat ✦
      </p>

      {/* Sparkles */}
      {sparkles.map((sp) => (
        <div
          key={sp.id}
          style={{
            position: "absolute",
            left: sp.x - 16,
            top: sp.y - 28,
            fontSize: 22,
            pointerEvents: "none",
            animation: "petSparkleFloat 0.9s ease-out forwards",
          }}
        >
          🤍
        </div>
      ))}

      {/* Cat */}
      <button
        type="button"
        aria-label="Cat — tap to hear a meow"
        onClick={handleCatClick}
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: 72,
          height: 80,
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          transform: [
            isFlipped ? "scaleX(-1)" : "scaleX(1)",
            isTapped
              ? "translateY(-10px) scale(1.08)"
              : "translateY(0) scale(1)",
          ].join(" "),
          transition: isTapped
            ? "transform 0.12s ease-out"
            : "transform 0.3s ease",
          userSelect: "none",
          outline: "none",
        }}
        data-ocid="pet.canvas_target"
      >
        <CatSVG legs={currentLegs} tailAngle={tailAngle} sitting={isSitting} />
      </button>

      <style>{`
        @keyframes petSparkleFloat {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          60% { opacity: 0.9; transform: translateY(-22px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.8); }
        }
      `}</style>
    </div>
  );
}

function CatSVG({
  legs,
  tailAngle,
  sitting,
}: {
  legs: number[];
  tailAngle: number;
  sitting: boolean;
}) {
  const bodyY = sitting ? 44 : 38;
  const bodyHeight = sitting ? 32 : 28;

  return (
    <svg
      role="img"
      aria-label="Black cat mascot"
      viewBox="0 0 72 90"
      width="72"
      height="90"
      style={{ overflow: "visible", display: "block" }}
    >
      {/* Tail */}
      <g
        transform={`translate(18, ${
          bodyY + bodyHeight - 6
        }) rotate(${tailAngle}, 0, 0)`}
      >
        <path
          d="M0 0 Q-14 -16 -8 -30"
          stroke="#1a1a1a"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="-8" cy="-30" r="3.5" fill="#1a1a1a" />
      </g>

      {/* Back legs */}
      {!sitting ? (
        <>
          <g
            transform={`translate(20, ${
              bodyY + bodyHeight - 6
            }) rotate(${legs[2]}, 0, 0)`}
          >
            <rect x="-3" y="0" width="6" height="16" rx="3" fill="#1a1a1a" />
            <rect x="-4" y="13" width="9" height="5" rx="2.5" fill="#1a1a1a" />
          </g>
          <g
            transform={`translate(30, ${
              bodyY + bodyHeight - 6
            }) rotate(${legs[3]}, 0, 0)`}
          >
            <rect x="-3" y="0" width="6" height="16" rx="3" fill="#1a1a1a" />
            <rect x="-4" y="13" width="9" height="5" rx="2.5" fill="#1a1a1a" />
          </g>
        </>
      ) : (
        <>
          <ellipse
            cx="20"
            cy={bodyY + bodyHeight + 8}
            rx="8"
            ry="6"
            fill="#1a1a1a"
          />
          <ellipse
            cx="36"
            cy={bodyY + bodyHeight + 8}
            rx="8"
            ry="6"
            fill="#1a1a1a"
          />
        </>
      )}

      {/* Body */}
      <ellipse
        cx="32"
        cy={bodyY + bodyHeight / 2}
        rx="20"
        ry={bodyHeight / 2}
        fill="#1a1a1a"
      />

      {/* Front legs */}
      {!sitting ? (
        <>
          <g
            transform={`translate(38, ${
              bodyY + bodyHeight - 6
            }) rotate(${legs[0]}, 0, 0)`}
          >
            <rect x="-3" y="0" width="6" height="16" rx="3" fill="#222" />
            <rect x="-4" y="13" width="9" height="5" rx="2.5" fill="#222" />
          </g>
          <g
            transform={`translate(48, ${
              bodyY + bodyHeight - 6
            }) rotate(${legs[1]}, 0, 0)`}
          >
            <rect x="-3" y="0" width="6" height="16" rx="3" fill="#222" />
            <rect x="-4" y="13" width="9" height="5" rx="2.5" fill="#222" />
          </g>
        </>
      ) : (
        <>
          <ellipse
            cx="36"
            cy={bodyY + bodyHeight + 6}
            rx="9"
            ry="5"
            fill="#222"
          />
          <ellipse
            cx="48"
            cy={bodyY + bodyHeight + 6}
            rx="7"
            ry="4"
            fill="#222"
          />
        </>
      )}

      {/* Neck */}
      <ellipse cx="38" cy={bodyY - 4} rx="9" ry="7" fill="#1a1a1a" />

      {/* Head */}
      <ellipse cx="44" cy={bodyY - 18} rx="14" ry="13" fill="#1a1a1a" />

      {/* Ears */}
      <polygon
        points={`34,${bodyY - 27} 30,${bodyY - 42} 38,${bodyY - 30}`}
        fill="#1a1a1a"
      />
      <polygon
        points={`52,${bodyY - 27} 56,${bodyY - 42} 48,${bodyY - 30}`}
        fill="#1a1a1a"
      />
      {/* Inner ear */}
      <polygon
        points={`34,${bodyY - 28} 31,${bodyY - 39} 38,${bodyY - 31}`}
        fill="#3d1a1a"
        opacity="0.4"
      />
      <polygon
        points={`52,${bodyY - 28} 55,${bodyY - 39} 48,${bodyY - 31}`}
        fill="#3d1a1a"
        opacity="0.4"
      />

      {/* Eyes */}
      <ellipse cx="39" cy={bodyY - 20} rx="3" ry="3.2" fill="white" />
      <ellipse cx="49" cy={bodyY - 20} rx="3" ry="3.2" fill="white" />
      <circle cx="40" cy={bodyY - 20} r="1.8" fill="#111" />
      <circle cx="50" cy={bodyY - 20} r="1.8" fill="#111" />
      {/* Eye shine */}
      <circle cx="41" cy={bodyY - 21} r="0.7" fill="white" />
      <circle cx="51" cy={bodyY - 21} r="0.7" fill="white" />

      {/* Nose */}
      <ellipse cx="44" cy={bodyY - 13} rx="2" ry="1.4" fill="#e88fa0" />

      {/* Whiskers */}
      <line
        x1="44"
        y1={bodyY - 12}
        x2="30"
        y2={bodyY - 10}
        stroke="white"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <line
        x1="44"
        y1={bodyY - 12}
        x2="30"
        y2={bodyY - 13}
        stroke="white"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <line
        x1="44"
        y1={bodyY - 12}
        x2="58"
        y2={bodyY - 10}
        stroke="white"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <line
        x1="44"
        y1={bodyY - 12}
        x2="58"
        y2={bodyY - 13}
        stroke="white"
        strokeWidth="0.8"
        opacity="0.7"
      />

      {/* Mouth */}
      <path
        d={`M 42 ${bodyY - 11} Q 44 ${bodyY - 9} 46 ${bodyY - 11}`}
        stroke="white"
        strokeWidth="0.8"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}
