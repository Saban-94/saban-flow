import { useSyncExternalStore } from "react";

export type Approval = { rami?: { at: string; note?: string | undefined }; harel?: { at: string; note?: string | undefined }; closed?: string };
type State = Record<string, Approval>;

let state: State = {};
const subs = new Set<() => void>();
const KEY = "saban-approvals-v1";

if (typeof window !== "undefined") {
  try { state = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { state = {}; }
}

function set(next: State) {
  state = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  subs.forEach((f) => f());
}

const stamp = () => new Date().toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });

export const approvals = {
  rami: (id: string, note?: string) => set({ ...state, [id]: { ...state[id], rami: { at: stamp(), note } } }),
  harel: (id: string, note?: string) => set({ ...state, [id]: { ...state[id], harel: { at: stamp(), note } } }),
  close: (id: string) => set({ ...state, [id]: { ...state[id], closed: stamp() } }),
  reset: (id: string) => { const { [id]: _, ...rest } = state; set(rest); },
};

const empty: State = {};
export function useApprovals(): State {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => state,
    () => empty,
  );
}

export function playAlert() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    [880, 1320, 990].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; o.type = "sine";
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.14);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.14 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.14 + 0.13);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.14); o.stop(ctx.currentTime + i * 0.14 + 0.15);
    });
    navigator.vibrate?.([60, 40, 60]);
  } catch { /* ignore */ }
}
