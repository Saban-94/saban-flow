import {
  BASE as DEFAULT_NOTES,
  ORDERS as DEFAULT_ORDERS,
  type DeliveryNote,
  type Order,
  type Yard,
} from "./data";
import { CUSTOMERS as DEFAULT_CUSTOMERS, type CustomerProfile } from "./customers-data";
import { SAMPLE_STOPS as DEFAULT_GPS_STOPS, type GpsStop } from "./ituran";

export const API_BASE =
  "https://script.google.com/macros/s/AKfycbxEh-IMCSHCmiM93UhBVm65X62RN1-5EOQy_NmR6p2RBa0p2wO3Ea1ZivDtFLW4tKKQ/exec";

export const MASTER_SHEET_ID = "1u1NiB7TAjHQQMEqZfGZI5mCOOKDu9F33RzBfuMnZ9Go";

const CACHE_KEY_NOTES = "saban-live-notes-v3";
const CACHE_KEY_ORDERS = "saban-live-orders-v3";
const CACHE_KEY_GPS = "saban-live-gps-v3";
const CACHE_KEY_CUSTOMERS = "saban-live-customers-v3";
const CACHE_KEY_DASHBOARD = "saban-live-dashboard-v3";
const PENDING_APPROVALS_KEY = "saban-pending-approvals-v1";

export type ApprovalPayload = {
  action: "submitApproval";
  noteId: string;
  approver: "rami" | "harel";
  note?: string;
  timestamp: string;
};

export type DashboardSummary = {
  pendingHarelCount: number;
  pendingRamiCount: number;
  totalNotesValue: number;
  activeOrdersCount: number;
  fieldBales60002: number;
  fieldPallets60060: number;
  lastSyncAt: string;
};

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
  } catch {}
}

export async function fetchNotes(): Promise<DeliveryNote[]> {
  const cached = getFromStorage<DeliveryNote[]>(CACHE_KEY_NOTES, DEFAULT_NOTES);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${API_BASE}?action=getNotes&sheetId=${MASTER_SHEET_ID}`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      let remoteNotes: DeliveryNote[] | null = null;
      if (Array.isArray(data) && data.length > 0) {
        remoteNotes = data;
      } else if (data && typeof data === "object" && Array.isArray((data as { notes?: unknown[] }).notes)) {
        remoteNotes = (data as { notes: DeliveryNote[] }).notes;
      } else if (data && typeof data === "object" && Array.isArray((data as { data?: unknown[] }).data)) {
        remoteNotes = (data as { data: DeliveryNote[] }).data;
      }

      if (remoteNotes && remoteNotes.length > 0) {
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
  return cached && cached.length > 0 ? cached : DEFAULT_NOTES;
}

export async function fetchOrders(): Promise<Order[]> {
  const cached = getFromStorage<Order[]>(CACHE_KEY_ORDERS, DEFAULT_ORDERS);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE}?action=getOrders&sheetId=${MASTER_SHEET_ID}`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      let rawList: any[] | null = null;
      if (Array.isArray(data)) rawList = data;
      else if (data && typeof data === "object" && Array.isArray(data.data)) rawList = data.data;

      if (rawList && rawList.length > 0) {
        setToStorage(CACHE_KEY_ORDERS, rawList);
        return rawList;
      }
    }
  } catch (err) {
    console.warn("[API] fetchOrders error, using cached orders:", err);
  }
  return cached && cached.length > 0 ? cached : DEFAULT_ORDERS;
}

export const fetchLiveOrders = fetchOrders;

export async function fetchGps(): Promise<GpsStop[]> {
  const normalizeStops = (list: any[]): GpsStop[] => {
    if (!Array.isArray(list)) return DEFAULT_GPS_STOPS;
    const mapped = list
      .map((r) => {
        if (!r || typeof r !== "object") return null;
        const plate = String(r.plate || r["מספר רישוי"] || r["רכב"] || "").trim();
        const address = String(r.address || r["כתובת לקוח מאותרת"] || r["כתובת"] || "").trim();
        const rawArrive = String(r.arrive || r["שעת כניסה לגדר"] || r["שעת כניסה"] || "08:00");
        const rawDepart = String(r.depart || r["שעת יציאה מגדר"] || r["שעת יציאה"] || "08:30");
        const arrive = (rawArrive.match(/\d{1,2}:\d{2}/)?.[0] ?? "08:00").padStart(5, "0");
        const depart = (rawDepart.match(/\d{1,2}:\d{2}/)?.[0] ?? "08:30").padStart(5, "0");
        return plate ? { plate, address, arrive, depart } : null;
      })
      .filter((s): s is GpsStop => Boolean(s && s.plate));

    return mapped.length > 0 ? mapped : DEFAULT_GPS_STOPS;
  };

  const rawCached = getFromStorage<any[]>(CACHE_KEY_GPS, DEFAULT_GPS_STOPS);
  const cached = normalizeStops(rawCached);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${API_BASE}?action=getGps&sheetId=${MASTER_SHEET_ID}`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawStops = Array.isArray(data) ? data : data?.data;
      if (Array.isArray(rawStops) && rawStops.length > 0) {
        const cleanStops = normalizeStops(rawStops);
        setToStorage(CACHE_KEY_GPS, cleanStops);
        return cleanStops;
      }
    }
  } catch (err) {
    console.warn("[API] fetchGps fallback to normalized cache:", err);
  }
  return cached;
}
export async function fetchCustomers(): Promise<CustomerProfile[]> {
  const cached = getFromStorage<CustomerProfile[]>(CACHE_KEY_CUSTOMERS, DEFAULT_CUSTOMERS);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE}?action=getCustomers&sheetId=${MASTER_SHEET_ID}`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.data;
      if (list && list.length > 0) {
        setToStorage(CACHE_KEY_CUSTOMERS, list);
        return list;
      }
    }
  } catch (err) {}
  return cached;
}

export async function fetchDashboard(): Promise<DashboardSummary> {
  const fallback: DashboardSummary = {
    pendingHarelCount: 3,
    pendingRamiCount: 1,
    totalNotesValue: 28450,
    activeOrdersCount: 8,
    fieldBales60002: 418,
    fieldPallets60060: 276,
    lastSyncAt: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
  };

  try {
    const res = await fetch(`${API_BASE}?action=getDashboard&sheetId=${MASTER_SHEET_ID}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object") {
        return { ...fallback, ...data, lastSyncAt: new Date().toLocaleTimeString("he-IL") };
      }
    }
  } catch (err) {}
  return fallback;
}

export async function submitApproval(
  noteId: string,
  approver: "rami" | "harel",
  note?: string
): Promise<{ success: boolean; offlineQueued?: boolean }> {
  const payload: ApprovalPayload = {
    action: "submitApproval",
    noteId,
    approver,
    note,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { success: true };
  } catch (err) {
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
