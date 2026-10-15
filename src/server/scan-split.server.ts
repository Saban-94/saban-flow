import { createHash, timingSafeEqual } from "node:crypto";
import { PDFDocument } from "pdf-lib";

/* ---------- Types ---------- */

export type SplitNote = {
  pages: number[]; // 1-based pages of the source scan
  noteId: string;
  orderId: string;
  deliveryDate: string; // DD/MM/YYYY
  customerNo: string;
  customerName: string;
  siteAddress: string;
  yard: string;
  driver: string;
  itemsSummary: string;
  bales60002: number;
  pallets60060: number;
  craneTime: string;
  signedBy: string;
  fileName: string;
  pdfBase64: string;
};

export type SplitResult = {
  totalPages: number;
  notes: SplitNote[];
  warnings: string[];
};

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/* ---------- Auth ---------- */

export function assertAuthorized(request: Request): void {
  const expected = process.env.SPLIT_API_KEY;
  if (!expected) throw new HttpError(500, "SPLIT_API_KEY is not configured");
  const given = request.headers.get("x-saban-key") ?? "";
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(a, b)) throw new HttpError(401, "unauthorized");
}

/* ---------- Helpers ---------- */

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Returns DD/MM/YYYY or "" when the date cannot be parsed. */
export function normalizeDate(raw: string): string {
  const m = raw.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (!m) return "";
  const dd = m[1].padStart(2, "0");
  const mm = m[2].padStart(2, "0");
  const yyyy = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${dd}/${mm}/${yyyy}`;
}

export function safeName(s: string): string {
  return s
    .replace(/[\\/:*?"<>|\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function buildFileName(noteId: string, customerName: string, date: string): string {
  const datePart = date ? date.replace(/\//g, "-") : "ללא-תאריך";
  return `ת.מ_${noteId}_${safeName(customerName) || "ללא-לקוח"}_${datePart}.pdf`;
}

/* ---------- Gemini OCR ---------- */

const NOTE_PROPERTIES = {
  pages: { type: "ARRAY", items: { type: "INTEGER" } },
  noteId: { type: "STRING" },
  orderId: { type: "STRING" },
  deliveryDate: { type: "STRING" },
  customerNo: { type: "STRING" },
  customerName: { type: "STRING" },
  siteAddress: { type: "STRING" },
  yard: { type: "STRING" },
  driver: { type: "STRING" },
  itemsSummary: { type: "STRING" },
  bales60002: { type: "INTEGER" },
  pallets60060: { type: "INTEGER" },
  craneTime: { type: "STRING" },
  signedBy: { type: "STRING" },
};

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    notes: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: NOTE_PROPERTIES,
        required: ["pages", "noteId", "customerNo", "customerName"],
      },
    },
  },
  required: ["notes"],
};

function buildPrompt(totalPages: number): string {
  return [
    `המסמך המצורף הוא סריקה מרוכזת של תעודות משלוח של ח. סבן חומרי בניין. יש בו ${totalPages} עמודים, ממוספרים מ-1.`,
    "עמוד 1 הוא מניפסט: רשימת תעודות המשלוח, מספרי לקוח ושמות הלקוחות.",
    `עמודים 2 עד ${totalPages - 1} הם תעודות המשלוח עצמן. תעודה יכולה להימשך על יותר מעמוד אחד.`,
    "העמוד האחרון אינו תעודת משלוח.",
    "החזר JSON בלבד לפי הסכמה, אובייקט אחד לכל תעודת משלוח, עם רשימת העמודים (pages) שלה.",
    "חוקים:",
    "- deliveryDate בפורמט DD/MM/YYYY.",
    "- bales60002 = מספר בלות פקדון (פריט 60002). pallets60060 = מספר משטחי עץ (פריט 60060). אם לא מופיע: 0.",
    "- yard: \"4 (החרש)\" או \"1 (התלמיד)\" לפי המחסן בתעודה.",
    "- craneTime: משך הנפת מנוף כפי שכתוב, למשל \"26 דק׳ מנוף\". אם אין: \"\".",
    "- signedBy: שם החותם בתעודה. אם אין חתימה: \"\".",
    "- אל תמציא נתונים. שדה שלא קריא או לא קיים: \"\" או 0.",
  ].join("\n");
}

type RawNote = Record<string, unknown>;

async function extractManifest(pdfBase64: string, totalPages: number): Promise<RawNote[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new HttpError(500, "GEMINI_API_KEY is not configured");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(55_000),
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { inline_data: { mime_type: "application/pdf", data: pdfBase64 } },
              { text: buildPrompt(totalPages) },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    },
  );

  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 400);
    console.error(`Gemini ${res.status} (model ${model}): ${detail}`);
    throw new HttpError(502, `Gemini request failed with status ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new HttpError(502, "Gemini returned an empty response");

  try {
    const parsed = JSON.parse(text) as { notes?: RawNote[] };
    return Array.isArray(parsed.notes) ? parsed.notes : [];
  } catch {
    throw new HttpError(502, "Gemini returned invalid JSON");
  }
}

