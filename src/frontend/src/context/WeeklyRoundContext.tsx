import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const LS_ROUND_KEY = "minty_weekly_round_v1";

export interface RoundState {
  roundId: number;
  roundStartTs: number;
  roundEndTs: number;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // ms remaining
}

interface WeeklyRoundCtx {
  roundId: number;
  roundStartTs: number;
  roundEndTs: number;
  timeRemaining: TimeRemaining;
  isRoundActive: boolean;
  startNewRound: (fromRoundId: number) => void;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function loadRound(): RoundState {
  try {
    const raw = localStorage.getItem(LS_ROUND_KEY);
    if (raw) return JSON.parse(raw) as RoundState;
  } catch {}
  const now = Date.now();
  return { roundId: 1, roundStartTs: now, roundEndTs: now + SEVEN_DAYS_MS };
}

function saveRound(r: RoundState) {
  try {
    localStorage.setItem(LS_ROUND_KEY, JSON.stringify(r));
  } catch {}
}

function calcRemaining(endTs: number): TimeRemaining {
  const total = Math.max(0, endTs - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / 1000 / 60 / 60) % 24);
  const days = Math.floor(total / 1000 / 60 / 60 / 24);
  return { days, hours, minutes, seconds, total };
}

const WeeklyRoundContext = createContext<WeeklyRoundCtx | null>(null);

export function WeeklyRoundProvider({
  children,
  onRoundEnd,
}: {
  children: React.ReactNode;
  onRoundEnd?: (endingRoundId: number) => void;
}) {
  const [round, setRound] = useState<RoundState>(() => {
    const r = loadRound();
    saveRound(r);
    return r;
  });
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calcRemaining(round.roundEndTs),
  );
  const finalizedRef = useRef<Set<number>>(new Set());

  const startNewRound = useCallback((fromRoundId: number) => {
    setRound((prev) => {
      if (prev.roundId !== fromRoundId) return prev;
      const now = Date.now();
      const next: RoundState = {
        roundId: fromRoundId + 1,
        roundStartTs: now,
        roundEndTs: now + SEVEN_DAYS_MS,
      };
      saveRound(next);
      return next;
    });
  }, []);

  // Countdown tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calcRemaining(round.roundEndTs));

      // Auto-finalize when round ends
      if (
        Date.now() >= round.roundEndTs &&
        !finalizedRef.current.has(round.roundId)
      ) {
        finalizedRef.current.add(round.roundId);
        onRoundEnd?.(round.roundId);
        // Start new round after a brief delay
        setTimeout(() => startNewRound(round.roundId), 1000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [round, onRoundEnd, startNewRound]);

  return (
    <WeeklyRoundContext.Provider
      value={{
        roundId: round.roundId,
        roundStartTs: round.roundStartTs,
        roundEndTs: round.roundEndTs,
        timeRemaining,
        isRoundActive: Date.now() < round.roundEndTs,
        startNewRound,
      }}
    >
      {children}
    </WeeklyRoundContext.Provider>
  );
}

export function useWeeklyRound(): WeeklyRoundCtx {
  const ctx = useContext(WeeklyRoundContext);
  if (!ctx)
    throw new Error("useWeeklyRound must be used inside WeeklyRoundProvider");
  return ctx;
}
