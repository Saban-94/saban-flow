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
  driveLink?: string;
  sourceFileName?: string;
  sourceFileLink?: string;
  filingStatus?: string;
  handwritingNotes?: string;
  returnsAndCredits?: string;
  aiConclusion?: string;
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

export const SPREADSHEET_ID = "1FsLseQrKbIj_AvlE6-dW4J12Gr88P3uaoFVBjEcUjsw";
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
export const TAB_GALYA_ARCHIVE = "ארכיון_תעודות_גליה";
export const TAB_TACHOGRAPH = "ארכיון_טכוגרף";

export const TACHOGRAPH_1310 = p13.url;

export type TachographRecord = {
  id: string;
  date: string;
  driverName: string;
  truckId: string;
  originalFileName: string;
  kmStart: number;
  kmEnd: number;
  kmTotal: number;
  ptoHours: string;
  idleWarnings: number;
  discUrl: string;
  ituranMatch: string;
  ramiApproved: boolean;
  ramiApprovedAt?: string;
};

export const INITIAL_TACHOGRAPHS: TachographRecord[] = [
  {
    id: "tacho-181026-1",
    date: "18/10/2026",
    driverName: "חכמת",
    truckId: "615-41-002",
    originalFileName: "scan12026-10-12-131648.pdf",
    kmStart: 342110,
    kmEnd: 342248,
    kmTotal: 138,
    ptoHours: "02:20",
    idleWarnings: 0,
    discUrl: p13.url,
    ituranMatch: "✅ דיסקית פוענחה ומאומתת (100% תואם איתוראן)",
    ramiApproved: true,
    ramiApprovedAt: "18/10/2026, 17:30",
  },
  {
    id: "tacho-141026",
    date: "14/10/2026",
    driverName: "חכמת",
    truckId: "615-41-002",
    originalFileName: "scan12026-10-14-081059.pdf",
    kmStart: 341968,
    kmEnd: 342110,
    kmTotal: 142,
    ptoHours: "03:10",
    idleWarnings: 0,
    discUrl: p13.url,
    ituranMatch: "✅ דיסקית פוענחה ומאומתת (98.9% תואם איתוראן)",
    ramiApproved: true,
    ramiApprovedAt: "14/10/2026, 18:02",
  },
  {
    id: "tacho-181026-2",
    date: "18/10/2026",
    driverName: "עלי",
    truckId: "651-51-701",
    originalFileName: "scan12026-10-12-131648.pdf",
    kmStart: 218430,
    kmEnd: 218545,
    kmTotal: 115,
    ptoHours: "00:00 (משאית פלטה)",
    idleWarnings: 0,
    discUrl: p13.url,
    ituranMatch: "✅ דיסקית פוענחה ומאומתת (100% תואם איתוראן)",
    ramiApproved: true,
    ramiApprovedAt: "18/10/2026, 18:15",
  },
];

