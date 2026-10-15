export type Yard = "מחסן 4 החרש 10" | "מחסן 1 התלמיד 6";
export type Driver = {
  id: string;
  name: string;
  truck: string;
  plate: string;
  kind: "crane" | "flatbed";
};

export const DRIVERS: Driver[] = [
  { id: "hikmat", name: "חכמת", truck: "משאית מנוף", plate: "615-41-002", kind: "crane" },
  { id: "ali", name: "עלי", truck: "משאית פלטה", plate: "651-51-701", kind: "flatbed" },
];

export const YARD_MANAGERS: Record<Yard, string> = {
  "מחסן 4 החרש 10": "אורן",
  "מחסן 1 התלמיד 6": "תמיר",
};

export type Item = {
  sku: string;
  name: string;
  qty: number;
  ordered: number;
  unit: string;
  price: number;
  weightKg: number;
};

export type AuditStatus = "ok" | "warn" | "fail";

export type DeliveryNote = {
  id: string;
  customerNo: string;
  customer: string;
  site: string;
  date: string; // YYYY-MM-DD
  yard: Yard;
  driverId: string;
  signedAt: string; // HH:MM
  comaxOrder: string;
  items: Item[];
  scans?: string[];
  gps: { arrive: string; depart: string; status: AuditStatus; note: string };
  deposits: {
    bales60002: { delivered: number; billed: number };
    pallets60060: { delivered: number; billed: number };
  };
};

import p02 from "@/assets/scans/p02.jpg.asset.json";
import p03 from "@/assets/scans/p03.jpg.asset.json";
import p04 from "@/assets/scans/p04.jpg.asset.json";
import p05 from "@/assets/scans/p05.jpg.asset.json";
import p06 from "@/assets/scans/p06.jpg.asset.json";
import p07 from "@/assets/scans/p07.jpg.asset.json";
import p08 from "@/assets/scans/p08.jpg.asset.json";
import p09 from "@/assets/scans/p09.jpg.asset.json";
import p10 from "@/assets/scans/p10.jpg.asset.json";
import p11 from "@/assets/scans/p11.jpg.asset.json";
import p12 from "@/assets/scans/p12.jpg.asset.json";
import p13 from "@/assets/scans/p13.jpg.asset.json";

export const TACHOGRAPH_1310 = p13.url;

const AZULA = { customerNo: "632122", customer: "א. ערן אזולא", site: "נח 3, תל אביב" };
const D = "2026-10-13";
const Y4: Yard = "מחסן 4 החרש 10";
const pal = (n: number) => ({
  bales60002: { delivered: 0, billed: 0 },
  pallets60060: { delivered: n, billed: n },
});

