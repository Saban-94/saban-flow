export const BASE: DeliveryNote[] = [
  {
    id: "6714850",
    customer: "זבולון-עדירן / וייס",
    date: "13/10/2026",
    items: [
      { name: "חול מחצבה (בלה)", qty: 3, ordered: 3, price: 180, weightKg: 1000, unit: "בלה", deposit: 45 },
      { name: "לוחות דנסגלאס 12.5", qty: 25, ordered: 25, price: 95, weightKg: 30, unit: "לוח" },
      { name: "פרופיל 70 סבן", qty: 60, ordered: 60, price: 18, weightKg: 1.5, unit: "יח׳" },
    ],
    deposits: {
      bales60002: { delivered: 3, billed: 3 },
      pallets60060: { delivered: 0, billed: 0 },
    },
    gps: { status: "ok", note: "26 דק׳ מנוף — אומת באיתוראן (08:28–08:58)" },
  },
  {
    id: "6714848",
    customer: "כלו עבודות עפר בע״מ",
    date: "13/10/2026",
    items: [
      { name: "חול מחצבה (בלה)", qty: 2, ordered: 2, price: 180, weightKg: 1000, unit: "בלה", deposit: 45 },
      { name: "סומסום שק גדול (בלה)", qty: 2, ordered: 2, price: 190, weightKg: 1000, unit: "בלה", deposit: 45 },
      { name: "מלט 50 ק״ג נשר", qty: 8, ordered: 8, price: 32, weightKg: 50, unit: "שק" },
    ],
    deposits: {
      bales60002: { delivered: 4, billed: 4 },
      pallets60060: { delivered: 1, billed: 1 },
    },
    gps: { status: "ok", note: "24 דק׳ מנוף — אומת באיתוראן (09:38–10:06)" },
  },
  {
    id: "6714845",
    customer: "א.ערן אזולאי",
    date: "13/10/2026",
    items: [
      { name: "טיט ריצופית סבן", qty: 240, ordered: 240, price: 28, weightKg: 25, unit: "שק" },
      { name: "דבק פורצלן מקצועי", qty: 175, ordered: 175, price: 38, weightKg: 25, unit: "שק" },
    ],
    deposits: {
      bales60002: { delivered: 0, billed: 0 },
      pallets60060: { delivered: 1, billed: 1 },
    },
    gps: { status: "ok", note: "32 דק׳ מנוף — אומת באיתוראן (11:10–11:50)" },
  },
  {
    id: "6714840",
    customer: "פלמר מערכות בנין בע״מ",
    date: "14/10/2026",
    items: [
      { name: "חול מחצבה (בלה)", qty: 4, ordered: 4, price: 180, weightKg: 1000, unit: "בלה", deposit: 45 },
      { name: "סומסום נקי (בלה)", qty: 4, ordered: 4, price: 190, weightKg: 1000, unit: "בלה", deposit: 45 },
    ],
    deposits: {
      bales60002: { delivered: 8, billed: 8 },
      pallets60060: { delivered: 0, billed: 0 },
    },
    gps: { status: "ok", note: "35 דק׳ מנוף — אומת באיתוראן" },
  },
];
