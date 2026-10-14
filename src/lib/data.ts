export type Yard = "מחסן 4 החרש 10" | "מחסן 1 התלמיד 6";
export type Driver = { id: string; name: string; truck: string; plate: string; kind: "crane" | "flatbed" };

export const DRIVERS: Driver[] = [
  { id: "hikmat", name: "חכמת", truck: "משאית מנוף", plate: "615-41-002", kind: "crane" },
  { id: "ali", name: "עלי", truck: "משאית פלטה", plate: "651-51-701", kind: "flatbed" },
];

export const YARD_MANAGERS: Record<Yard, string> = {
  "מחסן 4 החרש 10": "אורן",
  "מחסן 1 התלמיד 6": "תמיר",
};

export type Item = { sku: string; name: string; qty: number; ordered: number; unit: string; price: number; weightKg: number };

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
  gps: { arrive: string; depart: string; status: AuditStatus; note: string };
  deposits: { bales60002: { delivered: number; billed: number }; pallets60060: { delivered: number; billed: number } };
};

const BASE: DeliveryNote[] = [
  {
    id: "45873", customerNo: "10234", customer: "ב.ש. בנייה ופיתוח בע״מ", site: "רח׳ החרש 5, רמת גן",
    date: "2026-10-13", yard: "מחסן 4 החרש 10", driverId: "hikmat", signedAt: "08:42", comaxOrder: "37821",
    items: [
      { sku: "1001", name: "מלט פורטלנד 50 ק״ג", qty: 80, ordered: 80, unit: "שק", price: 32, weightKg: 50 },
      { sku: "2040", name: "בלוק 20/40/20 אפור", qty: 12, ordered: 12, unit: "משטח", price: 690, weightKg: 1300 },
      { sku: "60060", name: "משטח עץ (פקדון)", qty: 12, ordered: 12, unit: "יח׳", price: 60, weightKg: 20 },
    ],
    gps: { arrive: "08:05", depart: "08:47", status: "ok", note: "שהייה 42 דק׳ — תואם הנפת מנוף" },
    deposits: { bales60002: { delivered: 0, billed: 0 }, pallets60060: { delivered: 12, billed: 12 } },
  },
  {
    id: "45874", customerNo: "10551", customer: "א. כהן קבלנות", site: "שד׳ ירושלים 112, יפו",
    date: "2026-10-13", yard: "מחסן 1 התלמיד 6", driverId: "ali", signedAt: "10:20", comaxOrder: "37830",
    items: [
      { sku: "3010", name: "חול מחצבה", qty: 4, ordered: 4, unit: "בלה", price: 260, weightKg: 1000 },
      { sku: "60002", name: "בלה (פקדון)", qty: 4, ordered: 4, unit: "יח׳", price: 45, weightKg: 2 },
      { sku: "1001", name: "מלט פורטלנד 50 ק״ג", qty: 30, ordered: 40, unit: "שק", price: 32, weightKg: 50 },
    ],
    gps: { arrive: "09:58", depart: "10:06", status: "warn", note: "שהייה 8 דק׳ בלבד, חתימה 14 דק׳ אחרי יציאה" },
    deposits: { bales60002: { delivered: 4, billed: 3 }, pallets60060: { delivered: 0, billed: 0 } },
  },
  {
    id: "45875", customerNo: "10877", customer: "יזמות הדר השרון", site: "הנרקיס 3, הוד השרון",
    date: "2026-10-13", yard: "מחסן 4 החרש 10", driverId: "hikmat", signedAt: "12:15", comaxOrder: "37842",
    items: [
      { sku: "4100", name: "ברזל 12 מ״מ", qty: 2, ordered: 2, unit: "טון", price: 3900, weightKg: 1000 },
      { sku: "60060", name: "משטח עץ (פקדון)", qty: 2, ordered: 2, unit: "יח׳", price: 60, weightKg: 20 },
    ],
    gps: { arrive: "11:30", depart: "12:20", status: "ok", note: "שהייה 50 דק׳ — מנוף, תקין" },
    deposits: { bales60002: { delivered: 0, billed: 0 }, pallets60060: { delivered: 2, billed: 2 } },
  },
  {
    id: "45869", customerNo: "10234", customer: "ב.ש. בנייה ופיתוח בע״מ", site: "רח׳ החרש 5, רמת גן",
    date: "2026-10-12", yard: "מחסן 1 התלמיד 6", driverId: "ali", signedAt: "14:05", comaxOrder: "37790",
    items: [
      { sku: "5020", name: "גבס לוח 12.5", qty: 60, ordered: 60, unit: "לוח", price: 38, weightKg: 22 },
    ],
    gps: { arrive: "—", depart: "—", status: "fail", note: "הרכב לא זוהה בכתובת הלקוח" },
    deposits: { bales60002: { delivered: 0, billed: 0 }, pallets60060: { delivered: 0, billed: 0 } },
  },
];