export const BASE: DeliveryNote[] = [
  {
    id: "6715751",
    customerNo: "601928",
    customer: "אורבר בנייה",
    site: "ירמיהו ר״ג, רמת גן",
    date: D,
    yard: Y4,
    driverId: "hikmat",
    signedAt: "08:00",
    comaxOrder: "6215936",
    scans: [p02.url],
    items: [
      {
        sku: "11551",
        name: "חול שק גדול",
        qty: 2,
        ordered: 2,
        unit: "שק",
        price: 240,
        weightKg: 1000,
      },
      {
        sku: "10002",
        name: "מלט אפור 25 ק״ג",
        qty: 10,
        ordered: 10,
        unit: "שק",
        price: 22,
        weightKg: 25,
      },
      {
        sku: "60060",
        name: "משטח עץ (פקדון)",
        qty: 4,
        ordered: 4,
        unit: "יח׳",
        price: 60,
        weightKg: 20,
      },
    ],
    gps: { arrive: "07:30", depart: "08:07", status: "ok", note: "שהייה 37 דק׳ — תואם הנפת מנוף" },
    deposits: pal(4),
  },
  {
    id: "6715752",
    ...AZULA,
    date: D,
    yard: Y4,
    driverId: "hikmat",
    signedAt: "09:20",
    comaxOrder: "6215937",
    scans: [p03.url, p05.url],
    items: [
      {
        sku: "11511",
        name: "חול שק גדול",
        qty: 15,
        ordered: 15,
        unit: "שק",
        price: 240,
        weightKg: 1000,
      },
      {
        sku: "18073",
        name: "הובלת מנוף",
        qty: 1,
        ordered: 1,
        unit: "יח׳",
        price: 650,
        weightKg: 0,
      },
      {
        sku: "60002",
        name: "בלה (פקדון)",
        qty: 15,
        ordered: 15,
        unit: "יח׳",
        price: 45,
        weightKg: 2,
      },
    ],
    gps: {
      arrive: "08:50",
      depart: "09:28",
      status: "ok",
      note: "שהייה 38 דק׳ — מנוף, חותמת מחסן קיימת",
    },
    deposits: {
      bales60002: { delivered: 15, billed: 15 },
      pallets60060: { delivered: 0, billed: 0 },
    },
  },
  {
    id: "6715753",
    ...AZULA,
    date: D,
    yard: Y4,
    driverId: "hikmat",
    signedAt: "10:05",
    comaxOrder: "6215937",
    scans: [p04.url],
    items: [
      {
        sku: "15710",
        name: "חול לבן 25 ק״ג",
        qty: 30,
        ordered: 30,
        unit: "שק",
        price: 18,
        weightKg: 25,
      },
    ],
    gps: {
      arrive: "09:58",
      depart: "10:09",
      status: "warn",
      note: "שהייה 11 דק׳ — קצר ממשך הנפת מנוף",
    },
    deposits: pal(0),
  },
  {
    id: "6715762",
    customerNo: "632277",
    customer: "יוסף בילר",
    site: "ירושלים 1, הוד השרון",
    date: D,
    yard: Y4,
    driverId: "hikmat",
    signedAt: "11:20",
    comaxOrder: "6215942",
    scans: [p06.url, p07.url],
    items: [
      {
        sku: "11551",
        name: "חול שק גדול",
        qty: 10,
        ordered: 10,
        unit: "שק",
        price: 240,
        weightKg: 1000,
      },
      {
        sku: "10002",
        name: "מלט 25 ק״ג",
        qty: 55,
        ordered: 55,
        unit: "שק",
        price: 22,
        weightKg: 25,
      },
      {
        sku: "19412",
        name: "SIKA ECO 412 25 ק״ג",
        qty: 3,
        ordered: 3,
        unit: "שק",
        price: 95,
        weightKg: 25,
      },
      {
        sku: "60060",
        name: "משטח עץ (פקדון)",
        qty: 2,
        ordered: 2,
        unit: "יח׳",
        price: 60,
        weightKg: 20,
      },
    ],
    gps: { arrive: "10:52", depart: "11:31", status: "ok", note: "שהייה 39 דק׳ — תקין" },
    deposits: pal(2),
  },
  {
    id: "6715764",
    ...AZULA,
    date: D,
    yard: Y4,
    driverId: "hikmat",
    signedAt: "—",
    comaxOrder: "6215960",
    scans: [p08.url, p10.url],
    items: [
      {
        sku: "15161",
        name: "רשתות אסף 181 25 ק״ג",
        qty: 240,
        ordered: 240,
        unit: "שק",
        price: 6,
        weightKg: 25,
      },
      {
        sku: "19994",
        name: "פרופיל 60/60",
        qty: 175,
        ordered: 175,
        unit: "קרטון",
        price: 12,
        weightKg: 3,
      },
      {
        sku: "60002",
        name: "בלה (פקדון)",
        qty: 1,
        ordered: 1,
        unit: "יח׳",
        price: 45,
        weightKg: 2,
      },
      {
        sku: "60060",
        name: "משטח עץ (פקדון)",
        qty: 1,
        ordered: 1,
        unit: "יח׳",
        price: 60,
        weightKg: 20,
      },
    ],
    gps: {
      arrive: "12:01",
      depart: "12:40",
      status: "warn",
      note: "אין חתימת לקוח — הערת גליה: לבדוק מול הסידור",
    },
    deposits: {
      bales60002: { delivered: 1, billed: 1 },
      pallets60060: { delivered: 1, billed: 1 },
    },
  },
  {
    id: "6715765",
    ...AZULA,
    date: D,
    yard: Y4,
    driverId: "hikmat",
    signedAt: "—",
    comaxOrder: "6715764",
    scans: [p09.url],
    items: [
      {
        sku: "15161",
        name: "רשתות אסף 181 (סטורנו)",
        qty: -240,
        ordered: -240,
        unit: "שק",
        price: 6,
        weightKg: 25,
      },
      {
        sku: "19994",
        name: "פרופיל 60/60 (סטורנו)",
        qty: -175,
        ordered: -175,
        unit: "קרטון",
        price: 12,
        weightKg: 3,
      },
      {
        sku: "60002",
        name: "בלה (סטורנו)",
        qty: -1,
        ordered: -1,
        unit: "יח׳",
        price: 45,
        weightKg: 2,
      },
    ],
    gps: {
      arrive: "—",
      depart: "—",
      status: "warn",
      note: "תעודת סטורנו לת.מ. 6715764 — ביטול, ללא נסיעה",
    },
    deposits: {
      bales60002: { delivered: -1, billed: 0 },
      pallets60060: { delivered: 0, billed: 0 },
    },
  },
  {
    id: "6715766",
    ...AZULA,
    date: D,
    yard: Y4,
    driverId: "hikmat",
    signedAt: "13:40",
    comaxOrder: "6215960",
    scans: [p12.url, p11.url],
    items: [
      {
        sku: "15161",
        name: "רשתות אסף 181 25 ק״ג",
        qty: 240,
        ordered: 240,
        unit: "שק",
        price: 6,
        weightKg: 25,
      },
      {
        sku: "19994",
        name: "פרופיל 60/60",
        qty: 175,
        ordered: 175,
        unit: "קרטון",
        price: 12,
        weightKg: 3,
      },
      {
        sku: "19295",
        name: "SIKA 255 25 ק״ג",
        qty: 60,
        ordered: 60,
        unit: "שק",
        price: 48,
        weightKg: 25,
      },
      {
        sku: "60060",
        name: "משטח עץ (פקדון)",
        qty: 1,
        ordered: 1,
        unit: "יח׳",
        price: 60,
        weightKg: 20,
      },
    ],
    gps: {
      arrive: "13:05",
      depart: "13:44",
      status: "ok",
      note: "הגעה 13:05, חתימה 13:40 — 39 דק׳ מנוף, תקין",
    },
    deposits: pal(1),
  },
];

