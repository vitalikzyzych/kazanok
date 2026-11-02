import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useToast } from "./ToastProvider";

import { type IRecipe, newId } from "@/domain";

export interface ITimer {
  id: string;
  recipeId: string;
  stepIndex: number;
  label: string;
  /** While running: when it rings. */
  endsAt: number;
  /** While paused: time left. */
  leftMs: number;
  running: boolean;
  done: boolean;
}

interface ICookingApi {
  /** Servings chosen on this device, the recipe's own when none. */
  servingsFor: (recipe: IRecipe) => number;
  setServings: (recipeId: string, servings: number) => void;
  doneSteps: (recipeId: string) => ReadonlySet<number>;
  toggleStep: (recipeId: string, stepIndex: number) => void;
  /** After "Приготовано": steps, servings and timers start over. */
  finishCooking: (recipeId: string) => void;
  timers: ITimer[];
  /** Clock of the running timers, updated twice a second. */
  now: number;
  timerFor: (recipeId: string, stepIndex: number) => ITimer | undefined;
  startTimer: (recipe: IRecipe, stepIndex: number) => void;
  toggleTimer: (timerId: string) => void;
  addMinute: (timerId: string) => void;
  stopTimer: (timerId: string) => void;
}

const CookingContext = createContext<ICookingApi | null>(null);

export const timerLeftMs = (t: ITimer, now: number): number =>
  t.running ? Math.max(0, t.endsAt - now) : t.leftMs;

let audio: AudioContext | null = null;

const getAudio = (): AudioContext | null => {
  const Ctx = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctx) return null;
  audio ??= new Ctx();
  return audio;
};

/** Three double beeps and a vibration. */
const ring = () => {
  try {
    const ctx = getAudio();
    if (ctx)
      for (const t of [0, 0.35, 0.7, 1.4, 1.75, 2.1]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const at = ctx.currentTime + t;
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.3, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
        osc.start(at);
        osc.stop(at + 0.3);
      }
  } catch {
    // No sound on this device; the toast and the red timer still show.
  }
  navigator.vibrate?.([300, 150, 300, 150, 300]);
};

/**
 * What happens while cooking on this device: chosen servings, steps marked
 * done and step timers. Kept in memory only, across screens.
 */
export const CookingProvider = ({ children }: { children: ReactNode }) => {
  const toast = useToast();
  const [servings, setServingsMap] = useState<Record<string, number>>({});
  const [done, setDone] = useState<Record<string, number[]>>({});
  const [timers, setTimers] = useState<ITimer[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const rung = useRef(new Set<string>());

  const hasRunning = timers.some((t) => t.running);
  useEffect(() => {
    if (!hasRunning) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [hasRunning]);

  useEffect(() => {
    const finished = timers.filter((t) => t.running && t.endsAt <= now);
    if (!finished.length) return;
    setTimers((list) =>
      list.map((t) =>
        finished.some((f) => f.id === t.id)
          ? { ...t, running: false, done: true, leftMs: 0 }
          : t
      )
    );
    for (const t of finished) {
      if (rung.current.has(t.id)) continue;
      rung.current.add(t.id);
      ring();
      toast.show("info", "Час вийшов", t.label);
    }
  }, [now, timers, toast]);

  const servingsFor = useCallback(
    (recipe: IRecipe) => servings[recipe.id] ?? recipe.servings,
    [servings]
  );

  const setServings = useCallback(
    (recipeId: string, n: number) =>
      setServingsMap((m) => ({ ...m, [recipeId]: n })),
    []
  );

  const doneSteps = useCallback(
    (recipeId: string) => new Set(done[recipeId] ?? []),
    [done]
  );

  const toggleStep = useCallback(
    (recipeId: string, i: number) =>
      setDone((d) => {
        const list = d[recipeId] ?? [];
        return {
          ...d,
          [recipeId]: list.includes(i)
            ? list.filter((x) => x !== i)
            : [...list, i],
        };
      }),
    []
  );

  const finishCooking = useCallback((recipeId: string) => {
    setDone((d) => ({ ...d, [recipeId]: [] }));
    setServingsMap(({ [recipeId]: _, ...rest }) => rest);
    setTimers((list) => list.filter((t) => t.recipeId !== recipeId));
  }, []);

  const timerFor = useCallback(
    (recipeId: string, stepIndex: number) =>
      timers.find((t) => t.recipeId === recipeId && t.stepIndex === stepIndex),
    [timers]
  );

  const startTimer = useCallback((recipe: IRecipe, stepIndex: number) => {
    const minutes = recipe.steps[stepIndex]?.timerMin;
    if (!minutes) return;
    // Browsers allow sound only after a tap: unlock it now, not when it rings.
    void getAudio()?.resume();
    const ms = minutes * 60_000;
    const start = Date.now();
    setNow(start);
    setTimers((list) => [
      ...list.filter(
        (t) => !(t.recipeId === recipe.id && t.stepIndex === stepIndex)
      ),
      {
        id: newId(),
        recipeId: recipe.id,
        stepIndex,
        label: `Крок ${stepIndex + 1}, ${recipe.title}`,
        endsAt: start + ms,
        leftMs: ms,
        running: true,
        done: false,
      },
    ]);
  }, []);

  const toggleTimer = useCallback((timerId: string) => {
    const at = Date.now();
    setNow(at);
    setTimers((list) =>
      list.map((t) => {
        if (t.id !== timerId || t.done) return t;
        return t.running
          ? { ...t, running: false, leftMs: Math.max(0, t.endsAt - at) }
          : { ...t, running: true, endsAt: at + t.leftMs };
      })
    );
  }, []);

  const addMinute = useCallback((timerId: string) => {
    setTimers((list) =>
      list.map((t) =>
        t.id !== timerId
          ? t
          : t.running
            ? { ...t, endsAt: t.endsAt + 60_000 }
            : { ...t, leftMs: t.leftMs + 60_000 }
      )
    );
  }, []);

  const stopTimer = useCallback(
    (timerId: string) =>
      setTimers((list) => list.filter((t) => t.id !== timerId)),
    []
  );

  const api = useMemo<ICookingApi>(
    () => ({
      servingsFor,
      setServings,
      doneSteps,
      toggleStep,
      finishCooking,
      timers,
      now,
      timerFor,
      startTimer,
      toggleTimer,
      addMinute,
      stopTimer,
    }),
    [
      servingsFor,
      setServings,
      doneSteps,
      toggleStep,
      finishCooking,
      timers,
      now,
      timerFor,
      startTimer,
      toggleTimer,
      addMinute,
      stopTimer,
    ]
  );

  return (
    <CookingContext.Provider value={api}>{children}</CookingContext.Provider>
  );
};

export const useCooking = (): ICookingApi => {
  const context = useContext(CookingContext);
  if (!context)
    throw new Error("useCooking must be used inside CookingProvider");
  return context;
};
