import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ORDERS, DRIVERS, type Order, driverOf, ils } from "@/lib/data";
import { PageHeader } from "@/components/AppShell";
import {
  ClipboardList,
  Truck,
  MapPin,
  Clock,
  Phone,
  Navigation,
  ChevronDown,
  Package,
  Weight,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "הזמנות חיות — נועה ח. סבן" },
      {
        name: "description",
        content: "לוח הזמנות חיות מגיליון מאגר מידע נועה, כולל מניפסט פריטים ושיבוץ נהגים.",
      },
      { property: "og:title", content: "הזמנות חיות — ח. סבן" },
      { property: "og:description", content: "ניהול אספקות ומניפסט פריטים בזמן אמת." },
    ],
  }),
  component: OrdersScreen,
});

function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [expandedId, setExpandedId] = useState<string | null>("37901");
  const [filterYard, setFilterYard] = useState<string>("all");

  const filtered = orders.filter((o) => (filterYard === "all" ? true : o.yard === filterYard));

  const totalTons = (items: Order["items"]) =>
    items.reduce((s, i) => s + (i.qty * i.weightKg) / 1000, 0).toFixed(1);

  return (
    <>
      <PageHeader
        title="לוח הזמנות חיות"
        subtitle="סנכרון ישיר למאגר מידע נועה · מניפסט אספקות"
        action={
          <div className="flex items-center gap-2">
            <span className="rounded-2xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
              🟢 סנכרון תלת-כיווני פעיל
            </span>
          </div>
        }
      />

      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 md:px-8">
        {/* Filters and Stats */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterYard("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filterYard === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border bg-card text-muted-foreground"
              }`}
            >
              כל המחסנים ({orders.length})
            </button>
            <button
              onClick={() => setFilterYard("מחסן 4 החרש 10")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filterYard === "מחסן 4 החרש 10"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border bg-card text-muted-foreground"
              }`}
            >
              מחסן 4 החרש (אורן)
            </button>
            <button
              onClick={() => setFilterYard("מחסן 1 התלמיד 6")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filterYard === "מחסן 1 התלמיד 6"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border bg-card text-muted-foreground"
              }`}
            >
              מחסן 1 התלמיד (תמיר)
            </button>
          </div>

          <div className="text-xs text-muted-foreground">{filtered.length} הזמנות פתוחות להפצה</div>
        </div>

        {/* Orders Accordion List */}
        <div className="space-y-3">
          {filtered.map((o) => {
            const isExpanded = expandedId === o.id;
            const driver = o.driverId ? driverOf(o.driverId) : null;
            const weight = totalTons(o.items);

            return (
              <div
                key={o.id}
                className="overflow-hidden rounded-2xl border bg-card shadow-card transition"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : o.id)}
                  className="flex cursor-pointer items-center justify-between p-4 transition hover:bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-muted p-2.5 text-primary">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base md:text-lg">
                          {o.customer}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                          הזמנה #{o.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {o.address}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {o.window}
                        </span>
                        <span>·</span>
                        <span>{o.yard}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        o.status === "בדרך"
                          ? "bg-primary/15 text-primary"
                          : o.status === "בהעמסה"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {o.status}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Manifest Accordion Content */}
                {isExpanded && (
                  <div className="border-t bg-muted/20 p-5 space-y-4 animate-in fade-in-50 duration-200">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {/* Driver & Truck */}
                      <div className="rounded-xl border bg-card p-3 space-y-1">
                        <div className="text-xs font-bold text-muted-foreground">
                          משאית ונהג משובץ:
                        </div>
                        {driver ? (
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-primary" />
                            <span className="font-bold text-sm">
                              {driver.name} ({driver.truck} - {driver.plate})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-amber-700">
                            ממתין לשיבוץ נהג ע״י ראמי
                          </span>
                        )}
                      </div>

                      {/* Weight & Load */}
                      <div className="rounded-xl border bg-card p-3 space-y-1">
                        <div className="text-xs font-bold text-muted-foreground">
                          משקל כולל להעמסה:
                        </div>
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-emerald-600" />
                          <span className="font-display font-extrabold text-sm text-foreground">
                            {weight} טון מטרי
                          </span>
                        </div>
                      </div>

                      {/* Navigation & Contact */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://waze.com/ul?q=${encodeURIComponent(o.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
                        >
                          <Navigation className="h-3.5 w-3.5" /> ניווט Waze
                        </a>
                        <a
                          href={`tel:${o.phone}`}
                          className="flex items-center justify-center gap-1.5 rounded-xl border bg-card px-3 py-2.5 text-xs font-bold hover:bg-muted"
                        >
                          <Phone className="h-3.5 w-3.5 text-primary" /> {o.phone}
                        </a>
                      </div>
                    </div>

                    {/* Items Manifest Table */}
                    <div className="rounded-xl border bg-card overflow-hidden">
                      <div className="border-b bg-muted/40 px-4 py-2 text-xs font-bold text-muted-foreground">
                        מניפסט פריטים וחיוב פקדונות:
                      </div>
                      <div className="divide-y text-xs">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <Package className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-semibold text-foreground">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-sm">
                                {item.qty} {item.unit}
                              </span>
                              <span className="text-muted-foreground">
                                {((item.qty * item.weightKg) / 1000).toFixed(1)} טון
                              </span>
                              {item.deposit && (
                                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 font-bold text-amber-800">
                                  פקדון {item.deposit} ₪
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
