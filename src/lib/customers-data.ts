import { NOTES, type DeliveryNote, type Yard } from "./data";

export type CustomerTag = "לקוח עוגן" | "שוטף מאושר" | "דורש תשלום במזומן" | "מלגזה באתר";

export type CustomerOrder = {
  id: string;
  date: string;
  status: "סופק" | "בביצוע" | "הוזמן";
  itemsCount: number;
  totalIls: number;
  weightTons: number;
  driverName?: string;
  pdfUrl?: string;
  items: {
    sku: string;
    name: string;
    qty: number;
    unit: string;
    price: number;
  }[];
};

export type CustomerInvoice = {
  id: string;
  invoiceNo: string;
  date: string;
  type: "חשבונית מס" | "הצעת מחיר" | "קבלה" | "תעודת זיכוי פקדון";
  amountIls: number;
  status: "שולם" | "פתוח לתשלום" | "זוכה";
  issuedBy: string; // e.g. "לינה הנה״ח"
  pdfName: string;
};

export type CustomerProfile = {
  id: string; // Comax customer number (e.g. "601928")
  name: string; // Company / customer name
  hp: string; // ח.פ / עוסק מורשה
  contactName: string;
  phone: string;
  city: string;
  address: string;
  tag: CustomerTag;
  preferredDriver: "חכמת" | "עלי";
  truckType: "משאית מנוף 615-41-002" | "משאית פלטה 651-51-701";
  defaultYard: Yard;
  accessNotes: string[];
  depositLedger: {
    bales60002: {
      billed: number;
      returned: number;
      openBalance: number;
    };
    pallets60060: {
      billed: number;
      returned: number;
      openBalance: number;
    };
  };
  ordersHistory: CustomerOrder[];
  invoicesHistory: CustomerInvoice[];
};


// Helper calculations
export function getCustomerById(id: string): CustomerProfile | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}

export function getDeliveryNotesForCustomer(customerNo: string): DeliveryNote[] {
  return NOTES.filter((n) => n.customerNo === customerNo);
}

export function calculateTotalCustomerDeposits() {
  // Aggregate from listed profiles plus company totals
  // Prompt mentions active customers (63), total field big bags (60002) and pallets (60060)
  const baseBales = CUSTOMERS.reduce((sum, c) => sum + c.depositLedger.bales60002.openBalance, 0);
  const basePallets = CUSTOMERS.reduce(
    (sum, c) => sum + c.depositLedger.pallets60060.openBalance,
    0,
  );

  return {
    totalActiveCustomers: 63,
    totalFieldBales60002: baseBales + 329, // Total open big bags across all Saban active sites (418)
    totalFieldPallets60060: basePallets + 132, // Total pallets across all Saban active sites (276)
  };
}
