import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  NOTES,
  auditNote,
  fmtDate,
  ils,
  noteTotal,
  fetchNotes,
  type DeliveryNote,
} from "@/lib/data";
import { PageHeader, StatusPill } from "@/components/AppShell";
import { Search, RefreshCw, Layers, Package, Clock, Satellite, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function NotesArchive() {
  const [q, setQ] = useState("");

  const {
    data: notes = NOTES,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<DeliveryNote[]>({
    queryKey: ["delivery-notes"],
    queryFn: fetchNotes,
    initialData: NOTES,
    staleTime: 30000,
  });

  const handleRefresh = async () => {
    const res = await refetch();
    if (res.isSuccess) {
      toast.success("תעודות המשלוח סונכרנו בהצלחה מ-Google Apps Script 🟢");
    }
  };

  const list = notes.filter((n) =>
    [n.customer, n.id, n.comaxOrder, n.yard, n.date, n.customerNo]
      .join(" ")
      .toLowerCase()
      .includes(q.trim().toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="ארכיון תעודות משלוח"
        subtitle="סנכרון חי מול גיליון נועה ובקרת סריקות גליה"
        action={
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition active:scale-95 disabled:opacity-50"
            title="סנכרן תעודות מול Google Sheets"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-primary ${isFetching ? "animate-spin" : ""}`} />
            <span>{isFetching ? "מסנכרן..." : "סנכרון ענן"}</span>
          </button>
        }
      />

      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 md:px-8">
        {/* Search bar & Live Status Tag */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="חיפוש לפי לקוח, מספר ת.מ., הזמנת קומקס, מחסן..."
              className="w-full rounded-2xl border bg-card py-3 pr-11 pl-4 text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>סנכרון פעיל מול Comax & Apps Script</span>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {list.map((n) => {
            const audit = auditNote(n);
            const b = n.deposits.bales60002;
            const p = n.deposits.pallets60060;

            return (
              <Link
                key={n.id}
                to="/notes/$id"
                params={{ id: n.id }}
                className="group flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-card border border-border/60 hover:border-primary/40 transition sm:flex-row sm:items-center"
              >
                {/* Thumbnail scan */}
                {n.scans?.[0] ? (
                  <img
                    src={n.scans[0]}
                    alt={`ת.מ. ${n.id}`}
                    loading="lazy"
                    className="h-24 w-20 shrink-0 rounded-xl object-cover border border-border/40 shadow-2xs group-hover:scale-102 transition"
                  />
                ) : (
                  <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground text-xs">
                    אין סריקה
                  </div>
                )}

                {/* Main Information */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono font-bold text-foreground">ת.מ. #{n.id}</span>
                    <span>·</span>
                    <span className="font-mono text-primary font-semibold">
                      קומקס #{n.comaxOrder}
                    </span>
                    <span>·</span>
                    <span>{fmtDate(n.date)}</span>
                    <span>·</span>
                    <span>{n.yard}</span>
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition">
                      {n.customer}
                    </h3>
                    <div className="font-display text-base font-extrabold text-foreground">
                      {ils(noteTotal(n))}
                    </div>
                  </div>

                  {/* 1:1 Deposit Audit & Ituran Status */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {/* Bales 60002 */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${
                        b.delivered === b.billed
                          ? "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}
                    >
                      <Package className="h-3 w-3" />
                      <span>בלות 60002: {b.delivered}</span>
                    </span>

                    {/* Pallets 60060 */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${
                        p.delivered === p.billed
                          ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}
                    >
                      <Layers className="h-3 w-3" />
                      <span>משטחים 60060: {p.delivered}</span>
                    </span>

                    {/* Ituran Status */}
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
                      <Satellite className="h-3 w-3 text-blue-500" />
                      <span>
                        איתוראן: {n.gps.arrive || "—"} - {n.gps.depart || "—"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="sm:self-center shrink-0">
                  <StatusPill s={audit.status} />
                </div>
              </Link>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            לא נמצאו תעודות משלוח התואמות את החיפוש ״{q}״
          </div>
        )}
      </div>
    </>
  );
}
