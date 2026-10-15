import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatusPill } from "@/components/AppShell";
import { NOTES, DRIVERS, fetchNotes, fetchGps, type DeliveryNote } from "@/lib/data";
import { crossMatch, rowsToStops, SAMPLE_STOPS, type GpsStop } from "@/lib/ituran";
import {
  Satellite,
  Truck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/ituran")({
  head: () => ({
    meta: [
      { title: "איתוראן GPS — נועה ח. סבן" },
      {
        name: "description",
        content:
          "מנוע הצלבת טלמטריה איתוראן GPS מול תעודות משלוח, בדיקת זמני שהייה וגדרות גיאוגרפיות.",
      },
      { property: "og:title", content: "איתוראן GPS — ח. סבן" },
      { property: "og:description", content: "בקרת ציי רכב וטלמטריה." },
    ],
  }),
  component: IturanGpsPage,
});

function IturanGpsPage() {
  const [activeDriver, setActiveDriver] = useState<string>("all");
  const [customStops, setCustomStops] = useState<GpsStop[] | null>(null);

  const {
    data: notes = NOTES,
    isFetching: isNotesFetching,
    refetch: refetchNotes,
  } = useQuery<DeliveryNote[]>({
    queryKey: ["delivery-notes"],
    queryFn: fetchNotes,
    initialData: NOTES,
  });

  const {
    data: gpsStops = SAMPLE_STOPS,
    isFetching: isGpsFetching,
    refetch: refetchGps,
  } = useQuery<GpsStop[]>({
    queryKey: ["gps-stops"],
    queryFn: fetchGps,
    initialData: SAMPLE_STOPS,
  });

  const activeStops = customStops || gpsStops;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0] || ""];
        if (sheet) {
          const json = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
          const parsed = rowsToStops(json);
          if (parsed.length > 0) {
            setCustomStops(parsed);
            toast.success(`נטענו ${parsed.length} נקודות עצירה מקובץ אקסל איתוראן 🛰️`);
            return;
          }
        }
        toast.error("לא אותרו נתוני איתוראן תקניים בקובץ");
      } catch (err) {
        toast.error("שגיאה בפענוח קובץ האקסל");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRefresh = async () => {
    await Promise.all([refetchNotes(), refetchGps()]);
    toast.success("נתוני איתוראן וקומקס סונכרנו מ-Google Sheets 🛰️");
  };

  const filteredNotes = notes.filter((n) => {
    if (activeDriver === "all") return true;
    return n.driverId === activeDriver;
  });

  return (
    <>
      <PageHeader
        title="הצלבת איתוראן GPS וטלמטריה"
        subtitle="סנכרון מול גיליון 🛰️_הצלבת_איתוראן_GPS ואימות זמני פריקה באתר"
        action={
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted transition">
              <Upload className="h-3.5 w-3.5 text-primary" />
              <span>העלה קובץ איתוראן (.xlsx)</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleRefresh}
              disabled={isNotesFetching || isGpsFetching}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-primary ${isNotesFetching || isGpsFetching ? "animate-spin" : ""}`}
              />
              <span>סנכרן ענן</span>
            </button>
          </div>
        }
      />

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 md:px-8">
        {/* Vehicles / Drivers Filter Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div
            onClick={() => setActiveDriver("all")}
            className={`cursor-pointer rounded-2xl p-4 transition border ${
              activeDriver === "all"
                ? "bg-card border-primary shadow-sm ring-1 ring-primary"
                : "bg-card/70 border-border/70 hover:bg-card"
            }`}
          >
            <div className="text-xs font-semibold text-muted-foreground">כל הצי הפעיל</div>
            <div className="font-display text-xl font-bold mt-1">2 משאיות בחלוקה</div>
            <div className="text-[11px] text-emerald-600 font-medium">חכמת (מנוף) + עלי (פלטה)</div>
          </div>

          {DRIVERS.map((d) => (
            <div
              key={d.id}
              onClick={() => setActiveDriver(d.id)}
              className={`cursor-pointer rounded-2xl p-4 transition border ${
                activeDriver === d.id
                  ? "bg-card border-primary shadow-sm ring-1 ring-primary"
                  : "bg-card/70 border-border/70 hover:bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{d.truck}</span>
                <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded-md">
                  {d.plate}
                </span>
              </div>
              <div className="font-display text-xl font-bold mt-1">{d.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {d.kind === "crane" ? "שהיית מנוף: 25-45 דק׳" : "שהיית פלטה: 15-25 דק׳"}
              </div>
            </div>
          ))}
        </div>

        {/* Cross-Match Results List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>תוצאות הצלבת תעודות משלוח מול אירועי עמידה באיתוראן:</span>
            <span>{filteredNotes.length} תעודות נבדקות</span>
          </div>

          <div className="space-y-3">
            {filteredNotes.map((n) => {
              const driver = DRIVERS.find((d) => d.id === n.driverId) || DRIVERS[0]!;
              const match = crossMatch(
                { site: n.site, signedAt: n.signedAt },
                driver.kind,
                driver.plate,
                activeStops,
              );

              return (
                <div
                  key={n.id}
                  className="rounded-3xl bg-card p-5 shadow-card border border-border/70 space-y-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          ת.מ. #{n.id}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          קומקס #{n.comaxOrder}
                        </span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {n.yard}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground mt-1">
                        {n.customer}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{n.site}</span>
                      </div>
                    </div>

                    <div className="sm:text-left">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                          n.gps.status === "ok"
                            ? "bg-emerald-500/15 text-emerald-800 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-800 border border-amber-500/40"
                        }`}
                      >
                        {n.gps.status === "ok" ? "🟢 אומת ב-100% באיתוראן" : "⚠️ סטיית זמן חריגה"}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Details Grid */}
                  <div className="grid grid-cols-1 gap-2 rounded-2xl bg-muted/40 p-3 sm:grid-cols-3 text-xs border border-border/40">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">נהג ורכב:</span>
                      <span className="font-bold text-foreground">
                        {driver.name} ({driver.plate})
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-muted-foreground block">
                        זמני עמידה באיתוראן:
                      </span>
                      <span className="font-semibold text-foreground">
                        כניסה: {n.gps.arrive || "—"} | יציאה: {n.gps.depart || "—"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-muted-foreground block">
                        שעת חתימת לקוח:
                      </span>
                      <span className="font-semibold text-foreground">
                        {n.signedAt || "—"} · שהייה: {n.gps.note.split("—")[0]?.trim()}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center justify-between pt-1">
                    <span>
                      הערת בקרת נועה: <strong>{n.gps.note}</strong>
                    </span>
                    <span className="text-[11px] text-primary font-semibold">
                      אימות גיאופנס מול GPS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
