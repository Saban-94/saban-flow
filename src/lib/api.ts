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
  "https://script.google.com/macros/s/AKfycbxLKDVRBB6tQVipEelxX5vVRVPSw8mcEatDMdonP0qd1sl5g-BCzhWCuhiAHrBGniH-RQ/exec";

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
 * 1. fetchNotes() -> GET ${API_BASE}?action=getNotes (pulls from 📑_ארכיון_תעודות_משלוח)
 */
export async function fetchNotes(): Promise<DeliveryNote[]> {
  const cached = getFromStorage<DeliveryNote[]>(CACHE_KEY_NOTES, DEFAULT_NOTES);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

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

/**
 * Helper to parse raw items string from Google Sheets order row.
 * Example format: "1. 📦 מק\"ט: 11511 | סומסום שק גדול (בלה) | כמות: 20\n2. 📦 מק\"ט: 60002 | שק גדול פקדון (בלה) | כמות: 20"
 */
function parseRawItems(raw: unknown): { name: string; qty: number; unit: string; weightKg: number; deposit?: number }[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string" || !raw.trim()) {
    return [{ name: "חומרי בניין (כללי)", qty: 1, unit: "משלוח", weightKg: 1000 }];
  }

  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  const parsed = lines.map((line) => {
    // Extract name
    const nameMatch = line.match(/\|\s*([^|]+)\s*\|\s*כמות/);
    const qtyMatch = line.match(/כמות:\s*([\d.]+)/);
    const skuMatch = line.match(/מק"ט:\s*([^|\s]+)/);

    const name = nameMatch ? nameMatch[1]?.trim() : line.replace(/^\d+\.\s*📦?\s*/, "").trim();
    const qty = qtyMatch ? parseFloat(qtyMatch[1] || "1") : 1;
    const isBale = line.includes("בלה") || line.includes("שק גדול");
    const isPallet = line.includes("משטח");
    const deposit = isBale ? 45 : isPallet ? 60 : undefined;
    const weightKg = isBale ? 1000 : isPallet ? 1200 : 25;

    return {
      name: name || "פריט בהזמנה",
      qty: isNaN(qty) ? 1 : qty,
      unit: isBale ? "בלה" : isPallet ? "משטח" : "שק",
      weightKg,
      deposit,
    };
  });

  return parsed.length > 0 ? parsed : [{ name: "חומרי בניין (כללי)", qty: 1, unit: "משלוח", weightKg: 1000 }];
}

/**
 * 2. fetchOrders() -> GET ${API_BASE}?action=getOrders (pulls from 🚚_הזמנות_חיות_וסידור)
 */
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
      let rawList: Record<string, unknown>[] | null = null;
      if (Array.isArray(data)) {
        rawList = data as Record<string, unknown>[];
      } else if (data && typeof data === "object" && Array.isArray((data as { data?: unknown[] }).data)) {
        rawList = (data as { data: Record<string, unknown>[] }).data;
      }

      if (rawList && rawList.length > 0) {
        const parsedOrders: Order[] = rawList.map((row, idx) => {
          // If sheet exports columns as array or object:
          const rawArr = Array.isArray(row["orderId"]) ? (row["orderId"] as string[]) : null;

          const orderId = rawArr ? rawArr[1] || `ORD-${idx + 1}` : String(row["orderId"] || `ORD-${idx + 1}`);
          const customer = rawArr ? rawArr[3] || "לקוח ח. סבן" : String(row["customer"] || "לקוח ח. סבן");
          const warehouseRaw = rawArr ? rawArr[4] : String(row["warehouse"] || "");
          const address = rawArr ? rawArr[5] || "" : String(row["address"] || "");
          const rawItems = rawArr ? rawArr[6] : row["items"];
          const driverRaw = rawArr ? rawArr[9] : String(row["driver"] || "");
          const statusRaw = rawArr ? rawArr[10] : String(row["status"] || "");

          const phoneMatch = address.match(/05\d-?\d{7}/);
          const phone = phoneMatch ? phoneMatch[0] : "050-6662300";

          const yard: Yard = String(warehouseRaw).includes("התלמיד")
            ? "מחסן 1 התלמיד 6"
            : "מחסן 4 החרש 10";

          const driverId = String(driverRaw).includes("חכמת")
            ? "hikmat"
            : String(driverRaw).includes("עלי")
              ? "ali"
              : null;

          const status: "פתוחה" | "בהעמסה" | "בדרך" =
            String(statusRaw).includes("בהעמסה")
              ? "בהעמסה"
              : String(statusRaw).includes("בדרך")
                ? "בדרך"
                : "פתוחה";

          const items = parseRawItems(rawItems);

          return {
            id: orderId,
            customer,
            phone,
            address: address || "אתר ח. סבן חומרי בניין",
            date: "2026-10-15",
            window: "08:00–11:00",
            yard,
            driverId,
            status,
            items,
          };
        });

        if (parsedOrders.length > 0) {
          setToStorage(CACHE_KEY_ORDERS, parsedOrders);
          return parsedOrders;
        }
      }
    }
  } catch (err) {
    console.warn("[API] fetchOrders error, using cached orders:", err);
  }

  return cached && cached.length > 0 ? cached : DEFAULT_ORDERS;
}