export const NOTES: DeliveryNote[] = [
  {
    id: "6714605",
    customerNo: "602568",
    customer: "בוקטוס שלום-ביס הרצוג כס",
    site: "בי\"ס הרצוג כפר סבא",
    date: "2026-08-17",
    yard: "מחסן 4 החרש 10",
    driverId: "hikmat",
    signedAt: "09:41",
    comaxOrder: "6214939",
    scans: [p02.url],
    driveLink: "https://drive.google.com/file/d/1MFpvv_q-ZDgnF7y6jrTasSPhk9L4qfEM/view",
    sourceFileName: "scan12026-08-17-114345.pdf",
    sourceFileLink: "https://drive.google.com/file/d/1MFpvv_q-ZDgnF7y6jrTasSPhk9L4qfEM/view",
    filingStatus: "✅ פוצל ותוייק בתיק לקוח",
    handwritingNotes: "חתימת מנהל אתר עמית נפרק במנוף קומה 2",
    returnsAndCredits: "הוחזרו 2 משטחי סבן ריקים לזיכוי",
    aiConclusion: "✅ אספקה מאומתת מלאה + זיכוי 2 משטחים",
    items: [
      { sku: "SKU-10001", name: "טיט שק גדול", qty: 6, ordered: 6, unit: "בלה", price: 240, weightKg: 1000 },
      { sku: "SKU-10002", name: "מלט אפור 25 ק\"ג", qty: 40, ordered: 40, unit: "שק", price: 22, weightKg: 25 },
      { sku: "SKU-10003", name: "טיח גבס MP75", qty: 10, ordered: 10, unit: "שק", price: 35, weightKg: 25 },
      { sku: "SKU-10004", name: "מנוף", qty: 1, ordered: 1, unit: "הנפה", price: 650, weightKg: 0 },
    ],
    gps: {
      arrive: "09:28",
      depart: "09:41",
      status: "ok",
      note: "עצירת טכוגרף 13 דקות מאומתת (09:28-09:41) — תואם הנפת מנוף",
    },
    deposits: {
      bales60002: { delivered: 6, billed: 6 },
      pallets60060: { delivered: 1, billed: 1 },
    },
  },
  {
    id: "6714590",
    customerNo: "616088",
    customer: "ערוגת הבשם",
    site: "באר גנים 78 אבן יהודה",
    date: "2026-08-17",
    yard: "מחסן 4 החרש 10",
    driverId: "hikmat",
    signedAt: "10:33",
    comaxOrder: "6214864",
    scans: [p03.url],
    driveLink: "https://drive.google.com/file/d/18neh4bihOyWPDMf3_SAF3NAhoKGsy42A/view",
    sourceFileName: "scan12026-08-17-112153.pdf",
    sourceFileLink: "https://drive.google.com/file/d/18neh4bihOyWPDMf3_SAF3NAhoKGsy42A/view",
    filingStatus: "✅ פוצל ותוייק בתיק לקוח",
    handwritingNotes: "נמסר ונחתם ע\"י יוסי מלכה ללא פריקה",
    returnsAndCredits: "ללא החזרות",
    aiConclusion: "✅ אספקה מאומתת מלאה (תואם 100%)",
    items: [
      { sku: "SKU-10005", name: "חול שק גדול", qty: 2, ordered: 2, unit: "בלה", price: 240, weightKg: 1000 },
      { sku: "SKU-10006", name: "סומסום שק גדול", qty: 2, ordered: 2, unit: "בלה", price: 240, weightKg: 1000 },
      { sku: "SKU-10007", name: "מלט אפור", qty: 20, ordered: 20, unit: "שק", price: 22, weightKg: 25 },
      { sku: "SKU-10008", name: "הובלה ללא פריקה", qty: 1, ordered: 1, unit: "נסיעה", price: 350, weightKg: 0 },
    ],
    gps: {
      arrive: "10:15",
      depart: "10:33",
      status: "ok",
      note: "עצירת טכוגרף 18 דקות מאומתת (10:15-10:33)",
    },
    deposits: {
      bales60002: { delivered: 4, billed: 4 },
      pallets60060: { delivered: 1, billed: 1 },
    },
  },
  {
    id: "6714368",
    customerNo: "612108",
    customer: "לירן/מוצקין",
    site: "מוצקין 22 רעננה",
    date: "2026-08-16",
    yard: "מחסן 4 החרש 10",
    driverId: "hikmat",
    signedAt: "09:12",
    comaxOrder: "6214906",
    scans: [p04.url],
    driveLink: "https://drive.google.com/file/d/1JlOlF7bJ8frdD1JUe5tIyTns9jOGiAgY/view",
    sourceFileName: "scan12026-08-13-082137.pdf",
    sourceFileLink: "https://drive.google.com/file/d/1JlOlF7bJ8frdD1JUe5tIyTns9jOGiAgY/view",
    filingStatus: "✅ פוצל ותוייק בתיק לקוח",
    handwritingNotes: "אישור מאהר נאזל חתימה מלאה",
    returnsAndCredits: "ללא החזרות",
    aiConclusion: "✅ אספקה מאומתת מלאה (תואם 100%)",
    items: [
      { sku: "SKU-10009", name: "מלט אפור 25 ק\"ג", qty: 40, ordered: 40, unit: "שק", price: 22, weightKg: 25 },
      { sku: "SKU-10010", name: "סכין יפני", qty: 4, ordered: 4, unit: "יח׳", price: 15, weightKg: 1 },
      { sku: "SKU-10011", name: "להבים", qty: 1, ordered: 1, unit: "יח׳", price: 20, weightKg: 1 },
      { sku: "SKU-10012", name: "הובלה ללא פריקה", qty: 1, ordered: 1, unit: "נסיעה", price: 350, weightKg: 0 },
    ],
    gps: {
      arrive: "08:48",
      depart: "09:12",
      status: "ok",
      note: "עצירת טכוגרף 22 דקות מאומתת (08:48-09:12)",
    },
    deposits: {
      bales60002: { delivered: 0, billed: 0 },
      pallets60060: { delivered: 0, billed: 0 },
    },
  },
  {
    id: "6714370",
    customerNo: "612090",
    customer: "לירן/יהודה הלוי",
    site: "יהודה הלוי 6 רעננה",
    date: "2026-08-16",
    yard: "מחסן 4 החרש 10",
    driverId: "hikmat",
    signedAt: "09:55",
    comaxOrder: "6214907",
    scans: [p05.url],
    driveLink: "https://drive.google.com/file/d/1JlOlF7bJ8frdD1JUe5tIyTns9jOGiAgY/view",
    sourceFileName: "scan12026-08-13-082137.pdf",
    sourceFileLink: "https://drive.google.com/file/d/1JlOlF7bJ8frdD1JUe5tIyTns9jOGiAgY/view",
    filingStatus: "✅ פוצל ותוייק בתיק לקוח",
    handwritingNotes: "חתימת אתר יהודה הלוי אושר עץ תקין",
    returnsAndCredits: "ללא החזרות",
    aiConclusion: "✅ אספקה מאומתת מלאה (תואם 100%)",
    items: [
      { sku: "SKU-10013", name: "דיקט OSB 8", qty: 4, ordered: 4, unit: "לוח", price: 85, weightKg: 15 },
      { sku: "SKU-10014", name: "עץ גושני ARCH 3X2", qty: 12, ordered: 12, unit: "קורה", price: 65, weightKg: 10 },
      { sku: "SKU-10015", name: "הובלה", qty: 1, ordered: 1, unit: "נסיעה", price: 350, weightKg: 0 },
    ],
    gps: {
      arrive: "09:40",
      depart: "09:55",
      status: "ok",
      note: "עצירת טכוגרף 15 דקות מאומתת",
    },
    deposits: {
      bales60002: { delivered: 0, billed: 0 },
      pallets60060: { delivered: 0, billed: 0 },
    },
  },
  {
    id: "6714375",
    customerNo: "603377",
    customer: "ד.ניב / בי\"ס חינוך מיוחד",
    site: "הבנות 16 הוד השרון",
    date: "2026-08-13",
    yard: "מחסן 1 התלמיד 6",
    driverId: "hikmat",
    signedAt: "11:20",
    comaxOrder: "6214885",
    scans: [p06.url],
    driveLink: "https://drive.google.com/file/d/1ADFtNnC8QuEFEnfqq2kv4VA2qhQHQJAr/view",
    sourceFileName: "scan12026-08-06-123814.pdf",
    sourceFileLink: "https://drive.google.com/file/d/1ADFtNnC8QuEFEnfqq2kv4VA2qhQHQJAr/view",
    filingStatus: "✅ פוצל ותוייק בתיק לקוח",
    handwritingNotes: "אישור אספקה מחסן 1 יואב שגב + חתימת אמיר",
    returnsAndCredits: "ללא החזרות",
    aiConclusion: "✅ אספקה מאומתת מלאה (תואם 100%)",
    items: [
      { sku: "SKU-10016", name: "לוחות גבס ירוק/כחול", qty: 15, ordered: 15, unit: "לוח", price: 42, weightKg: 22 },
      { sku: "SKU-10017", name: "רוקבונד", qty: 1, ordered: 1, unit: "יח׳", price: 90, weightKg: 10 },
      { sku: "SKU-10018", name: "ברגים", qty: 3, ordered: 3, unit: "קרטון", price: 35, weightKg: 5 },
      { sku: "SKU-10019", name: "קלסימו", qty: 5, ordered: 5, unit: "שק", price: 48, weightKg: 20 },
      { sku: "SKU-10020", name: "הובלה", qty: 1, ordered: 1, unit: "נסיעה", price: 350, weightKg: 0 },
    ],
    gps: {
      arrive: "11:06",
      depart: "11:20",
      status: "ok",
      note: "זמן פריקה 14 דקות תואם טכוגרף",
    },
    deposits: {
      bales60002: { delivered: 0, billed: 0 },
      pallets60060: { delivered: 0, billed: 0 },
    },
  },
  {
    id: "6714456",
    customerNo: "607509",
    customer: "טל שחר כאשי",
    site: "חשמונאים 5 פתח תקווה",
    date: "2026-08-12",
    yard: "מחסן 4 החרש 10",
    driverId: "hikmat",
    signedAt: "08:45",
    comaxOrder: "6214798",
    scans: [p07.url],
    driveLink: "https://drive.google.com/file/d/1AYVFrcCXazLulWJBF72EgSL3Iq1c-EFU/view",
    sourceFileName: "scan12026-08-05-084019.pdf",
    sourceFileLink: "https://drive.google.com/file/d/1AYVFrcCXazLulWJBF72EgSL3Iq1c-EFU/view",
    filingStatus: "✅ פוצל ותוייק בתיק לקוח",
    handwritingNotes: "אישור מלקט אליהו משן חתימת אברהם מנצור",
    returnsAndCredits: "ללא החזרות",
    aiConclusion: "✅ אספקה מאומתת מלאה (תואם 100%)",
    items: [
      { sku: "SKU-10021", name: "ניצבים ומסלולים", qty: 18, ordered: 18, unit: "יח׳", price: 28, weightKg: 5 },
      { sku: "SKU-10022", name: "ריצופית 181", qty: 60, ordered: 60, unit: "שק", price: 32, weightKg: 25 },
      { sku: "SKU-10023", name: "מלט", qty: 6, ordered: 6, unit: "שק", price: 22, weightKg: 25 },
      { sku: "SKU-10024", name: "חול", qty: 20, ordered: 20, unit: "שק", price: 15, weightKg: 25 },
      { sku: "SKU-10025", name: "צבע", qty: 8, ordered: 8, unit: "פח", price: 120, weightKg: 18 },
      { sku: "SKU-10026", name: "מנוף", qty: 1, ordered: 1, unit: "הנפה", price: 650, weightKg: 0 },
    ],
    gps: {
      arrive: "08:20",
      depart: "08:45",
      status: "ok",
      note: "זמן פריקת מנוף 25 דקות תואם טכוגרף",
    },
    deposits: {
      bales60002: { delivered: 7, billed: 7 },
      pallets60060: { delivered: 1, billed: 1 },
    },
  },
  {
    id: "6714463",
    customerNo: "603271",
    customer: "א.ערן אזולאי",
    site: "נח 3 תל אביב",
    date: "2026-08-11",
    yard: "מחסן 4 החרש 10",
    driverId: "hikmat",
    signedAt: "09:50",
    comaxOrder: "6214777",
    scans: [p08.url],
    driveLink: "https://drive.google.com/file/d/1x5kM3oXJpqNTepw49_LF6UN4u0Oo8BHw/view",
    sourceFileName: "scan12026-08-04-091911.pdf",
    sourceFileLink: "https://drive.google.com/file/d/1x5kM3oXJpqNTepw49_LF6UN4u0Oo8BHw/view",
    filingStatus: "⚠️ מבוטל / חיוב הובלה בלבד",
    handwritingNotes: "היה תפיסה בכביש אי אפשר לפרוק החזרתי למחסן",
    returnsAndCredits: "הוחזר הכל למחסן 4 החרש",
    aiConclusion: "⚠️ מבוטל / חיוב הובלה בלבד (הנחיית גליה)",
    items: [
      { sku: "SKU-10027", name: "טיח תרמי 400", qty: 48, ordered: 48, unit: "שק", price: 55, weightKg: 25 },
      { sku: "SKU-10028", name: "חול", qty: 3, ordered: 3, unit: "בלה", price: 240, weightKg: 1000 },
      { sku: "SKU-10029", name: "מלט", qty: 80, ordered: 80, unit: "שק", price: 22, weightKg: 25 },
      { sku: "SKU-10030", name: "סיקה", qty: 5, ordered: 5, unit: "פח", price: 180, weightKg: 25 },
      { sku: "SKU-10031", name: "פינות טיח", qty: 30, ordered: 30, unit: "יח׳", price: 12, weightKg: 1 },
      { sku: "SKU-10032", name: "מנוף", qty: 1, ordered: 1, unit: "הנפה", price: 650, weightKg: 0 },
    ],
    gps: {
      arrive: "09:15",
      depart: "09:50",
      status: "warn",
      note: "עצירה 35 דקות ללא פריקה בכביש — הוחזר למחסן",
    },
    deposits: {
      bales60002: { delivered: 3, billed: 0 },
      pallets60060: { delivered: 2, billed: 0 },
    },
  },
  {
    id: "6714464",
    customerNo: "632140",
    customer: "דניאל כהן",
    site: "חופי 22 רמת גן",
    date: "2026-08-10",
    yard: "מחסן 4 החרש 10",
    driverId: "hikmat",
    signedAt: "12:40",
    comaxOrder: "6214787",
    scans: [p09.url],
    driveLink: "https://drive.google.com/file/d/1XsqeEw5Q5JYUwMi-M7q8O4GJZqIZEP5d/view",
    sourceFileName: "scan12026-08-03-071845.pdf",
    sourceFileLink: "https://drive.google.com/file/d/1XsqeEw5Q5JYUwMi-M7q8O4GJZqIZEP5d/view",
    filingStatus: "✅ פוצל ותוייק בתיק לקוח",
    handwritingNotes: "מנוף 9 מטר אישור מלקט שי ראובן חתימת אבי כהן",
    returnsAndCredits: "ללא החזרות",
    aiConclusion: "✅ אספקה מאומתת מלאה (תואם 100%)",
    items: [
      { sku: "SKU-10033", name: "מלט אפור", qty: 20, ordered: 20, unit: "שק", price: 22, weightKg: 25 },
      { sku: "SKU-10034", name: "פורצלן 60/60", qty: 14, ordered: 14, unit: "קרטון", price: 75, weightKg: 25 },
      { sku: "SKU-10035", name: "סומסום", qty: 3, ordered: 3, unit: "בלה", price: 240, weightKg: 1000 },
      { sku: "SKU-10036", name: "טיט", qty: 2, ordered: 2, unit: "בלה", price: 240, weightKg: 1000 },
      { sku: "SKU-10037", name: "יוטה", qty: 11, ordered: 11, unit: "גליל", price: 45, weightKg: 5 },
      { sku: "SKU-10038", name: "מנוף", qty: 1, ordered: 1, unit: "הנפה", price: 650, weightKg: 0 },
    ],
    gps: {
      arrive: "12:21",
      depart: "12:40",
      status: "ok",
      note: "זמן מנוף 19 דקות תואם טכוגרף",
    },
    deposits: {
      bales60002: { delivered: 5, billed: 5 },
      pallets60060: { delivered: 1, billed: 1 },
    },
  },
  {
    id: "6714310",
    customerNo: "519205",
    customer: "וגשל דאו",
    site: "בורוכוב 28 תל אביב",
    date: "2026-07-30",
    yard: "מחסן 4 החרש 10",
    driverId: "hikmat",
    signedAt: "08:15",
    comaxOrder: "6214582",
    scans: [p10.url],
    driveLink: "https://drive.google.com/file/d/18neh4bihOyWPDMf3_SAF3NAhoKGsy42A/view",
    sourceFileName: "scan12026-07-30-070324.pdf",
    sourceFileLink: "https://drive.google.com/file/d/18neh4bihOyWPDMf3_SAF3NAhoKGsy42A/view",
    filingStatus: "✅ פוצל ותוייק בתיק לקוח",
    handwritingNotes: "נמסר באתר בורוכוב תל אביב ללא פריקה",
    returnsAndCredits: "ללא החזרות",
    aiConclusion: "✅ אספקה מאומתת מלאה (תואם 100%)",
    items: [
      { sku: "SKU-10039", name: "בטון מהיר", qty: 16, ordered: 16, unit: "שק", price: 38, weightKg: 25 },
      { sku: "SKU-10040", name: "חול שק", qty: 140, ordered: 140, unit: "שק", price: 15, weightKg: 25 },
      { sku: "SKU-10041", name: "חול שק גדול", qty: 1, ordered: 1, unit: "בלה", price: 240, weightKg: 1000 },
      { sku: "SKU-10042", name: "פלסטומר AD603", qty: 12, ordered: 12, unit: "פח", price: 140, weightKg: 20 },
      { sku: "SKU-10043", name: "הובלה", qty: 1, ordered: 1, unit: "נסיעה", price: 350, weightKg: 0 },
    ],
    gps: {
      arrive: "07:47",
      depart: "08:15",
      status: "ok",
      note: "עצירת פריקה ידנית 28 דקות תואם טכוגרף",
    },
    deposits: {
      bales60002: { delivered: 1, billed: 1 },
      pallets60060: { delivered: 3, billed: 3 },
    },
  },
  {
    id: "6714275",
    customerNo: "632145",
    customer: "נקש את נעמן",
    site: "זוויתן 1 צור יגאל",
    date: "2026-07-26",
    yard: "מחסן 4 החרש 10",
    driverId: "hikmat",
    signedAt: "11:15",
    comaxOrder: "6214508",
    scans: [p11.url, p12.url],
    driveLink: "https://drive.google.com/file/d/1ADFtNnC8QuEFEnfqq2kv4VA2qhQHQJAr/view",
    sourceFileName: "scan12026-07-30-101331.pdf",
    sourceFileLink: "https://drive.google.com/file/d/1ADFtNnC8QuEFEnfqq2kv4VA2qhQHQJAr/view",
    filingStatus: "✅ פוצל ותוייק בתיק לקוח",
    handwritingNotes: "נפרק במנוף בצור יגאל חתימת מנהל אתר יצחק",
    returnsAndCredits: "ללא החזרות",
    aiConclusion: "✅ אספקה מאומתת מלאה (593 יח' תואמות)",
    items: [
      { sku: "SKU-10044", name: "טיט", qty: 2, ordered: 2, unit: "בלה", price: 240, weightKg: 1000 },
      { sku: "SKU-10045", name: "סומסום", qty: 2, ordered: 2, unit: "בלה", price: 240, weightKg: 1000 },
      { sku: "SKU-10046", name: "חול", qty: 2, ordered: 2, unit: "בלה", price: 240, weightKg: 1000 },
      { sku: "SKU-10047", name: "מלט", qty: 30, ordered: 30, unit: "שק", price: 22, weightKg: 25 },
      { sku: "SKU-10048", name: "בלוק 15", qty: 95, ordered: 95, unit: "יח׳", price: 6, weightKg: 18 },
      { sku: "SKU-10049", name: "בלוק 10", qty: 450, ordered: 450, unit: "יח׳", price: 5, weightKg: 15 },
      { sku: "SKU-10050", name: "מנוף", qty: 1, ordered: 1, unit: "הנפה", price: 650, weightKg: 0 },
    ],
    gps: {
      arrive: "10:33",
      depart: "11:15",
      status: "ok",
      note: "זמן פריקת מנוף כפול 42 דקות תואם טכוגרף",
    },
    deposits: {
      bales60002: { delivered: 6, billed: 6 },
      pallets60060: { delivered: 1, billed: 1 },
    },
  },
];

