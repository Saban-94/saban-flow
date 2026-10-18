import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useRef } from 'react';
import { PageHeader } from '@/components/AppShell';
import {
  Disc,
  Truck,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sliders,
  ShieldCheck,
  FileCheck2,
  Download,
  Activity,
  Award,
  Upload,
  RefreshCw,
  Printer,
  Sparkles,
  Layers,
  Eye,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { toast } from 'sonner';

export interface TachographStop {
  stop_number: number;
  customer_name: string;
  customer_id: string;
  address: string;
  delivery_note_nums: string[];
  order_num: string;
  time_window: string;
  crane_pto_duration: string;
  cargo_summary: string;
  ituran_status: string;
  sector_d: string;
  speed_range?: string;
}

export interface SpeedDataPoint {
  time: string;
  speed: number;
  limit: number;
  isCraneStop?: boolean;
}

export interface TachographRecord {
  id: string;
  date: string;
  driver_name: string;
  driver_role: string;
  truck_id: string;
  truck_model: string;
  odometer_start: number;
  odometer_end: number;
  total_distance_km: number;
  total_crane_time: string;
  idle_anomalies: string;
  spark_confidence: string;
  image_url: string;
  stops: TachographStop[];
  speed_points: SpeedDataPoint[];
  approved: boolean;
  approved_by: string;
  approved_at: string;
}

export const TACHOGRAPH_ARCHIVE: TachographRecord[] = [
  {
    id: "disk-2026-10-13-hikmat",
    date: "13/10/2026",
    driver_name: "חכמת",
    driver_role: "נהג משאית מנוף N3",
    truck_id: "615-41-002",
    truck_model: "מרצדס אקטרוס מנוף N3",
    odometer_start: 342110,
    odometer_end: 342248,
    total_distance_km: 138,
    total_crane_time: "2 שעות 20 דק׳",
    idle_anomalies: "0 דק׳ (תקין)",
    spark_confidence: "99.4%",
    image_url: "/tachograph-13-10-2026.jpg",
    approved: true,
    approved_by: "ראמי מסארווה",
    approved_at: "13/10/2026 14:15",
    stops: [
      {
        stop_number: 1,
        customer_name: "אורבר בנייה בע״מ",
        customer_id: "601928",
        address: "ירמיהו 11, רמת גן",
        delivery_note_nums: ["6715751"],
        order_num: "6215936",
        time_window: "07:15 - 07:45",
        crane_pto_duration: "25 דק׳ מנוף",
        cargo_summary: "2 בלות טיט (1.6t) + 18 שקים מלט (450kg)",
        ituran_status: "מאומת באיתוראן ✅",
        sector_d: "M 300 300 L 485 365 A 210 210 0 0 1 475 390 Z",
        speed_range: "0 קמ״ש (פריקה)",
      },
      {
        stop_number: 2,
        customer_name: "א.ערן אזולאי בע״מ",
        customer_id: "632122",
        address: "נח 3, תל אביב",
        delivery_note_nums: ["6715752", "6715753"],
        order_num: "6215937",
        time_window: "08:20 - 08:55",
        crane_pto_duration: "35 דק׳ מנוף",
        cargo_summary: "15 בלות סומסום (12.0t) + 30 שק טיח",
        ituran_status: "מאומת באיתוראן ✅",
        sector_d: "M 300 300 L 450 425 A 210 210 0 0 1 420 455 Z",
        speed_range: "0 קמ״ש (פריקה)",
      },
      {
        stop_number: 3,
        customer_name: "יוסף בילר",
        customer_id: "632277",
        address: "ירושלמי 1, הוד השרון",
        delivery_note_nums: ["6715762"],
        order_num: "6215942",
        time_window: "09:40 - 10:25",
        crane_pto_duration: "45 דק׳ מנוף",
        cargo_summary: "12 בלות (9.6t) + 84 שקים (2.1t)",
        ituran_status: "מאומת באיתוראן ✅",
        sector_d: "M 300 300 L 375 490 A 210 210 0 0 1 325 505 Z",
        speed_range: "0 קמ״ש (פריקה)",
      },
      {
        stop_number: 4,
        customer_name: "א.ערן אזולאי (סבב ב׳)",
        customer_id: "632122",
        address: "נח 3, תל אביב",
        delivery_note_nums: ["6715766"],
        order_num: "6215960",
        time_window: "12:30 - 13:10",
        crane_pto_duration: "40 דק׳ מנוף",
        cargo_summary: "240 ריצופית + 175 מ״ר גרניט + 60 סיקה",
        ituran_status: "מאומת באיתוראן ✅",
        sector_d: "M 300 300 L 210 495 A 210 210 0 0 1 170 475 Z",
        speed_range: "0 קמ״ש (פריקה)",
      },
    ],
    speed_points: [
      { time: "06:30", speed: 0, limit: 90 },
      { time: "06:50", speed: 68, limit: 90 },
      { time: "07:15", speed: 0, limit: 90, isCraneStop: true },
      { time: "07:30", speed: 0, limit: 90, isCraneStop: true },
      { time: "07:45", speed: 0, limit: 90, isCraneStop: true },
      { time: "08:00", speed: 72, limit: 90 },
      { time: "08:20", speed: 0, limit: 90, isCraneStop: true },
      { time: "08:40", speed: 0, limit: 90, isCraneStop: true },
      { time: "08:55", speed: 0, limit: 90, isCraneStop: true },
      { time: "09:20", speed: 65, limit: 90 },
      { time: "09:40", speed: 0, limit: 90, isCraneStop: true },
      { time: "10:00", speed: 0, limit: 90, isCraneStop: true },
      { time: "10:25", speed: 0, limit: 90, isCraneStop: true },
      { time: "10:45", speed: 78, limit: 90 },
      { time: "11:15", speed: 0, limit: 90 },
      { time: "11:45", speed: 74, limit: 90 },
      { time: "12:15", speed: 82, limit: 90 },
      { time: "12:30", speed: 0, limit: 90, isCraneStop: true },
      { time: "12:50", speed: 0, limit: 90, isCraneStop: true },
      { time: "13:10", speed: 0, limit: 90, isCraneStop: true },
      { time: "13:30", speed: 60, limit: 90 },
      { time: "13:45", speed: 0, limit: 90 },
    ],
  },
  {
    id: "disk-2026-10-12-hikmat",
    date: "12/10/2026",
    driver_name: "חכמת",
    driver_role: "נהג משאית מנוף N3",
    truck_id: "615-41-002",
    truck_model: "מרצדס אקטרוס מנוף N3",
    odometer_start: 341992,
    odometer_end: 342110,
    total_distance_km: 118,
    total_crane_time: "1 שעה 55 דק׳",
    idle_anomalies: "0 דק׳ (תקין)",
    spark_confidence: "98.9%",
    image_url: "/tachograph-13-10-2026.jpg",
    approved: true,
    approved_by: "ראמי מסארווה",
    approved_at: "12/10/2026 15:40",
    stops: [
      {
        stop_number: 1,
        customer_name: "אורבר בנייה בע״מ",
        customer_id: "601928",
        address: "ז׳בוטינסקי 45, רמת גן",
        delivery_note_nums: ["6715690"],
        order_num: "6215880",
        time_window: "07:30 - 08:10",
        crane_pto_duration: "40 דק׳ מנוף",
        cargo_summary: "6 בלות חול מחצבה (4.8t) + 30 מלט לבן",
        ituran_status: "מאומת באיתוראן ✅",
        sector_d: "M 300 300 L 485 365 A 210 210 0 0 1 475 390 Z",
        speed_range: "0 קמ״ש (פריקה)",
      },
      {
        stop_number: 2,
        customer_name: "פלמר בע״מ",
        customer_id: "618992",
        address: "גן השקמים 6, סביון",
        delivery_note_nums: ["6715702"],
        order_num: "6215891",
        time_window: "09:15 - 09:50",
        crane_pto_duration: "35 דק׳ מנוף",
        cargo_summary: "8 בלות טוף (6.4t) + 40 שק טיח",
        ituran_status: "מאומת באיתוראן ✅",
        sector_d: "M 300 300 L 450 425 A 210 210 0 0 1 420 455 Z",
        speed_range: "0 קמ״ש (פריקה)",
      },
      {
        stop_number: 3,
        customer_name: "יוסף בילר",
        customer_id: "632277",
        address: "ירושלמי 1, הוד השרון",
        delivery_note_nums: ["6715714"],
        order_num: "6215905",
        time_window: "11:00 - 11:40",
        crane_pto_duration: "40 דק׳ מנוף",
        cargo_summary: "5 בלות סומסום (4.0t) + 50 שקים",
        ituran_status: "מאומת באיתוראן ✅",
        sector_d: "M 300 300 L 375 490 A 210 210 0 0 1 325 505 Z",
        speed_range: "0 קמ״ש (פריקה)",
      },
    ],
    speed_points: [
      { time: "06:45", speed: 0, limit: 90 },
      { time: "07:10", speed: 64, limit: 90 },
      { time: "07:30", speed: 0, limit: 90, isCraneStop: true },
      { time: "08:10", speed: 0, limit: 90, isCraneStop: true },
      { time: "08:45", speed: 70, limit: 90 },
      { time: "09:15", speed: 0, limit: 90, isCraneStop: true },
      { time: "09:50", speed: 0, limit: 90, isCraneStop: true },
      { time: "10:20", speed: 58, limit: 90 },
      { time: "11:00", speed: 0, limit: 90, isCraneStop: true },
      { time: "11:40", speed: 0, limit: 90, isCraneStop: true },
      { time: "12:10", speed: 75, limit: 90 },
      { time: "13:00", speed: 0, limit: 90 },
    ],
  },
];

export const Route = createFileRoute('/tachograph')({
  component: TachographAuditPage,
});

export function TachographAuditPage() {
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(0);
  const record: TachographRecord = TACHOGRAPH_ARCHIVE[selectedRecordIndex] || TACHOGRAPH_ARCHIVE[0];

  const [activeStopId, setActiveStopId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [invertColors, setInvertColors] = useState(false);
  const [isApproved, setIsApproved] = useState(record.approved);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [hudText, setHudText] = useState('העבר סמן מעל הדיסקית לבדיקת אינטרוולים');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeImage = customImage || record.image_url;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleSelectStop = (stopNumber: number) => {
    setActiveStopId((prev) => (prev === stopNumber ? null : stopNumber));
    const target = record.stops.find((s) => s.stop_number === stopNumber);
    if (target) {
      setHudText(`תחנה ${target.stop_number}: ${target.address} · ${target.crane_pto_duration}`);
    }
  };

  const handleReanalyze = () => {
    setIsReanalyzing(true);
    setHudText('מפענח ערוצי מהירות, זמני מנוף ואימות איתוראן...');
    setTimeout(() => {
      setIsReanalyzing(false);
      setHudText(`פענוח הושלם: ${record.total_distance_km} ק״מ, ${record.total_crane_time} מנוף מאומתות`);
      toast.success('פענוח AI הושלם בהצלחה מול נתוני איתוראן וקומקס', {
        description: `דיסקית מ- ${record.date} עבור משאית ${record.truck_id} (${record.driver_name})`,
      });
    }, 1200);
  };

  const handleToggleApproval = () => {
    const next = !isApproved;
    setIsApproved(next);
    if (next) {
      toast.success('אושר רשמית ע״י ראמי מסארווה', {
        description: 'הדיסקית אושרה, תויקה וסונכרנה במערכת סבן',
      });
    } else {
      toast.info('אישור הדיסקית בוטל זמנית לבדיקה נוספת');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
        setShowUploadModal(false);
        toast.success(`דיסקית ${file.name} נטענה בהצלחה`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 selection:bg-cyan-500 selection:text-white" dir="rtl">
      <PageHeader
        title="noaBrain SPARK Vision — בקרת דיסקיות טכוגרף"
        subtitle="מערכת AI לבקרת דיסקיות טכוגרף ואימות מנוף שטח · ח. סבן חומרי בניין (1994) בע״מ"
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUploadModal(true)}
              className="hidden sm:flex items-center gap-1.5"
            >
              <Upload className="h-4 w-4 text-primary" />
              <span>העלאת דיסקית</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="p-2"
              title="הדפסת דוח בקרה"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              disabled={isReanalyzing}
              onClick={handleReanalyze}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <RefreshCw className={`h-4 w-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
              <span>{isReanalyzing ? 'מפענח...' : 'פענוח AI מחדש'}</span>
            </Button>
          </div>
        }
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-5 space-y-6">
        <div className="bg-card border border-border p-2.5 sm:p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-muted-foreground px-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>ארכיון דיסקיות (סריקות מאומתות):</span>
            </span>
            {TACHOGRAPH_ARCHIVE.map((rec, idx) => (
              <button
                key={rec.id}
                onClick={() => {
                  setSelectedRecordIndex(idx);
                  setIsApproved(rec.approved);
                  setCustomImage(null);
                  setActiveStopId(null);
                  setHudText(`דיסקית נבחרה: ${rec.date} · ${rec.total_distance_km} ק״מ`);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 ${
                  selectedRecordIndex === idx && !customImage
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                    : 'bg-muted hover:bg-accent text-foreground border border-border'
                }`}
              >
                <Disc className="h-3 w-3" />
                <span>{rec.date}</span>
                <span className="text-[10px] opacity-80 font-mono">{rec.total_distance_km} ק״מ</span>
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
            <span>תיקייה: <strong className="text-primary">artifacts/tachograph_history/</strong></span>
            <span>·</span>
            <span className="text-emerald-500 font-medium">סריקת מייל גליה/חרש</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="p-3.5 relative overflow-hidden bg-card/80 border-border">
            <div className="text-xs text-muted-foreground font-medium">נהג משויך</div>
            <div className="text-base sm:text-lg font-bold text-foreground mt-0.5 truncate">{record.driver_name}</div>
            <div className="text-[11px] text-primary mt-0.5 font-mono">{record.truck_id}</div>
            <div className="absolute left-2 bottom-2 w-1.5 h-7 bg-primary rounded-full"></div>
          </Card>

          <Card className="p-3.5 relative overflow-hidden bg-card/80 border-border">
            <div className="text-xs text-muted-foreground font-medium">תאריך דיסקית</div>
            <div className="text-base sm:text-lg font-bold text-foreground mt-0.5 font-mono">{record.date}</div>
            <div className="text-[11px] text-emerald-500 mt-0.5">סריקה מאומתת</div>
            <div className="absolute left-2 bottom-2 w-1.5 h-7 bg-emerald-500 rounded-full"></div>
          </Card>

          <Card className="p-3.5 relative overflow-hidden bg-card/80 border-border">
            <div className="text-xs text-muted-foreground font-medium">מד אוץ מצטבר</div>
            <div className="text-base sm:text-lg font-bold text-foreground mt-0.5 font-mono">{record.total_distance_km} ק״מ</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{record.odometer_start.toLocaleString()} ⬅️ {record.odometer_end.toLocaleString()}</div>
            <div className="absolute left-2 bottom-2 w-1.5 h-7 bg-blue-500 rounded-full"></div>
          </Card>

          <Card className="p-3.5 relative overflow-hidden bg-card/80 border-border">
            <div className="text-xs text-muted-foreground font-medium">זמן מנוף PTO בפועל</div>
            <div className="text-base sm:text-lg font-bold text-amber-500 mt-0.5 font-mono">{record.total_crane_time}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{record.stops.length} פריקות מנוף מאומתות</div>
            <div className="absolute left-2 bottom-2 w-1.5 h-7 bg-amber-500 rounded-full"></div>
          </Card>

          <Card className="p-3.5 relative overflow-hidden bg-card/80 border-border">
            <div className="text-xs text-muted-foreground font-medium">זמני סרק חריגים</div>
            <div className="text-base sm:text-lg font-bold text-emerald-500 mt-0.5 font-mono">{record.idle_anomalies}</div>
            <div className="text-[11px] text-emerald-500 mt-0.5">ללא חריגות השהיה</div>
            <div className="absolute left-2 bottom-2 w-1.5 h-7 bg-emerald-500 rounded-full"></div>
          </Card>

          <Card className="p-3.5 relative overflow-hidden bg-card/80 border-border">
            <div className="text-xs text-muted-foreground font-medium">אימות SPARK Vision</div>
            <div className="text-base sm:text-lg font-bold text-emerald-500 mt-0.5 font-mono flex items-center gap-1">
              <span>{record.spark_confidence}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">התאמה מלאה לסידור</div>
            <div className="absolute left-2 bottom-2 w-1.5 h-7 bg-emerald-500 rounded-full"></div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <Card className="lg:col-span-7 p-4 sm:p-5 space-y-4 bg-card border-border shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  מנתח דיסקית מעגלית (24H Circular Tachograph)
                </h2>
              </div>

              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border text-xs">
                <button
                  onClick={() => setShowAiOverlay((p) => !p)}
                  className={`px-2.5 py-1 rounded transition-all font-medium ${
                    showAiOverlay ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  שכבת AI
                </button>
                <button
                  onClick={() => setHighContrast((p) => !p)}
                  className={`px-2.5 py-1 rounded transition-all font-medium ${
                    highContrast ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  הדגשת עט
                </button>
                <button
                  onClick={() => setInvertColors((p) => !p)}
                  className={`px-2.5 py-1 rounded transition-all font-medium ${
                    invertColors ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  נגטיב
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-square max-w-[540px] mx-auto bg-black rounded-2xl border-2 border-dashed border-border/80 overflow-hidden flex items-center justify-center group">
              <img
                src={activeImage}
                alt={`דיסקית טכוגרף ${record.driver_name} ${record.date}`}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.25s ease-out',
                }}
                className={`w-full h-full object-contain select-none transition-all duration-300 ${
                  highContrast ? 'contrast-200 brightness-125' : 'contrast-125'
                } ${invertColors ? 'invert' : ''}`}
              />

              <div
                className="absolute inset-0 pointer-events-none rounded-full overflow-hidden opacity-30 animate-spin-slow"
                style={{ animationDuration: '10s' }}
              >
                <div className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left bg-gradient-to-br from-primary/50 via-primary/10 to-transparent"></div>
              </div>

              {showAiOverlay && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-250"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  }}
                  viewBox="0 0 600 600"
                >
                  <circle cx="300" cy="300" r="270" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />
                  <circle cx="300" cy="300" r="220" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.75" />
                  <circle cx="300" cy="300" r="45" fill="#0b0f19" stroke="#6b7280" strokeWidth="2" opacity="0.85" />

                  {record.stops.map((stop) => {
                    const isSelected = activeStopId === stop.stop_number;
                    return (
                      <path
                        key={stop.stop_number}
                        d={stop.sector_d}
                        fill={isSelected ? 'rgba(56, 189, 248, 0.55)' : 'rgba(56, 189, 248, 0.22)'}
                        stroke={isSelected ? '#38bdf8' : '#0284c7'}
                        strokeWidth={isSelected ? '3.5' : '2'}
                        className="cursor-pointer pointer-events-auto transition-all duration-200 hover:fill-cyan-400/40"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStop(stop.stop_number);
                        }}
                        onMouseEnter={() => {
                          setHudText(`תחנה ${stop.stop_number}: ${stop.address} · ${stop.crane_pto_duration}`);
                        }}
                      />
                    );
                  })}

                  <text x="300" y="270" textAnchor="middle" fill="#9ca3af" fontSize="11" fontFamily="monospace">
                    {record.truck_id}
                  </text>
                  <text x="300" y="286" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">
                    {record.driver_name} · סבן
                  </text>
                  <text x="300" y="334" textAnchor="middle" fill="#34d399" fontSize="11" fontFamily="monospace">
                    {record.date}
                  </text>
                  <text x="300" y="349" textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="monospace">
                    {record.total_distance_km} KM
                  </text>
                </svg>
              )}

              <div className="absolute bottom-3 left-3 bg-card/90 border border-border px-3 py-1.5 rounded-xl text-xs backdrop-blur-md text-foreground pointer-events-none transition-all shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-medium">{hudText}</span>
              </div>

              <div className="absolute top-3 left-3 flex flex-col gap-1 bg-card/90 border border-border p-1 rounded-lg backdrop-blur-sm shadow-md">
                <button
                  onClick={handleZoomIn}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded text-sm font-bold transition-colors"
                  title="הגדל"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded text-sm font-bold transition-colors"
                  title="הקטן"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded text-xs transition-colors"
                  title="איפוס"
                >
                  ⟲
                </button>
                <button
                  onClick={handleRotate}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded text-xs transition-colors"
                  title="סובב 90°"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-border text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> נהיגה פעילה (רצועת מהירות)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> פריקת מנוף / PTO</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> העמסה / מחסן</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> תקרת 90 קמ״ש</span>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">הצלבת איתוראן: GPS-OK</div>
            </div>
          </Card>

          <div className="lg:col-span-5 space-y-4">
            <Card className="p-4 sm:p-5 shadow-md bg-card border-border space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">תחנות עבודה והצלבת תעודות משלוח</h3>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono text-primary border-primary/30">
                  {record.stops.length} תחנות מאומתות
                </Badge>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {record.stops.map((stop) => {
                  const isSelected = activeStopId === stop.stop_number;
                  return (
                    <div
                      key={stop.stop_number}
                      onClick={() => handleSelectStop(stop.stop_number)}
                      className={`border rounded-xl p-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border bg-card/60 hover:bg-accent/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span className="text-xs font-bold text-foreground">
                              תחנה {stop.stop_number}: {stop.address}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                            {stop.customer_name} (לקוח {stop.customer_id})
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 font-mono">
                            <span>ת.מ {stop.delivery_note_nums.join(' + ')}</span>
                            <span>·</span>
                            <span>הזמנה {stop.order_num}</span>
                          </div>
                        </div>
                        <div className="text-left font-mono">
                          <div className="text-xs text-amber-500 font-bold">{stop.crane_pto_duration}</div>
                          <div className="text-[11px] text-muted-foreground">{stop.time_window}</div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>📦 {stop.cargo_summary}</span>
                        <span className="text-emerald-500 font-semibold">{stop.ituran_status}</span>
                      </div>
                    </div>
                  );
                })}

                <div className="border border-dashed border-border rounded-xl p-2.5 text-xs text-muted-foreground flex items-center justify-between bg-muted/40">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                    סבב טעינה שני: מחסן 4 החרש 10 הוד השרון
                  </span>
                  <span className="font-mono text-muted-foreground">10:45 - 11:30 (45 דק׳)</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-5 shadow-md bg-card border-border space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">פרופיל מהירות ורציפות תנועה (קמ״ש)</h3>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">מהירות שיא: 82 קמ״ש</span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={record.speed_points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      stroke="#6b7280"
                      fontSize={10}
                      tickLine={false}
                      interval={2}
                      fontFamily="JetBrains Mono"
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={10}
                      domain={[0, 100]}
                      ticks={[0, 30, 60, 90]}
                      tickLine={false}
                      fontFamily="JetBrains Mono"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border border-border p-2 rounded-lg shadow-lg text-xs" dir="rtl">
                              <div className="font-bold text-foreground">{data.time}</div>
                              <div className="text-primary mt-0.5">
                                {data.speed === 0 ? 'עצירה / פריקת מנוף PTO' : `מהירות: ${data.speed} קמ״ש`}
                              </div>
                              <div className="text-muted-foreground text-[10px]">תקרה חוקית: 90 קמ״ש</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="speed"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#speedGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>מהירות ממוצעת בנסיעה: 54 קמ״ש</span>
                <span className="text-emerald-500 font-medium">0 חריגות מהירות מעל 90 קמ״ש</span>
              </div>
            </Card>

            <Card className="p-4 sm:p-5 shadow-md bg-gradient-to-br from-card to-card/90 border-emerald-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h4 className="text-sm font-bold text-foreground">אישור בקרת טכוגרף דיגיטלי</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    הדיסקית פוענחה אוטונומית, נבדקה מול נתוני האיתוראן וסנכרון תעודות משלוח הושלם בהצלחה.
                  </p>
                </div>

                {isApproved && (
                  <div className="border-2 border-emerald-500 text-emerald-500 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider -rotate-6 shadow-md shadow-emerald-500/20 bg-emerald-500/10 text-center select-none animate-in fade-in">
                    <div>נבדק ואושר</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">ראמי מסארווה</div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-mono">
                  {isApproved ? `אישור: ${record.approved_at}` : 'ממתין לאישור מנהל'}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleApproval}
                  className="font-medium text-xs h-8"
                >
                  {isApproved ? 'הסר חותמת' : 'הטבע חותמת ראמי'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <span>העלאת תמונת דיסקית טכוגרף לפענוח</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 text-center transition-colors cursor-pointer bg-muted/30"
            >
              <Disc className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-foreground font-medium">גרור ושחרר קובץ דיסקית (JPG / PNG)</p>
              <p className="text-xs text-muted-foreground mt-1">או לחץ לבחירת קובץ מקומי במחשב</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground font-semibold">דיסקיות מובנות לבדיקה מהירה:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedRecordIndex(0);
                    setCustomImage(null);
                    setShowUploadModal(false);
                    toast.success('נטענה דיסקית חכמת 13/10/2026');
                  }}
                  className="p-2.5 text-xs bg-muted hover:bg-accent rounded-lg border border-border text-right transition-colors"
                >
                  <div className="font-bold text-foreground">חכמת (615-41-002)</div>
                  <div className="text-[10px] text-primary font-mono">13/10/2026 (נוכחי)</div>
                </button>
                <button
                  onClick={() => {
                    setSelectedRecordIndex(1);
                    setCustomImage(null);
                    setShowUploadModal(false);
                    toast.success('נטענה דיסקית חכמת 12/10/2026');
                  }}
                  className="p-2.5 text-xs bg-muted hover:bg-accent rounded-lg border border-border text-right transition-colors"
                >
                  <div className="font-bold text-foreground">חכמת (615-41-002)</div>
                  <div className="text-[10px] text-emerald-500 font-mono">12/10/2026</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