/* ---------- Main ---------- */

export async function splitScan(pdfBase64: string): Promise<SplitResult> {
  const bytes = Buffer.from(pdfBase64, "base64");
  if (bytes.length < 5 || bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw new HttpError(400, "payload is not a PDF");
  }

  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = src.getPageCount();
  if (totalPages < 3) {
    throw new HttpError(422, "scan has fewer than 3 pages (manifest, notes, last page)");
  }

  const rawNotes = await extractManifest(pdfBase64, totalPages);

  const warnings: string[] = [];
  const claimed = new Set<number>();
  const seenIds = new Set<string>();
  const notes: SplitNote[] = [];

  for (const raw of rawNotes) {
    const noteId = str(raw.noteId);
    const pages = Array.from(
      new Set(
        (Array.isArray(raw.pages) ? raw.pages : [])
          .map((p) => Math.trunc(Number(p)))
          .filter((p) => Number.isInteger(p) && p >= 2 && p <= totalPages - 1),
      ),
    ).sort((a, b) => a - b);

    if (!noteId) {
      warnings.push(`תעודה ללא מספר (עמודים: ${pages.join(",") || "לא ידוע"}) - דולגה`);
      continue;
    }
    if (seenIds.has(noteId)) {
      warnings.push(`תעודה ${noteId} הופיעה פעמיים - הכפילות דולגה`);
      continue;
    }
    if (pages.length === 0) {
      warnings.push(`תעודה ${noteId}: אין עמודים תקינים - דולגה`);
      continue;
    }
    if (pages.some((p) => claimed.has(p))) {
      warnings.push(`תעודה ${noteId}: חפיפת עמודים עם תעודה אחרת - דולגה`);
      continue;
    }

    const customerNo = str(raw.customerNo);
    const customerName = str(raw.customerName);
    const deliveryRaw = str(raw.deliveryDate);
    const deliveryDate = normalizeDate(deliveryRaw);
    if (!deliveryDate) warnings.push(`תעודה ${noteId}: תאריך לא תקין ("${deliveryRaw}")`);
    if (!/^\d{3,10}$/.test(customerNo)) {
      warnings.push(`תעודה ${noteId}: מספר לקוח לא תקין ("${customerNo}")`);
    }

    const out = await PDFDocument.create();
    const copied = await out.copyPages(
      src,
      pages.map((p) => p - 1),
    );
    copied.forEach((page) => out.addPage(page));

    pages.forEach((p) => claimed.add(p));
    seenIds.add(noteId);

    notes.push({
      pages,
      noteId,
      orderId: str(raw.orderId),
      deliveryDate,
      customerNo,
      customerName,
      siteAddress: str(raw.siteAddress),
      yard: str(raw.yard),
      driver: str(raw.driver),
      itemsSummary: str(raw.itemsSummary),
      bales60002: num(raw.bales60002),
      pallets60060: num(raw.pallets60060),
      craneTime: str(raw.craneTime),
      signedBy: str(raw.signedBy),
      fileName: buildFileName(noteId, customerName, deliveryDate),
      pdfBase64: await out.saveAsBase64(),
    });
  }

  const missing: number[] = [];
  for (let p = 2; p <= totalPages - 1; p++) if (!claimed.has(p)) missing.push(p);
  if (missing.length > 0) {
    warnings.push(`עמודים שלא שויכו לאף תעודה: ${missing.join(",")}`);
  }

  return { totalPages, notes, warnings };
}