export const NOTES = BASE;

export const noteTotal = (n: DeliveryNote) => n.items.reduce((s, i) => s + i.qty * i.price, 0);
export const noteWeightTons = (n: DeliveryNote) => n.items.reduce((s, i) => s + i.qty * i.weightKg, 0) / 1000;
export const driverOf = (id: string) => DRIVERS.find((d) => d.id === id)!;

export function auditNote(n: DeliveryNote): { status: AuditStatus; findings: { status: AuditStatus; text: string }[] } {
  const findings: { status: AuditStatus; text: string }[] = [];
  n.items.forEach((i) => {
    if (i.qty !== i.ordered) findings.push({ status: "warn", text: `${i.name}: סופק ${i.qty} מול ${i.ordered} בהזמנת קומקס` });
  });
  const b = n.deposits.bales60002, p = n.deposits.pallets60060;
  if (b.delivered !== b.billed) findings.push({ status: "fail", text: `בלות פקדון 60002: ${b.delivered} סופקו, ${b.billed} חויבו` });
  else if (b.delivered) findings.push({ status: "ok", text: `בלות 60002 תואמות 1:1 (${b.delivered})` });
  if (p.delivered !== p.billed) findings.push({ status: "fail", text: `משטחי עץ 60060: ${p.delivered} סופקו, ${p.billed} חויבו` });
  else if (p.delivered) findings.push({ status: "ok", text: `משטחי 60060 תואמים 1:1 (${p.delivered})` });
  findings.push({ status: n.gps.status, text: `איתוראן: ${n.gps.note}` });
  if (!findings.some((f) => f.status !== "ok")) findings.unshift({ status: "ok", text: "כמויות תואמות להזמנת קומקס" });
  const status: AuditStatus = findings.some((f) => f.status === "fail") ? "fail" : findings.some((f) => f.status === "warn") ? "warn" : "ok";
  return { status, findings };
}

export type Order = {
  id: string; customer: string; phone: string; address: string; date: string; window: string;
  yard: Yard; driverId: string | null; status: "פתוחה" | "בהעמסה" | "בדרך";
  items: { name: string; qty: number; unit: string; weightKg: number; deposit?: number }[];
};

export const ORDERS: Order[] = [
  { id: "37901", customer: "ש. לוי שיפוצים", phone: "052-5551234", address: "הרצל 40, ראשון לציון", date: "2026-10-15", window: "07:00–09:00", yard: "מחסן 4 החרש 10", driverId: "hikmat", status: "בהעמסה",
    items: [{ name: "בלוק 20/40/20", qty: 6, unit: "משטח", weightKg: 1300, deposit: 60 }, { name: "מלט 50 ק״ג", qty: 40, unit: "שק", weightKg: 50 }] },
  { id: "37905", customer: "מגדלי הים בע״מ", phone: "054-7778899", address: "הים 8, בת ים", date: "2026-10-15", window: "09:00–11:00", yard: "מחסן 1 התלמיד 6", driverId: "ali", status: "פתוחה",
    items: [{ name: "חול מחצבה", qty: 5, unit: "בלה", weightKg: 1000, deposit: 45 }, { name: "טיח צמנטי", qty: 50, unit: "שק", weightKg: 25 }] },
  { id: "37910", customer: "א. כהן קבלנות", phone: "050-1112233", address: "שד׳ ירושלים 112, יפו", date: "2026-10-15", window: "11:00–13:00", yard: "מחסן 4 החרש 10", driverId: null, status: "פתוחה",
    items: [{ name: "ברזל 10 מ״מ", qty: 1.5, unit: "טון", weightKg: 1000, deposit: 60 }] },
  { id: "37912", customer: "יזמות הדר השרון", phone: "053-4445566", address: "הנרקיס 3, הוד השרון", date: "2026-10-16", window: "07:00–10:00", yard: "מחסן 1 התלמיד 6", driverId: "hikmat", status: "פתוחה",
    items: [{ name: "גבס לוח 12.5", qty: 120, unit: "לוח", weightKg: 22 }, { name: "פרופיל 70", qty: 200, unit: "יח׳", weightKg: 1.2 }] },
];

export const ils = (n: number) => "₪" + n.toLocaleString("he-IL", { maximumFractionDigits: 0 });
export const fmtDate = (d: string) => d.split("-").reverse().join("/");
