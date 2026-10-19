import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  auditNote,
  ils,
  noteTotal,
  driverOf,
  fmtDate,
  SPREADSHEET_URL,
  SPREADSHEET_ID,
  TAB_GALYA_ARCHIVE,
} from "@/lib/data";
import { approvals, useApprovals } from "@/lib/store";
import { PageHeader, StatusPill } from "@/components/AppShell";
import {
  ExternalLink,
  Layers,
  FolderArchive,
  CheckCircle2,
  FileCheck,
  Building2,
  Truck,
  RotateCcw,
  Package,
} from "lucide-react";
import deliveryNoteFallback from "@/assets/delivery-note.jpg";

import { fetchLiveDeliveriesAndOrders, getSheetDataSnapshot } from "@/lib/sheet-data";

export const Route = createFileRoute("/notes/$id")({
  loader: async ({ params }) => {
    const snapshot = getSheetDataSnapshot();
    let n = snapshot.notes.find((x) => x.id === params.id || x.comaxOrder === params.id);

    if (!n) {
      try {
        const { notes } = await fetchLiveDeliveriesAndOrders();
        n = notes.find((x) => x.id === params.id || x.comaxOrder === params.id);
      } catch (err) {
        console.warn("Could not fetch note from sheet:", err);
      }
    }

    if (!n) {
      n = {
        id: params.id,
        customerNo: "---",
        customer: `תעודת משלוח ${params.id}`,
        site: "אתר פריקה (הוזן מסריקת גליה)",
        date: new Date().toISOString().split("T")[0]!,
        yard: "מחסן 4 החרש 10",
        driverId: "hikmat",
        signedAt: "08:30",
        comaxOrder: params.id,
        scans: [deliveryNoteFallback],
        items: [],
        gps: {
          arrive: "--:--",
          depart: "--:--",
          status: "ok",
          note: "תעודה סרוקה מגיליון",
        },
        deposits: {
          bales60002: { delivered: 0, billed: 0 },
          pallets60060: { delivered: 0, billed: 0 },
        },
      };
    }
    return n;
  },
  head: ({ params }) => ({
    meta: [
      { title: `תעודה ${params.id} — נועה ח. סבן` },
      { name: "description", content: "תצוגת תעודת משלוח עם שכבות בקרה וחותמות." },
      { property: "og:title", content: `תעודה ${params.id}` },
      { property: "og:description", content: "בקרת נועה AI, חותמת ראמי וחותמת מנכ״ל." },
    ],
  }),
  component: Viewer,
});