export const noteTotal = (n: DeliveryNote) => n.items.reduce((s, i) => s + i.qty * i.price, 0);
export const noteWeightTons = (n: DeliveryNote) =>
  n.items.reduce((s, i) => s + i.qty * i.weightKg, 0) / 1000;
export const driverOf = (id: string) => DRIVERS.find((d) => d.id === id) || DRIVERS[0];

export function auditNote(n: DeliveryNote): {
  status: AuditStatus;
  findings: { status: AuditStatus; text: string }[];
} {
  const findings: { status: AuditStatus; text: string }[] = [];

  if (n.aiConclusion) {
    const isOk = n.aiConclusion.includes("✅");
    const isWarn = n.aiConclusion.includes("⚠️");
    findings.push({
      status: isOk ? "ok" : isWarn ? "warn" : "fail",
      text: `נועה AI: ${n.aiConclusion}`,
    });
  }

  if (n.handwritingNotes) {
    findings.push({
      status: "ok",
      text: `כתב יד והערת שטח: ${n.handwritingNotes}`,
    });
  }

  if (n.returnsAndCredits && !n.returnsAndCredits.includes("ללא")) {
    findings.push({
      status: "warn",
      text: `זיכוי שטח / החזרות: ${n.returnsAndCredits}`,
    });
  }

  n.items.forEach((i) => {
    if (i.qty !== i.ordered) {
      findings.push({
        status: "warn",
        text: `${i.name}: סופק ${i.qty} מול ${i.ordered} בהזמנת קומקס`,
      });
    }
  });

  const b = n.deposits.bales60002;
  const p = n.deposits.pallets60060;

  if (b.delivered !== b.billed) {
    findings.push({
      status: "fail",
      text: `בלות פקדון 60002: ${b.delivered} סופקו, ${b.billed} חויבו`,
    });
  } else if (b.delivered) {
    findings.push({ status: "ok", text: `בלות 60002 תואמות 1:1 (${b.delivered})` });
  }

  if (p.delivered !== p.billed) {
    findings.push({
      status: "fail",
      text: `משטחי עץ 60060: ${p.delivered} סופקו, ${p.billed} חויבו`,
    });
  } else if (p.delivered) {
    findings.push({ status: "ok", text: `משטחי 60060 תואמים 1:1 (${p.delivered})` });
  }

  if (n.gps) {
    findings.push({ status: n.gps.status, text: `איתוראן: ${n.gps.note}` });
  }

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
  status: "פתוחה" | "בהעמסה" | "בדרך" | "סופק";
  deliveryNoteId?: string;
  items: { name: string; qty: number; unit: string; weightKg: number; deposit?: number }[];
};