// Backward compatible alias
export const fetchLiveOrders = fetchOrders;

/**
 * 3. fetchGps() -> GET ${API_BASE}?action=getGps (pulls from 🛰️_הצלבת_איתוראן_GPS)
 */
export async function fetchGps(): Promise<GpsStop[]> {
  const cached = getFromStorage<GpsStop[]>(CACHE_KEY_GPS, DEFAULT_GPS_STOPS);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE}?action=getGps&sheetId=${MASTER_SHEET_ID}`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      let stops: GpsStop[] | null = null;
      if (Array.isArray(data) && data.length > 0) {
        stops = data as GpsStop[];
      } else if (data && typeof data === "object" && Array.isArray((data as { data?: unknown[] }).data)) {
        stops = (data as { data: GpsStop[] }).data;
      }

      if (stops && stops.length > 0) {
        setToStorage(CACHE_KEY_GPS, stops);
        return stops;
      }
    }
  } catch (err) {
    console.warn("[API] fetchGps error, using cached GPS stops:", err);
  }

  return cached && cached.length > 0 ? cached : DEFAULT_GPS_STOPS;
}

/**
 * 4. fetchCustomers() -> GET ${API_BASE}?action=getCustomers (pulls from 👥_תיקי_לקוחות_ומאזן)
 */
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
      let remoteCustomers: CustomerProfile[] | null = null;
      if (Array.isArray(data) && data.length > 0) {
        remoteCustomers = data as CustomerProfile[];
      } else if (data && typeof data === "object" && Array.isArray((data as { data?: unknown[] }).data)) {
        remoteCustomers = (data as { data: CustomerProfile[] }).data;
      }

      if (remoteCustomers && remoteCustomers.length > 0) {
        setToStorage(CACHE_KEY_CUSTOMERS, remoteCustomers);
        return remoteCustomers;
      }
    }
  } catch (err) {
    console.warn("[API] fetchCustomers error, using cached customers:", err);
  }

  return cached && cached.length > 0 ? cached : DEFAULT_CUSTOMERS;
}

/**
 * 5. fetchDashboard() -> GET ${API_BASE}?action=getDashboard (pulls from 👑_דשבורד_מנכל_ובקרה)
 */
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

  const cached = getFromStorage<DashboardSummary>(CACHE_KEY_DASHBOARD, fallback);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE}?action=getDashboard&sheetId=${MASTER_SHEET_ID}`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object" && !("status" in data && data.status === "running")) {
        const summary = { ...fallback, ...data, lastSyncAt: new Date().toLocaleTimeString("he-IL") };
        setToStorage(CACHE_KEY_DASHBOARD, summary);
        return summary;
      }
    }
  } catch (err) {
    console.warn("[API] fetchDashboard error, using cached summary:", err);
  }

  return cached;
}

/**
 * Submit approval (Rami review or Harel CEO final sign-off) to Google Apps Script.
 */
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
