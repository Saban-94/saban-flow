import {
  BASE as DEFAULT_NOTES,
  ORDERS as DEFAULT_ORDERS,
  type DeliveryNote,
  type Order,
} from "./data";

export const API_BASE =
  "https://script.google.com/macros/s/AKfycbxLKDVRBB6tQVipEelxX5vVRVPSw8mcEatDMdonP0qd1sl5g-BCzhWCuhiAHrBGniH-RQ/exec";

const CACHE_KEY_NOTES = "saban-live-notes-v2";
const CACHE_KEY_ORDERS = "saban-live-orders-v2";
const PENDING_APPROVALS_KEY = "saban-pending-approvals-v1";

export type ApprovalPayload = {
  action: "submitApproval";
  noteId: string;
  approver: "rami" | "harel";
  note?: string;
  timestamp: string;
};

// Safe localStorage access
function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // quota exceeded or private browsing
  }
}

/**
 * Fetch live delivery notes from Google Apps Script backend with offline caching.
 */
export async function fetchNotes(): Promise<DeliveryNote[]> {
  const cached = getFromStorage<DeliveryNote[]>(CACHE_KEY_NOTES, DEFAULT_NOTES);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE}?action=getNotes`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      // If the GAS returns an array of notes or an object with notes property
      let remoteNotes: DeliveryNote[] | null = null;
      if (Array.isArray(data) && data.length > 0) {
        remoteNotes = data;
      } else if (
        data &&
        typeof data === "object" &&
        Array.isArray((data as { notes?: unknown[] }).notes)
      ) {
        remoteNotes = (data as { notes: DeliveryNote[] }).notes;
      }

      if (remoteNotes && remoteNotes.length > 0) {
        // Merge with local assets/scans if scans are missing in raw sheet
        const merged = remoteNotes.map((rn) => {
          const matchDefault = DEFAULT_NOTES.find((dn) => dn.id === rn.id);
          return {
            ...matchDefault,
            ...rn,
            scans: rn.scans && rn.scans.length > 0 ? rn.scans : matchDefault?.scans || [],
          };
        });
        setToStorage(CACHE_KEY_NOTES, merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn("[API] fetchNotes error, using cached notes:", err);
  }

  // Fallback to cached notes or default notes
  return cached && cached.length > 0 ? cached : DEFAULT_NOTES;
}

/**
 * Fetch live orders from Google Apps Script backend with offline caching.
 */
export async function fetchLiveOrders(): Promise<Order[]> {
  const cached = getFromStorage<Order[]>(CACHE_KEY_ORDERS, DEFAULT_ORDERS);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE}?action=getLiveOrders`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      let remoteOrders: Order[] | null = null;
      if (Array.isArray(data) && data.length > 0) {
        remoteOrders = data;
      } else if (
        data &&
        typeof data === "object" &&
        Array.isArray((data as { orders?: unknown[] }).orders)
      ) {
        remoteOrders = (data as { orders: Order[] }).orders;
      }

      if (remoteOrders && remoteOrders.length > 0) {
        setToStorage(CACHE_KEY_ORDERS, remoteOrders);
        return remoteOrders;
      }
    }
  } catch (err) {
    console.warn("[API] fetchLiveOrders error, using cached orders:", err);
  }

  return cached && cached.length > 0 ? cached : DEFAULT_ORDERS;
}

/**
 * Submit approval (Rami review or Harel CEO final sign-off) to Google Apps Script.
 */
export async function submitApproval(
  noteId: string,
  approver: "rami" | "harel",
  note?: string,
): Promise<{ success: boolean; offlineQueued?: boolean }> {
  const payload: ApprovalPayload = {
    action: "submitApproval",
    noteId,
    approver,
    note,
    timestamp: new Date().toISOString(),
  };

  try {
    // Send POST using text/plain to avoid preflight issues with Google Apps Script web apps
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return { success: true };
    }
  } catch (err) {
    console.warn("[API] submitApproval offline/failed, queuing for later sync:", err);
    // Queue offline approval
    const pending = getFromStorage<ApprovalPayload[]>(PENDING_APPROVALS_KEY, []);
    pending.push(payload);
    setToStorage(PENDING_APPROVALS_KEY, pending);
    return { success: true, offlineQueued: true };
  }

  return { success: true };
}

/**
 * Flush any queued offline approvals when network becomes available.
 */
export async function flushPendingApprovals(): Promise<void> {
  if (typeof window === "undefined" || !navigator.onLine) return;
  const pending = getFromStorage<ApprovalPayload[]>(PENDING_APPROVALS_KEY, []);
  if (!pending || pending.length === 0) return;

  const remaining: ApprovalPayload[] = [];
  for (const item of pending) {
    try {
      await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(item),
      });
    } catch {
      remaining.push(item);
    }
  }
  setToStorage(PENDING_APPROVALS_KEY, remaining);
}