export const NOTES = BASE;

export const noteTotal = (n: DeliveryNote) => n.items.reduce((s, i) => s + i.qty * i.price, 0);
export const noteWeightTons = (n: DeliveryNote) =>
  n.items.reduce((s, i) => s + i.qty * i.weightKg, 0) / 1000;
export const driverOf = (id: string) => DRIVERS.find((d) => d.id === id)!;

export function auditNote(n: DeliveryNote): {
  status: AuditStatus;
  findings: { status: AuditStatus; text: string }[];
} {
  const findings: { status: AuditStatus; text: string }[] = [];
  n.items.forEach((i) => {
    if (i.qty !== i.ordered)
      findings.push({
        status: "warn",
        text: `${i.name}: סופק ${i.qty} מול ${i.ordered} בהזמנת קומקס`,
      });
  });
  const b = n.deposits.bales60002,
    p = n.deposits.pallets60060;
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
  findings.push({ status: n.gps.status, text: `איתוראן: ${n.gps.note}` });
  if (!findings.some((f) => f.status !== "ok"))
    findings.unshift({ status: "ok", text: "כמויות תואמות להזמנת קומקס" });
  const status: AuditStatus = findings.some((f) => f.status === "fail")
    ? "fail"
    : findings.some((f) => f.status === "warn")
      ? "warn"
      : "ok";
  return { status, findings };
}

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

export const ils = (n: number) => "₪" + n.toLocaleString("he-IL", { maximumFractionDigits: 0 });
export const fmtDate = (d: string) => d.split("-").reverse().join("/");

export {
  API_BASE,
  MASTER_SHEET_ID,
  fetchNotes,
  fetchOrders,
  fetchLiveOrders,
  fetchGps,
  fetchCustomers,
  fetchDashboard,
  submitApproval,
} from "./api";