function Viewer() {
  const n = Route.useLoaderData();
  const ap = useApprovals()[n.id];
  const a = auditNote(n);
  const driver = driverOf(n.driverId);

  const customerFolder = `סבן / תיקיות לקוחות / ${n.customerNo} ${n.customer} / תעודות משלוח 2026/`;

  return (
    <>
      <PageHeader
        title={`ת.מ. ${n.id}`}
        subtitle={`${n.customer} (${n.customerNo}) · הזמנה: ${n.comaxOrder}`}
        action={
          <div className="flex items-center gap-2">
            <StatusPill s={a.status} />
            {n.driveLink && (
              <a
                href={n.driveLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-2xl border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                סריקה ב-Drive
              </a>
            )}
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 rounded-2xl border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted"
            >
              <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
              טאב: {TAB_GALYA_ARCHIVE}
            </a>
          </div>
        }
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[1fr_360px] md:px-8">
        {/* Main Canvas: Scanned Document with 4-Layer Overlay */}
        <div className="space-y-4">
          {/* Drive file embed or scan preview */}
          {n.driveLink ? (
            <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <span>קובץ סריקה מפוצל מ-Drive ({n.sourceFileName || "סריקת גליה"})</span>
                </div>
                <a
                  href={n.driveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> פתח בחלון מלא
                </a>
              </div>
              <div className="relative aspect-[3/4] w-full bg-muted/10">
                <iframe
                  src={n.driveLink.replace("/view", "/preview")}
                  title={`סריקת תעודה ${n.id}`}
                  className="h-full w-full border-0"
                />

                {/* Layer 3: Rami Review Stamp */}
                {ap?.rami && (
                  <div className="stamp absolute bottom-16 left-6 bg-card/85 text-xs text-rami shadow-lg">
                    ח. סבן — נבדק ואושר ע״י ראמי מסארווה ✍️
                    <br />
                    {ap.rami.at}
                  </div>
                )}

                {/* Layer 4: Harel CEO Final Sign-Off Stamp */}
                {ap?.harel && (
                  <div className="stamp absolute bottom-36 right-6 bg-card/90 text-xs text-ceo shadow-xl font-bold">
                    ח. סבן (1994) בע״מ — אושר סופית לחיוב 👑
                    <br />
                    הראל אידלסון · {ap.harel.at}
                  </div>
                )}
              </div>
            </div>
          ) : (
            (n.scans ?? [deliveryNoteFallback]).map((src, i) => (
              <div
                key={src}
                className="relative overflow-hidden rounded-3xl border bg-card shadow-card transition"
              >
                {/* Layer 1: Background Scan */}
                <img src={src} alt={`סריקת תעודה ${i + 1}`} className="w-full object-contain" />

                {/* Layer 3: Rami Review Stamp */}
                {i === 0 && ap?.rami && (
                  <div className="stamp absolute bottom-16 left-6 bg-card/80 text-sm text-rami shadow-lg">
                    ח. סבן — נבדק ואושר ע״י ראמי מסארווה ✍️
                    <br />
                    {ap.rami.at}
                  </div>
                )}

                {/* Layer 4: Harel CEO Final Sign-Off Stamp */}
                {i === 0 && ap?.harel && (
                  <div className="stamp absolute bottom-40 right-6 bg-card/85 text-sm text-ceo shadow-xl font-bold">
                    ח. סבן (1994) בע״מ — אושר סופית לחיוב 👑
                    <br />
                    הראל אידלסון · {ap.harel.at}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Items breakdown card */}
          <div className="rounded-3xl border bg-card p-5 shadow-card space-y-3">
            <h3 className="font-display font-bold text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              פירוט פריטי תעודה והזמנה #{n.comaxOrder} (מגיליון)
            </h3>
            <div className="divide-y text-xs">
              {n.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{it.sku}</span>
                    <span className="font-semibold text-foreground">{it.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">
                      {it.qty} {it.unit}
                    </span>
                    <span className="text-muted-foreground">{ils(it.qty * it.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aside: Metadata, AI Audit & Sign-off Controls */}
        <aside className="space-y-4">
          {/* Layer 2: Noa AI Due Diligence Audit Box */}
          <div className="rounded-3xl border bg-card p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-display font-bold text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                שכבה 2: בקרת נועה AI
              </h2>
              <span className="text-xs font-semibold text-muted-foreground">הצלבת 1:1</span>
            </div>

            <ul className="space-y-2 text-xs">
              {a.findings.map((f, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2 rounded-xl p-2.5 ${
                    f.status === "ok"
                      ? "bg-emerald-500/10 text-emerald-900 dark:text-emerald-300"
                      : f.status === "warn"
                        ? "bg-amber-500/10 text-amber-900 dark:text-amber-300"
                        : "bg-red-500/10 text-red-900 dark:text-red-300"
                  }`}
                >
                  <span className="shrink-0">
                    {f.status === "ok" ? "🟢" : f.status === "warn" ? "⚠️" : "🔴"}
                  </span>
                  <span className="leading-snug">{f.text}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl bg-muted/40 p-3 pt-2">
              <div className="text-xs text-muted-foreground">סה״כ לתשלום לחיוב:</div>
              <div className="font-display text-3xl font-extrabold text-primary">
                {ils(noteTotal(n))}
              </div>
            </div>
          </div>

          {/* Drive & Filing Location */}
          <div className="rounded-3xl border bg-card p-4 shadow-card text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <FolderArchive className="h-4 w-4 text-emerald-600" />
              <span>תיוק אוטומטי ב-Google Drive:</span>
            </div>
            <div className="rounded-xl bg-muted/40 p-2.5 font-mono text-[11px] text-muted-foreground break-all">
              {customerFolder}תמ_{n.id}_הזמנה_{n.comaxOrder}.pdf
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-muted-foreground">סטטוס בגיליון (עמודה L):</span>
              <span className="font-bold text-emerald-700">
                {ap?.harel
                  ? "👑 אושר סופית לחיוב (הראל)"
                  : ap?.rami
                    ? "✍️ נבדק ואושר ע״י ראמי"
                    : n.filingStatus || "✅ פוצל ותוייק בתיק לקוח"}
              </span>
            </div>
          </div>

          {/* Logistics & Driver Details */}
          <div className="rounded-3xl border bg-card p-4 shadow-card text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-primary" /> נהג ומשאית:
              </span>
              <span className="font-bold">
                {driver.name} ({driver.plate})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" /> מחסן יוצא:
              </span>
              <span className="font-bold">{n.yard}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">שעת חתימה בשטח:</span>
              <span className="font-bold">{n.signedAt}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">כתובת אספקה:</span>
              <span className="font-bold truncate max-w-[180px]">{n.site}</span>
            </div>
          </div>

          {/* Action Sign-Off Buttons */}
          <div className="space-y-2 pt-1">
            {!ap?.rami && (
              <button
                onClick={() => {
                  approvals.rami(n.id);
                  toast.success("תעודת המשלוח נבדקה ונחתמה ע״י ראמי ✍️");
                }}
                className="w-full rounded-2xl bg-rami py-3.5 font-display text-base font-bold text-rami-foreground shadow-md transition hover:opacity-90"
              >
                חתימת ראמי ✍️ (שכבה 3)
              </button>
            )}

            {ap?.rami && !ap?.harel && (
              <button
                onClick={() => {
                  approvals.harel(n.id);
                  toast.success("אושר סופית לחיוב ע״י מנכ״ל הראל 👑");
                }}
                className="w-full rounded-2xl bg-ceo py-3.5 font-display text-base font-bold text-ceo-foreground shadow-md transition hover:opacity-90"
              >
                אישור מנכ״ל 👑 (שכבה 4)
              </button>
            )}

            {ap && (
              <button
                onClick={() => {
                  approvals.reset(n.id);
                  toast.info("חתימות התעודה אופסו");
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl border py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" /> איפוס חתימות
              </button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
