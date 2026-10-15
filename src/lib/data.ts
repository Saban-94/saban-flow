export type Yard = "מחסן 4 החרש 10" | "מחסן 1 התלמיד 6";
export type AuditStatus = "ok" | "warn" | "fail";

export type Driver = {
  id: string;
  name: string;
  phone: string;
  truck: string;
};

export type DeliveryItem = {
  name: string;
  qty: number;
  ordered: number;
  price: number;
  weightKg: number;
  unit: string;
  deposit?: number;
};

export type DeliveryNote = {
  id: string;
  customer: string;
  date: string;
  items: DeliveryItem[];
  deposits?: {
    bales60002?: { delivered: number; billed: number };
    pallets60060?: { delivered: number; billed: number };
  };
  gps?: { status: AuditStatus; note: string };
};

export type Order = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  date: string;
  window: string;
  yard: Yard;
  driverId: string | null;
  status: "פתוחה" | "בהעמסה" | "בדרך";
  items: { name: string; qty: number; unit: string; weightKg: number; deposit?: number }[];
};

export type GpsRecord = {
  id: string;
  driverId: string;
  lat: number;
  lng: number;
  speed: number;
  status: string;
  updatedAt: string;
};

export const DRIVERS: Driver[] = [
  { id: "hikmat", name: "חכמת מנוף", phone: "050-0000000", truck: "מנוף 18000" },
  { id: "ali", name: "עלי משאית", phone: "050-1111111", truck: "משאית שטוחה 818000" },
];

export const BASE: DeliveryNote[] = [
  {
    id: "TN-9901",
    customer: "ש. לוי שיפוצים",
    date: "2026-10-15",
    items: [
      { name: "בלוק 20/40/20", qty: 6, ordered: 6, price: 450, weightKg: 1300, unit: "משטח" },
      { name: "מלט 50 ק״ג", qty: 40, ordered: 40, price: 25, weightKg: 50, unit: "שק" },
    ],
    deposits: {
      bales60002: { delivered: 2, billed: 2 },
      pallets60060: { delivered: 6, billed: 6 },
    },
    gps: { status: "ok", note: "המשאית הגיעה ליעד בהצלחה" },
  },
];

export const NOTES = BASE;

export const GPS_RECORDS: GpsRecord[] = [
  { id: "gps-1", driverId: "hikmat", lat: 32.15, lng: 34.88, speed: 45, status: "בנסיעה", updatedAt: "08:05" },
  { id: "gps-2", driverId: "ali", lat: 32.11, lng: 34.85, speed: 0, status: "עמידה", updatedAt: "08:00" },
];

export const noteTotal = (n: DeliveryNote) => n.items.reduce((s, i) => s + i.qty * i.price, 0);
export const noteWeightTons = (n: DeliveryNote) =>
  n.items.reduce((s, i) => s + i.qty * i.weightKg, 0) / 1000;
export const driverOf = (id: string) => DRIVERS.find((d) => d.id === id)!;

export function auditNote(n: DeliveryNote): { status: AuditStatus; findings: { status: AuditStatus; text: string }[] } {
  const findings: { status: AuditStatus; text: string }[] = [];
  n.items.forEach((i) => {
    if (i.qty !== i.ordered)
      findings.push({
        status: "warn",
        text: `${i.name}: סופק ${i.qty} מול ${i.ordered} בהזמנת קומקס`,
      });
  });
  const b = n.deposits?.bales60002 || { delivered: 0, billed: 0 };
  const p = n.deposits?.pallets60060 || { delivered: 0, billed: 0 };
  if (b.delivered !== b.billed)
    findings.push({
      status: "fail",
      text: `בלות פקדון 60002: ${b.delivered} סופקו, ${b.billed} חויבו`,
    });
  else if (b.delivered)
    findings.push({ status: "ok", text: `בלות 60002 תואמות 1:1 (${b.delivered})` });
  if (p.delivered !== p.billed)
    findings.push({
      status: "fail",
      text: `משטחי עץ 60060: ${p.delivered} סופקו, ${p.billed} חויבו`,
    });
  else if (p.delivered)
    findings.push({ status: "ok", text: `משטחי 60060 תואמים 1:1 (${p.delivered})` });
  if (n.gps) findings.push({ status: n.gps.status, text: `איתוראן: ${n.gps.note}` });
  if (!findings.some((f) => f.status !== "ok"))
    findings.unshift({ status: "ok", text: "כמויות תואמות להזמנת קומקס" });
  const status: AuditStatus = findings.some((f) => f.status === "fail")
    ? "fail"
    : findings.some((f) => f.status === "warn")
      ? "warn"
      : "ok";
  return { status, findings };
}

export const ORDERS: Order[] = [
  {
    id: "37901",
    customer: "ש. לוי שיפוצים",
    phone: "052-5551234",
    address: "הרצל 40, ראשון לציון",
    date: "2026-10-15",
    window: "07:00–09:00",
    yard: "מחסן 4 החרש 10",
    driverId: "hikmat",
    status: "בהעמסה",
    items: [
      { name: "בלוק 20/40/20", qty: 6, unit: "משטח", weightKg: 1300, deposit: 60 },
      { name: "מלט 50 ק״ג", qty: 40, unit: "שק", weightKg: 50 },
    ],
  },
  {
    id: "37905",
    customer: "מגדלי הים בע״מ",
    phone: "054-7778899",
    address: "הים 8, בת ים",
    date: "2026-10-15",
    window: "09:00–11:00",
    yard: "מחסן 1 התלמיד 6",
    driverId: "ali",
    status: "פתוחה",
    items: [
      { name: "חול מחצבה", qty: 5, unit: "בלה", weightKg: 1000, deposit: 45 },
      { name: "טיח צמנטי", qty: 50, unit: "שק", weightKg: 25 },
    ],
  },
  {
    id: "37910",
    customer: "א. כהן קבלנות",
    phone: "050-1112233",
    address: "שד׳ ירושלים 112, יפו",
    date: "2026-10-15",
    window: "11:00–13:00",
    yard: "מחסן 4 החרש 10",
    driverId: null,
    status: "פתוחה",
    items: [{ name: "ברזל 10 מ״מ", qty: 1.5, unit: "טון", weightKg: 1000, deposit: 60 }],
  },
  {
    id: "37912",
    customer: "יזמות הדר השרון",
    phone: "053-4445566",
    address: "הנרקיס 3, הוד השרון",
    date: "2026-10-16",
    window: "07:00–10:00",
    yard: "מחסן 1 התלמיד 6",
    driverId: "hikmat",
    status: "פתוחה",
    items: [
      { name: "גבס לוח 12.5", qty: 120, unit: "לוח", weightKg: 22 },
      { name: "פרופיל 70", qty: 200, unit: "יח׳", weightKg: 1.2 },
    ],
  },
];

export function fetchNotes(): DeliveryNote[] {
  return NOTES;
}

export function fetchLiveOrders(): Order[] {
  return ORDERS;
}

export function fetchGps(): GpsRecord[] {
  return GPS_RECORDS;
}

export const ils = (n: number) => "₪" + n.toLocaleString("he-IL", { maximumFractionDigits: 0 });
export const fmtDate = (d: string) => d.split("-").reverse().join("/");
