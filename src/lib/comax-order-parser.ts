import { z } from "zod";

export const ComaxOrderItemSchema = z.object({
  lineIndex: z.number().int().positive(),
  sku: z.string().regex(/^\d+$/),
  name: z.string().min(1),
  unit: z.enum(["שק", "בלה / שק גד", "משטח", "יח'", "דלי", "אחר"]),
  quantity: z.number(),
  unitWeightKg: z.number().nonnegative(),
  totalWeightKg: z.number().nonnegative(),
  isDeposit: z.boolean(),
});

export type ComaxOrderItem = z.infer<typeof ComaxOrderItemSchema>;

export const ComaxOrderSummary = z.object({
  totalWeightKg: z.number(),
  itemCount: z.number().int(),
  depositWarnings: z.array(z.string()),
});

export const ComaxOrderSchema = z.object({
  orderNumber: z.string().regex(/^\d+$/),
  orderDateTime: z.string(),
  copyNumber: z.string().optional(),
  companyVatId: z.literal("512001678"),
  customerName: z.string(),
  customerId: z.string().regex(/^\d+$/),
  deliveryAddress: z.string(),
  city: z.string(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  warehouse: z.string().optional(),
  agent: z.string().optional(),
  items: z.array(ComaxOrderItemSchema),
  summary: ComaxOrderSummary,
});

export type ComaxOrder = z.infer<typeof ComaxOrderSchema>;

const WEIGHTS: Record<string, number> = {
  "10002": 25,
  "11501": 1000,
  "11511": 1000,
  "11540": 1000,
  "11551": 1000,
  "11570": 1000,
  "60002": 2,
  "60060": 20,
  "60006": 20,
};

const DEPOSITS = new Set(["60002", "60060", "60006"]);
const BIG_BAG_SKUS = new Set(["11501", "11511", "11540", "11551", "11570"]);

export function calculateDepositRequirements(
  items: Pick<ComaxOrderItem, "sku" | "quantity">[]
) {
  const bigBags = items
    .filter((i) => BIG_BAG_SKUS.has(i.sku))
    .reduce((sum, i) => sum + i.quantity, 0);
  const sackCount = items
    .filter(
      (i) =>
        i.sku === "10002" ||
        (!DEPOSITS.has(i.sku) && i.sku !== "60006" && i.quantity > 0)
    )
    .reduce((sum, i) => sum + i.quantity, 0);
  const blockCount = items
    .filter((i) => i.sku.startsWith("18") && !DEPOSITS.has(i.sku))
    .reduce((sum, i) => sum + i.quantity, 0);

  return {
    bales60002: bigBags,
    pallets60060: Math.ceil(sackCount / 40),
    pallets60006: Math.ceil(blockCount / 75),
  };
}

export function validateDeposits(
  items: Pick<ComaxOrderItem, "sku" | "quantity">[]
) {
  const expected = calculateDepositRequirements(items);
  const actual = {
    bales60002: items
      .filter((i) => i.sku === "60002")
      .reduce((s, i) => s + i.quantity, 0),
    pallets60060: items
      .filter((i) => i.sku === "60060")
      .reduce((s, i) => s + i.quantity, 0),
    pallets60006: items
      .filter((i) => i.sku === "60006")
      .reduce((s, i) => s + i.quantity, 0),
  };

  const warnings: string[] = [];
  if (actual.bales60002 !== expected.bales60002)
    warnings.push(
      `פקדון 60002: צפוי ${expected.bales60002}, נמצא ${actual.bales60002}`
    );
  if (actual.pallets60060 !== expected.pallets60060)
    warnings.push(
      `פקדון 60060: צפוי ${expected.pallets60060}, נמצא ${actual.pallets60060}`
    );
  if (actual.pallets60006 !== expected.pallets60006)
    warnings.push(
      `פקדון 60006: צפוי ${expected.pallets60006}, נמצא ${actual.pallets60006}`
    );

  return { expected, actual, warnings };
}

function field(text: string, labels: string[]) {
  const match = text.match(
    new RegExp(`(?:${labels.join("|")})[\\s:：-]*([^\\n|]+)`, "i")
  );
  return match?.[1]?.trim();
}

function numberAfter(text: string, labels: string[]) {
  return field(text, labels)?.match(/\d+/)?.[0];
}

export function parseComaxOrderText(text: string): ComaxOrder {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const orderNumber =
    numberAfter(text, ["מספר הזמנה", "הזמנה"]) ?? "0";
  const customer =
    field(text, ["לקוח", "שם לקוח"]) ?? "לקוח לא מזוהה";
  const customerId =
    customer.match(/\((\d+)\)/)?.[1] ??
    numberAfter(text, ["מספר לקוח", "לקוח מס'"]) ??
    "0";
  const customerName = customer.replace(/\s*\(\d+\)/, "").trim();

  const rawItems = lines
    .map((line, index) => {
      const match = line.match(
        /^(\d+)\s+(\d{4,})\s+(.+?)\s+(\d+(?:\.\d+)?)\s*(שק|בלה|משטח|יח['׳]?|דלי)?$/
      );
      if (!match) return null;

      const [, lineIndex, sku, name, qty, unit = "אחר"] = match;
      const quantity = Number(qty);
      const unitWeightKg = WEIGHTS[sku] ?? 0;

      return {
        lineIndex: Number(lineIndex) || index + 1,
        sku,
        name: name.trim(),
        unit: (
          unit === "בלה" ? "בלה / שק גד" : unit.replace("׳", "'")
        ) as ComaxOrderItem["unit"],
        quantity,
        unitWeightKg,
        totalWeightKg: quantity * unitWeightKg,
        isDeposit: DEPOSITS.has(sku) || /פקדון|בלה/i.test(name),
      };
    })
    .filter((item): item is ComaxOrderItem => Boolean(item));

  const deposit = validateDeposits(rawItems);

  return ComaxOrderSchema.parse({
    orderNumber,
    orderDateTime: field(text, ["תאריך ושעה", "תאריך"]) ?? "",
    copyNumber: field(text, ["מספר העתק", "העתק"]),
    companyVatId: "512001678",
    customerName,
    customerId,
    deliveryAddress:
      field(text, ["כתובת אספקה", "כתובת משלוח"]) ??
      field(text, ["כתובת"]) ??
      "",
    city: field(text, ["עיר", "יישוב"]) ?? "",
    contactName: field(text, ["איש קשר"]),
    contactPhone: field(text, ["טלפון"]),
    warehouse: field(text, ["מחסן"]),
    agent: field(text, ["סוכן"]),
    items: rawItems,
    summary: {
      totalWeightKg: rawItems.reduce((s, i) => s + i.totalWeightKg, 0),
      itemCount: rawItems.length,
      depositWarnings: deposit.warnings,
    },
  });
}

export async function parseComaxOrderPdf(
  input: Uint8Array | ArrayBuffer
): Promise<ComaxOrder> {
  const { extractText } = await import("unpdf");
  const { text } = await extractText(new Uint8Array(input), {
    mergePages: true,
  });
  return parseComaxOrderText(
    Array.isArray(text) ? text.join("\n") : text
  );
}

export { WEIGHTS };
export default parseComaxOrderPdf;