export const ORDERS: Order[] = NOTES.map((n, idx) => {
  const isCancelled = n.filingStatus?.includes("מבוטל") || n.gps.status === "warn";
  const status: Order["status"] = isCancelled
    ? "פתוחה"
    : idx < 2
      ? "בדרך"
      : idx < 4
        ? "בהעמסה"
        : "סופק";

  const phoneNumbers = [
    "052-5551234",
    "054-7778899",
    "050-1112233",
    "053-4445566",
    "054-2001928",
    "052-8889911",
    "050-7766554",
    "054-9988776",
    "052-3344556",
    "053-9988112",
  ];

  const windows = [
    "07:00–09:00",
    "08:30–10:30",
    "09:00–11:00",
    "10:00–12:00",
    "11:30–13:30",
    "12:00–14:00",
    "13:00–15:00",
    "14:30–16:30",
  ];

  return {
    id: n.comaxOrder,
    customer: n.customer,
    phone: phoneNumbers[idx % phoneNumbers.length],
    address: n.site,
    date: n.date,
    window: windows[idx % windows.length],
    yard: n.yard,
    driverId: n.driverId,
    status,
    deliveryNoteId: n.id,
    items: n.items.map((it) => ({
      name: it.name,
      qty: it.qty,
      unit: it.unit,
      weightKg: it.weightKg,
      deposit: it.name.includes("בלה") ? 45 : it.name.includes("משטח") ? 60 : undefined,
    })),
  };
});

export const ils = (n: number) => "₪" + n.toLocaleString("he-IL", { maximumFractionDigits: 0 });
export const fmtDate = (d: string) => d.split("-").reverse().join("/");
