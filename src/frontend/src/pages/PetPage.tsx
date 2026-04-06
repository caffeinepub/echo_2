import { useCallback, useEffect, useRef, useState } from "react";

type PetState = "walking" | "idle" | "sitting" | "tapped";
type Direction = -1 | 1;

interface Sparkle {
  id: number;
  x: number;
  y: number;
}

function playSound() {
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
    // Old man "hmm" or gentle exclamation
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.18);
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio not available
  }
}

// Status bar configuration
const STATUS_BARS = [
  {
    key: "water" as const,
    label: "Water",
    icon: "💧",
    color: "#7fb8e8",
    colorLow: "#4a9fd4",
    drainMs: 30_000,
  },
  {
    key: "food" as const,
    label: "Food",
    icon: "🍖",
    color: "#f0a875",
    colorLow: "#e07d3e",
    drainMs: 45_000,
  },
  {
    key: "mood" as const,
    label: "Mood",
    icon: "🩷",
    color: "#f08ca8",
    colorLow: "#d95a78",
    drainMs: 60_000,
  },
] as const;

type StatusKey = (typeof STATUS_BARS)[number]["key"];

function StatusBarPanel({
  values,
  onRefill,
}: {
  values: Record<StatusKey, number>;
  onRefill: (key: StatusKey) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 88,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 40px)",
        maxWidth: 380,
        background: "var(--echo-surface, #ffffff)",
        border: "1px solid var(--echo-border, #d0dfef)",
        borderRadius: 20,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        padding: "14px 18px",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
      data-ocid="pet.panel"
    >
      {STATUS_BARS.map((bar) => {
        const value = values[bar.key];
        const isLow = value < 20;
        return (
          <button
            key={bar.key}
            type="button"
            aria-label={`Refill ${bar.label} (currently ${Math.round(value)}%)`}
            onClick={() => onRefill(bar.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              width: "100%",
            }}
            data-ocid={`pet.${bar.key}.button`}
          >
            {/* Icon */}
            <span
              style={{
                fontSize: 17,
                width: 22,
                textAlign: "center",
                flexShrink: 0,
                animation: isLow
                  ? "petBarPulse 1.4s ease-in-out infinite"
                  : "none",
                display: "inline-block",
              }}
            >
              {bar.icon}
            </span>

            {/* Label */}
            <span
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: isLow
                  ? bar.colorLow
                  : "var(--echo-text-secondary, #5b7fa6)",
                width: 38,
                flexShrink: 0,
                textAlign: "left",
                transition: "color 0.3s ease",
              }}
            >
              {bar.label}
            </span>

            {/* Track */}
            <div
              style={{
                flex: 1,
                height: 7,
                background: "var(--echo-elevated, #f0f4fa)",
                borderRadius: 99,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.max(0, Math.min(100, value))}%`,
                  background: isLow ? bar.colorLow : bar.color,
                  borderRadius: 99,
                  transition:
                    "width 0.6s cubic-bezier(0.4,0,0.2,1), background 0.4s ease",
                  boxShadow: isLow
                    ? `0 0 6px ${bar.colorLow}80`
                    : `0 0 4px ${bar.color}60`,
                }}
              />
            </div>

            {/* Percentage */}
            <span
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: isLow ? bar.colorLow : "var(--echo-text-muted, #8baec8)",
                width: 28,
                textAlign: "right",
                flexShrink: 0,
                transition: "color 0.3s ease",
                letterSpacing: "0.02em",
              }}
            >
              {Math.round(value)}%
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function PetPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 140, y: 200 });
  const [dir, setDir] = useState<Direction>(1);
  const [petState, setPetState] = useState<PetState>("walking");
  const [walkFrame, setWalkFrame] = useState(0);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const sparkleIdRef = useRef(0);

  // Status bars state
  const [statusValues, setStatusValues] = useState<Record<StatusKey, number>>({
    water: 88,
    food: 95,
    mood: 80,
  });

  const stateRef = useRef({ pos, dir, petState });
  stateRef.current = { pos, dir, petState };

  // Drain status bars over time
  useEffect(() => {
    const TICK_MS = 500;
    const id = setInterval(() => {
      setStatusValues((prev) => {
        const next = { ...prev };
        for (const bar of STATUS_BARS) {
          const drainPerTick = (100 / bar.drainMs) * TICK_MS;
          next[bar.key] = Math.max(0, prev[bar.key] - drainPerTick);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const handleRefill = useCallback((key: StatusKey) => {
    setStatusValues((prev) => ({ ...prev, [key]: 100 }));
  }, []);

  // Walk cycle animation
  useEffect(() => {
    if (petState !== "walking") return;
    const id = setInterval(() => {
      setWalkFrame((f) => (f + 1) % 4);
    }, 140);
    return () => clearInterval(id);
  }, [petState]);

  // Movement logic
  const getBounds = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { maxX: 280, maxY: 400 };
    return { maxX: el.clientWidth - 72, maxY: el.clientHeight - 160 };
  }, []);

  useEffect(() => {
    const step = () => {
      const { petState: cs, pos: p, dir: d } = stateRef.current;
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
      const current = stateRef.current.petState;
      let nextDelay: number;
      if (current === "walking") {
        const roll = Math.random();
        if (roll < 0.45) {
          setPetState("idle");
          nextDelay = 1200 + Math.random() * 1800;
        } else if (roll < 0.65) {
          setPetState("sitting");
          nextDelay = 2000 + Math.random() * 3000;
          if (Math.random() < 0.5) setDir((d) => (d === 1 ? -1 : 1));
        } else {
          setDir((d) => (d === 1 ? -1 : 1));
          nextDelay = 1800 + Math.random() * 2500;
        }
      } else if (current === "tapped") {
        nextDelay = 800;
        setPetState("walking");
      } else {
        setPetState("walking");
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

  const handlePetClick = useCallback(() => {
    playSound();
    setPetState("tapped");
    // Boost mood by +15%, capped at 100
    setStatusValues((prev) => ({
      ...prev,
      mood: Math.min(100, prev.mood + 15),
    }));
    const id = ++sparkleIdRef.current;
    setSparkles((s) => [
      ...s,
      { id, x: stateRef.current.pos.x + 36, y: stateRef.current.pos.y - 10 },
    ]);
    setTimeout(() => {
      setSparkles((s) => s.filter((sp) => sp.id !== id));
    }, 900);
    setTimeout(() => {
      setPetState("walking");
    }, 700);
  }, []);

  // Walk leg/arm angles
  const legAngles = [
    [12, -18, -12, 18], // frame 0
    [18, -12, -18, 12], // frame 1
    [8, -22, -8, 22], // frame 2
    [-8, 8, 8, -8], // frame 3
  ];
  const currentLegs =
    petState === "walking" ? legAngles[walkFrame] : [0, 0, 0, 0];

  const isFlipped = dir === -1;
  const isSitting = petState === "sitting";
  const isTapped = petState === "tapped";

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
          color: "var(--echo-text-muted, #aaa)",
          letterSpacing: "0.04em",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        tap the old man ✦
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
          ✨
        </div>
      ))}

      {/* Old Man */}
      <button
        type="button"
        aria-label="Old man — tap to say hello"
        onClick={handlePetClick}
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: 72,
          height: 100,
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
        <OldManSVG legs={currentLegs} sitting={isSitting} />
      </button>

      {/* Status bars */}
      <StatusBarPanel values={statusValues} onRefill={handleRefill} />

      <style>{`
        @keyframes petSparkleFloat {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          60% { opacity: 0.9; transform: translateY(-22px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.8); }
        }
        @keyframes petBarPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}

function OldManSVG({
  legs,
  sitting,
}: {
  legs: number[];
  sitting: boolean;
}) {
  // legs: [frontRightArm, frontLeftArm, frontRightLeg, frontLeftLeg]
  const skinTone = "#d4956a";
  const robeFill = "#6b7fa6"; // muted traditional blue robe
  const robeAccent = "#4e6080";
  const hairColor = "#e8e2d8"; // white/gray hair
  const caneColor = "#8b5e3c";
  const trouserColor = "#4a5568";

  // Body positioning
  const headCX = 36;
  const headCY = sitting ? 24 : 22;
  const headRX = 11;
  const headRY = 12;

  const bodyTopY = headCY + headRY - 2;
  const bodyHeight = sitting ? 26 : 24;
  const bodyCX = 36;
  const bodyCY = bodyTopY + bodyHeight / 2;

  const legTopY = bodyTopY + bodyHeight - 2;
  const legLength = sitting ? 12 : 18;

  // Cane: held in left hand (visually on the right of the character since we don't flip SVG, just the button)
  // The cane is on the character's right side (x > center)
  const caneHandX = 52;
  const caneHandY = bodyCY + 2;
  const caneBottomX = 54;
  const caneBottomY = legTopY + legLength + 4;

  return (
    <svg
      role="img"
      aria-label="Old Asian man mascot with a cane"
      viewBox="0 0 72 100"
      width="72"
      height="100"
      style={{ overflow: "visible", display: "block" }}
    >
      {/* === BACK LAYERS === */}

      {/* Back leg (left leg of character) */}
      {!sitting ? (
        <g transform={`translate(30, ${legTopY}) rotate(${legs[3]}, 0, 0)`}>
          <rect
            x="-4"
            y="0"
            width="8"
            height={legLength}
            rx="4"
            fill={trouserColor}
            opacity="0.7"
          />
          {/* Shoe */}
          <ellipse
            cx="0"
            cy={legLength + 3}
            rx="5"
            ry="3"
            fill="#2d2d2d"
            opacity="0.7"
          />
        </g>
      ) : (
        // Sitting: left leg extended slightly forward
        <ellipse
          cx="27"
          cy={legTopY + 10}
          rx="7"
          ry="5"
          fill={trouserColor}
          opacity="0.7"
        />
      )}

      {/* === BODY (ROBE) === */}
      {/* Robe / tunic — trapezoid shape */}
      <path
        d={`
          M ${bodyCX - 16} ${bodyTopY + 4}
          Q ${bodyCX - 18} ${bodyTopY} ${bodyCX - 10} ${bodyTopY}
          L ${bodyCX + 10} ${bodyTopY}
          Q ${bodyCX + 18} ${bodyTopY} ${bodyCX + 16} ${bodyTopY + 4}
          L ${bodyCX + 18} ${bodyTopY + bodyHeight}
          Q ${bodyCX + 14} ${bodyTopY + bodyHeight + 4} ${bodyCX} ${bodyTopY + bodyHeight + 2}
          Q ${bodyCX - 14} ${bodyTopY + bodyHeight + 4} ${bodyCX - 18} ${bodyTopY + bodyHeight}
          Z
        `}
        fill={robeFill}
      />
      {/* Robe center collar/sash line */}
      <line
        x1={bodyCX}
        y1={bodyTopY}
        x2={bodyCX}
        y2={bodyTopY + bodyHeight + 2}
        stroke={robeAccent}
        strokeWidth="1.5"
        opacity="0.5"
      />
      {/* Collar V-neck */}
      <path
        d={`M ${bodyCX - 6} ${bodyTopY + 2} L ${bodyCX} ${bodyTopY + 8} L ${bodyCX + 6} ${bodyTopY + 2}`}
        stroke={robeAccent}
        strokeWidth="1.5"
        fill="none"
      />

      {/* === FRONT LEG (right leg of character) === */}
      {!sitting ? (
        <g transform={`translate(42, ${legTopY}) rotate(${legs[2]}, 0, 0)`}>
          <rect
            x="-4"
            y="0"
            width="8"
            height={legLength}
            rx="4"
            fill={trouserColor}
          />
          {/* Shoe */}
          <ellipse cx="0" cy={legLength + 3} rx="5" ry="3" fill="#2d2d2d" />
        </g>
      ) : (
        // Sitting: right leg tucked
        <ellipse cx="43" cy={legTopY + 8} rx="8" ry="5" fill={trouserColor} />
      )}

      {/* === LEFT ARM (character's left, swings freely) === */}
      <g
        transform={`translate(${bodyCX - 14}, ${bodyTopY + 6}) rotate(${legs[1]}, 0, 0)`}
      >
        <rect
          x="-3"
          y="0"
          width="6"
          height={sitting ? 12 : 16}
          rx="3"
          fill={robeFill}
        />
        {/* Hand */}
        <circle cx="0" cy={sitting ? 14 : 18} r="3.5" fill={skinTone} />
      </g>

      {/* === RIGHT ARM (character's right, holds cane) === */}
      <g
        transform={`translate(${bodyCX + 14}, ${bodyTopY + 6}) rotate(${sitting ? 30 : legs[0] * 0.5 + 15}, 0, 0)`}
      >
        <rect
          x="-3"
          y="0"
          width="6"
          height={sitting ? 14 : 18}
          rx="3"
          fill={robeFill}
        />
        {/* Hand */}
        <circle cx="0" cy={sitting ? 16 : 20} r="3.5" fill={skinTone} />
      </g>

      {/* === CANE === */}
      {/* Cane stick */}
      <line
        x1={caneHandX}
        y1={caneHandY + (sitting ? 18 : 22)}
        x2={caneBottomX}
        y2={caneBottomY}
        stroke={caneColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Cane curved handle */}
      <path
        d={`M ${caneHandX - 5} ${caneHandY + (sitting ? 14 : 18)} Q ${caneHandX - 2} ${caneHandY + (sitting ? 10 : 14)} ${caneHandX + 1} ${caneHandY + (sitting ? 15 : 19)}`}
        stroke={caneColor}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Cane rubber tip */}
      <circle cx={caneBottomX} cy={caneBottomY} r="2" fill="#2d2d2d" />

      {/* === NECK === */}
      <rect
        x={headCX - 5}
        y={headCY + headRY - 4}
        width="10"
        height="8"
        rx="4"
        fill={skinTone}
      />

      {/* === HEAD === */}
      <ellipse
        cx={headCX}
        cy={headCY}
        rx={headRX}
        ry={headRY}
        fill={skinTone}
      />

      {/* === EARS === */}
      <ellipse
        cx={headCX - headRX + 1}
        cy={headCY + 1}
        rx="3"
        ry="4"
        fill={skinTone}
      />
      <ellipse
        cx={headCX + headRX - 1}
        cy={headCY + 1}
        rx="3"
        ry="4"
        fill={skinTone}
      />
      {/* Ear inner */}
      <ellipse
        cx={headCX - headRX + 1}
        cy={headCY + 1}
        rx="1.5"
        ry="2.5"
        fill="#c07c52"
        opacity="0.4"
      />
      <ellipse
        cx={headCX + headRX - 1}
        cy={headCY + 1}
        rx="1.5"
        ry="2.5"
        fill="#c07c52"
        opacity="0.4"
      />

      {/* === HAIR — tufts on top and sideburns === */}
      {/* Main top hair wisp */}
      <ellipse
        cx={headCX}
        cy={headCY - headRY + 1}
        rx="7"
        ry="4"
        fill={hairColor}
      />
      {/* Left sideburn */}
      <ellipse
        cx={headCX - headRX + 2}
        cy={headCY - 3}
        rx="3"
        ry="4"
        fill={hairColor}
        opacity="0.85"
      />
      {/* Right sideburn */}
      <ellipse
        cx={headCX + headRX - 2}
        cy={headCY - 3}
        rx="3"
        ry="4"
        fill={hairColor}
        opacity="0.85"
      />
      {/* Small beard/chin wisps */}
      <ellipse
        cx={headCX - 2}
        cy={headCY + headRY - 2}
        rx="4"
        ry="2.5"
        fill={hairColor}
        opacity="0.6"
      />
      <ellipse
        cx={headCX + 3}
        cy={headCY + headRY - 2}
        rx="3"
        ry="2"
        fill={hairColor}
        opacity="0.5"
      />

      {/* === EYES — squinting happy elder eyes === */}
      {/* Left eye squint arc */}
      <path
        d={`M ${headCX - 5} ${headCY - 1} Q ${headCX - 3} ${headCY - 4} ${headCX - 1} ${headCY - 1}`}
        stroke="#3d2810"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right eye squint arc */}
      <path
        d={`M ${headCX + 1} ${headCY - 1} Q ${headCX + 3} ${headCY - 4} ${headCX + 5} ${headCY - 1}`}
        stroke="#3d2810"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Eye bags / wrinkle lines */}
      <path
        d={`M ${headCX - 5} ${headCY} Q ${headCX - 3} ${headCY + 2} ${headCX - 1} ${headCY}`}
        stroke="#c07c52"
        strokeWidth="0.7"
        fill="none"
        opacity="0.5"
      />
      <path
        d={`M ${headCX + 1} ${headCY} Q ${headCX + 3} ${headCY + 2} ${headCX + 5} ${headCY}`}
        stroke="#c07c52"
        strokeWidth="0.7"
        fill="none"
        opacity="0.5"
      />

      {/* === EYEBROWS — bushy white === */}
      <path
        d={`M ${headCX - 6} ${headCY - 4} Q ${headCX - 3} ${headCY - 6.5} ${headCX - 0.5} ${headCY - 4}`}
        stroke={hairColor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${headCX + 0.5} ${headCY - 4} Q ${headCX + 3} ${headCY - 6.5} ${headCX + 6} ${headCY - 4}`}
        stroke={hairColor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* === NOSE — round, prominent === */}
      <ellipse cx={headCX} cy={headCY + 3} rx="2.5" ry="2" fill="#c07c52" />
      <ellipse
        cx={headCX}
        cy={headCY + 3}
        rx="1.2"
        ry="1"
        fill="#b06040"
        opacity="0.5"
      />

      {/* === SMILE / MOUTH — warm wrinkled smile === */}
      <path
        d={`M ${headCX - 4} ${headCY + 6} Q ${headCX} ${headCY + 9.5} ${headCX + 4} ${headCY + 6}`}
        stroke="#8b5035"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Smile creases / nasolabial folds */}
      <path
        d={`M ${headCX - 4.5} ${headCY + 4} Q ${headCX - 5.5} ${headCY + 7} ${headCX - 4} ${headCY + 8}`}
        stroke="#c07c52"
        strokeWidth="0.8"
        fill="none"
        opacity="0.45"
      />
      <path
        d={`M ${headCX + 4.5} ${headCY + 4} Q ${headCX + 5.5} ${headCY + 7} ${headCX + 4} ${headCY + 8}`}
        stroke="#c07c52"
        strokeWidth="0.8"
        fill="none"
        opacity="0.45"
      />

      {/* === FOREHEAD WRINKLES === */}
      <path
        d={`M ${headCX - 5} ${headCY - 7} Q ${headCX} ${headCY - 8.5} ${headCX + 5} ${headCY - 7}`}
        stroke="#c07c52"
        strokeWidth="0.7"
        fill="none"
        opacity="0.35"
      />
    </svg>
  );
}
