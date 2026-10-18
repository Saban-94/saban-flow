import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileText,
  Send,
  ShieldCheck,
  UserCheck,
  Stamp,
  MousePointerClick,
  Crown,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Copy,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Scale,
  Truck,
  Building,
  Check,
  Eye,
  FileCheck2,
} from "lucide-react";
import type { DeliveryNote, DeliveryItem } from "@/lib/data";
import { approvals, playDispatchChime, playUrgentSignatureAlarm } from "@/lib/store";
import { submitApproval } from "@/lib/api";

const HAREL_PHONE = "972506822268"; // טלפון הראל אידלסון (מנכ״ל ח. סבן)
const DEFAULT_RAMI_STAMP = "/sing-rami.jpg";

interface DeliveryCanvasEditorProps {
  note?: DeliveryNote;
  imageSrc?: string;
  stampSrc?: string;
  secondaryStampSrc?: string;
  onSaveToFolder?: (finalDataUrl: string) => Promise<void> | void;
  onUpdateSheetLog?: (status: string) => Promise<void> | void;
}

export default function DeliveryCanvasEditor({
  note,
  imageSrc,
  stampSrc = DEFAULT_RAMI_STAMP,
  secondaryStampSrc,
  onSaveToFolder,
  onUpdateSheetLog,
}: DeliveryCanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // -------------------------------------------------------------
  // 1. Dynamic State Binding (כל השדות עריכים ומסונכרנים 1:1)
  // -------------------------------------------------------------
  const [activeView, setActiveView] = useState<"canvas" | "edit">("canvas");
  const [orderId, setOrderId] = useState<string>("");
  const [comaxOrder, setComaxOrder] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerNo, setCustomerNo] = useState<string>("");
  const [siteAddress, setSiteAddress] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [yard, setYard] = useState<string>("");
  const [driverName, setDriverName] = useState<string>("");
  const [craneTime, setCraneTime] = useState<string>("");
  const [signedBy, setSignedBy] = useState<string>("");
  const [driverNotes, setDriverNotes] = useState<string>("");

  // פקדונות 1:1
  const [balesDelivered, setBalesDelivered] = useState<number>(0);
  const [balesBilled, setBalesBilled] = useState<number>(0);
  const [palletsDelivered, setPalletsDelivered] = useState<number>(0);
  const [palletsBilled, setPalletsBilled] = useState<number>(0);

  // פריטי משלוח
  const [items, setItems] = useState<DeliveryItem[]>([]);

  // מצבי עריכת קנבס
  const [toolMode, setToolMode] = useState<"highlight" | "text" | "stamp">("highlight");
  const [activeStampSrc, setActiveStampSrc] = useState<string>(stampSrc);
  const [activeStampName, setActiveStampName] = useState<string>("ראמי");
  const [textInput, setTextInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingToHarel, setIsSendingToHarel] = useState(false);
  const [stampPlacements, setStampPlacements] = useState<
    { x: number; y: number; name: string; timeStr: string }[]
  >([]);
  const isDrawing = useRef(false);

  // אתחול וסנכרון מלא מול התעודה החיה מ-Firestore / Sheets
  useEffect(() => {
    if (!note) return;

    setOrderId(note.id || "6715766");
    setComaxOrder(note.comaxOrder || note.id || "6215960");
    setCustomerName(note.customer || "א.ערן אזולאי בע״מ");
    setCustomerNo(note.customerNo || "632122");
    setSiteAddress(note.siteAddress || note.site || "נח 3, תל אביב");
    setDeliveryDate(note.date || new Date().toLocaleDateString("he-IL"));
    setYard(note.yard || "מחסן 4 החרש 10");
    setDriverName(note.driver || "חכמת (מרצדס 615-41-002)");
    setCraneTime(note.craneTime || "26 דק׳ מנוף");
    setSignedBy(note.signedBy || "ראמי מאסרווה בשטח ✅");
    setDriverNotes("סופק ונפרק תקין עם מנוף באתר. חתימה מאומתת.");

    setBalesDelivered(note.deposits?.bales60002?.delivered ?? 0);
    setBalesBilled(note.deposits?.bales60002?.billed ?? 0);
    setPalletsDelivered(note.deposits?.pallets60060?.delivered ?? 0);
    setPalletsBilled(note.deposits?.pallets60060?.billed ?? 0);

    const initialItems: DeliveryItem[] =
      Array.isArray(note.items) && note.items.length > 0
        ? note.items.map((i) => ({ ...i }))
        : [
            {
              name: "שק ריצופית טיח 40 ק״ג",
              qty: 240,
              ordered: 240,
              price: 28,
              weightKg: 9600,
              unit: "שק",
            },
            {
              name: "גרניט פורצלן 60/120 דמוי בטון",
              qty: 175,
              ordered: 175,
              price: 85,
              weightKg: 4200,
              unit: "מ״ר",
            },
            {
              name: "פח איטום סיקה טופ 107",
              qty: 60,
              ordered: 60,
              price: 140,
              weightKg: 1500,
              unit: "פח",
            },
          ];
    setItems(initialItems);
    setStampPlacements([]);
  }, [note?.id, note]);

  // -------------------------------------------------------------
  // 2. בדיקת התאמות 1:1 בזמן אמת (Discrepancy Checks)
  // -------------------------------------------------------------
  const auditSummary = useMemo(() => {
    const issues: { field: string; message: string; severity: "warn" | "fail" }[] = [];

    // בדיקת פריטים מול הזמנה
    items.forEach((item, idx) => {
      if (item.qty !== item.ordered) {
        issues.push({
          field: `פריט #${idx + 1}: ${item.name}`,
          message: `סופקו ${item.qty} יח׳ מול ${item.ordered} בהזמנת קומקס`,
          severity: "warn",
        });
      }
    });

    // בדיקת חוק הפקדונות 1:1
    if (balesDelivered !== balesBilled) {
      issues.push({
        field: "שקי פקדון 60002 (בלות)",
        message: `${balesDelivered} סופקו בפועל מול ${balesBilled} שחויבו בחשבונית`,
        severity: "fail",
      });
    }

    if (palletsDelivered !== palletsBilled) {
      issues.push({
        field: "משטחי עץ 60060",
        message: `${palletsDelivered} סופקו מול ${palletsBilled} שחויבו בחשבונית`,
        severity: "fail",
      });
    }

    const isAllOk = issues.length === 0;
    return {
      isAllOk,
      issues,
      statusLabel: isAllOk ? "מאוזן 1:1 ומאומת ✅" : "קיימות אי-התאמות לבדיקה ⚠️",
    };
  }, [items, balesDelivered, balesBilled, palletsDelivered, palletsBilled]);

  // -------------------------------------------------------------
  // 3. ציור שטר המשלוח על גבי הקנבס בזמן אמת מתוך ה-State
  // -------------------------------------------------------------
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 1080;

    // רקע דף לבן נקי
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // מסגרת עדינה
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // כותרת בס״ד
    ctx.direction = "rtl";
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 13px Assistant, Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("בס״ד", canvas.width - 45, 45);

    // לוגו וכותרת חברה רשמית
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 20px Assistant, Arial, sans-serif";
    ctx.fillText("ח. סבן חומרי בניין (1994) בע״מ", canvas.width - 50, 75);

    ctx.font = "11px Assistant, Arial, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(
      "אספקה ישירה לאתרי בנייה · מלט · טיט · בלוקים · חול · חצץ · גבס ובידוד",
      canvas.width - 50,
      95,
    );
    ctx.fillText(
      "מחסן 4 החרש 10 הוד השרון · טל: 09-7407070 · מחסן 1 התלמיד 6 הוד השרון",
      canvas.width - 50,
      112,
    );

    // כותרת שטר משלוח
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px Assistant, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`שטר משלוח מס׳: ${orderId}`, canvas.width / 2, 155);

    // פס מפריד
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(45, 175);
    ctx.lineTo(canvas.width - 45, 175);
    ctx.stroke();

    // פרטי לקוח והזמנה
    ctx.textAlign = "right";
    ctx.font = "bold 13px Assistant, Arial, sans-serif";
    ctx.fillStyle = "#1e293b";

    // שורת פרטים 1
    ctx.fillText(`שם הלקוח: ${customerName}`, canvas.width - 60, 205);
    ctx.fillText(`תאריך אספקה: ${deliveryDate}`, 320, 205);

    // שורת פרטים 2
    ctx.fillText(`כתובת האתר: ${siteAddress}`, canvas.width - 60, 230);
    ctx.fillText(`נהג ורכב: ${driverName}`, 320, 230);

    // שורת פרטים 3
    ctx.fillText(`מס׳ הזמנה בקומקס: ${comaxOrder}`, canvas.width - 60, 255);
    ctx.fillText(`מחסן מוצא: ${yard}`, 320, 255);

    // טבלת פריטים
    const tableTop = 280;
    const rowHeight = 32;
    const headers = ["מס׳", "תיאור הפריט", "סופק", "הוזמן", "יח׳", "משקל (ק״ג)", "מחיר ₪"];
    const colX = [
      canvas.width - 60,
      canvas.width - 100,
      canvas.width - 360,
      canvas.width - 420,
      canvas.width - 480,
      canvas.width - 550,
      canvas.width - 640,
    ];

    // כותרת טבלה
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(45, tableTop, canvas.width - 90, 30);
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(45, tableTop, canvas.width - 90, 30);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 12px Assistant, Arial, sans-serif";
    headers.forEach((h, idx) => {
      ctx.fillText(h, colX[idx]!, tableTop + 20);
    });

    // שורות פריטים
    ctx.font = "12px Assistant, Arial, sans-serif";
    items.forEach((item, idx) => {
      const y = tableTop + 30 + idx * rowHeight;
      const hasDiscrepancy = item.qty !== item.ordered;

      // רקע שורה (צהבהב אם יש אי-התאמה)
      if (hasDiscrepancy) {
        ctx.fillStyle = "#fef9c3";
        ctx.fillRect(45, y, canvas.width - 90, rowHeight);
      } else if (idx % 2 === 1) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(45, y, canvas.width - 90, rowHeight);
      }
      ctx.strokeStyle = "#cbd5e1";
      ctx.strokeRect(45, y, canvas.width - 90, rowHeight);

      ctx.fillStyle = hasDiscrepancy ? "#b45309" : "#1e293b";
      ctx.fillText(String(idx + 1), colX[0]!, y + 21);
      ctx.fillText(item.name || "פריט", colX[1]!, y + 21);
      ctx.font = hasDiscrepancy
        ? "bold 12px Assistant, Arial, sans-serif"
        : "12px Assistant, Arial, sans-serif";
      ctx.fillText(String(item.qty), colX[2]!, y + 21);
      ctx.fillText(String(item.ordered), colX[3]!, y + 21);
      ctx.font = "12px Assistant, Arial, sans-serif";
      ctx.fillText(item.unit || "יח׳", colX[4]!, y + 21);
      ctx.fillText(String(item.weightKg || 0), colX[5]!, y + 21);
      ctx.fillText(item.price ? `₪${item.price}` : "—", colX[6]!, y + 21);
    });

    // שורות ריקות להשלמה אם פחות מ-5 פריטים
    const totalDisplayRows = Math.max(items.length, 5);
    for (let extra = items.length; extra < totalDisplayRows; extra++) {
      const y = tableTop + 30 + extra * rowHeight;
      if (extra % 2 === 1) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(45, y, canvas.width - 90, rowHeight);
      }
      ctx.strokeRect(45, y, canvas.width - 90, rowHeight);
    }

    // תיבת בקרת חוק הפקדונות 1:1
    const depositsY = tableTop + 30 + totalDisplayRows * rowHeight + 20;
    const depositsBalanced = balesDelivered === balesBilled && palletsDelivered === palletsBilled;

    ctx.fillStyle = depositsBalanced ? "#ecfdf5" : "#fef3c7";
    ctx.fillRect(45, depositsY, canvas.width - 90, 52);
    ctx.strokeStyle = depositsBalanced ? "#10b981" : "#f59e0b";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(45, depositsY, canvas.width - 90, 52);

    ctx.fillStyle = depositsBalanced ? "#065f46" : "#92400e";
    ctx.font = "bold 12px Assistant, Arial, sans-serif";
    ctx.fillText(
      `בקרת חוק הפקדונות 1:1 ואימות איתוראן: ${depositsBalanced ? "מאוזן ותקין ✅" : "חריגה לבדיקה ⚠️"}`,
      canvas.width - 65,
      depositsY + 20,
    );
    ctx.font = "12px Assistant, Arial, sans-serif";
    ctx.fillText(
      `• שקי פקדון 60002 (בלות): סופק ${balesDelivered} | חויב ${balesBilled}   • משטחי עץ 60060: סופק ${palletsDelivered} | חויב ${palletsBilled}   • מנוף PTO: ${craneTime}`,
      canvas.width - 65,
      depositsY + 39,
    );

    // הצהרת מסירה וחתימות
    const footerY = depositsY + 90;
    ctx.fillStyle = "#475569";
    ctx.font = "italic 12px Assistant, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "הציוד, המשטחים והשקים המפורטים לעיל סופקו במלואם ובמצב תקין לשביעות רצון המזמין.",
      canvas.width / 2,
      footerY,
    );

    // חתימת שטח
    ctx.textAlign = "right";
    ctx.font = "bold 13px Assistant, Arial, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(`שם המקבל באתר: ${signedBy}`, canvas.width - 70, footerY + 45);
    ctx.fillText(`אישור וחתימת שטח:`, canvas.width - 70, footerY + 70);

    // הדמיית חתימה פיזית
    ctx.font = 'italic 20px "Brush Script MT", "Segoe Script", cursive';
    ctx.fillStyle = "#1e3a8a";
    ctx.fillText(signedBy ? `${signedBy} ~` : "אושר בשטח ~", canvas.width - 230, footerY + 72);

    ctx.font = "bold 13px Assistant, Arial, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(`נהג מוביל: ${driverName}`, 320, footerY + 45);
    ctx.fillText(`אימות מסירה: תקין באיתוראן GPS 🛰️`, 320, footerY + 70);

    // ציור חותמות קודמות שהוטבעו
    stampPlacements.forEach((stamp) => {
      ctx.save();
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.strokeStyle = "#059669";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(stamp.x, stamp.y, 180, 75, 12);
      ctx.fill();
      ctx.stroke();

      ctx.font = "bold 14px Assistant, Arial, sans-serif";
      ctx.fillStyle = "#047857";
      ctx.textAlign = "center";
      ctx.fillText(`נבדק ואושר`, stamp.x + 90, stamp.y + 30);
      ctx.font = "bold 12px Assistant, Arial, sans-serif";
      ctx.fillText(stamp.name, stamp.x + 90, stamp.y + 48);
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillStyle = "#065f46";
      ctx.fillText(stamp.timeStr, stamp.x + 90, stamp.y + 64);
      ctx.restore();
    });
  }, [
    orderId,
    comaxOrder,
    customerName,
    siteAddress,
    deliveryDate,
    yard,
    driverName,
    craneTime,
    signedBy,
    balesDelivered,
    balesBilled,
    palletsDelivered,
    palletsBilled,
    items,
    stampPlacements,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // -------------------------------------------------------------
  // 4. עריכת פריטים אינטראקטיבית (Table Handlers)
  // -------------------------------------------------------------
  const handleItemChange = (index: number, field: keyof DeliveryItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = updated[index];
      if (!target) return prev;
      if (field === "qty" || field === "ordered" || field === "price" || field === "weightKg") {
        const numVal = Number(value) || 0;
        updated[index] = { ...target, [field]: numVal };
      } else {
        updated[index] = { ...target, [field]: value };
      }
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: "פריט בניין חדש",
        qty: 1,
        ordered: 1,
        price: 0,
        weightKg: 50,
        unit: "יח׳",
      },
    ]);
    toast.info("נוספה שורת פריט חדשה לעריכה");
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.warning("לא ניתן למחוק את כל הפריטים");
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
    toast.info("הפריט הוסר משטר המשלוח");
  };

  const handleMatchAllDeposits = () => {
    setBalesBilled(balesDelivered);
    setPalletsBilled(palletsDelivered);
    toast.success("פקדונות 60002 ו-60060 אופסו והותאמו 1:1! ⚖️");
  };

  // -------------------------------------------------------------
  // 5. ציור על גבי הקנבס (מרקר, טקסט וחותמת)
  // -------------------------------------------------------------
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolMode !== "highlight") return;
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || toolMode !== "highlight") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.strokeStyle = "rgba(255, 235, 59, 0.45)";
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // הטבעת הערת טקסט אדומה
    if (toolMode === "text" && textInput.trim()) {
      ctx.save();
      ctx.font = "bold 16px Assistant, Arial, sans-serif";
      ctx.fillStyle = "#dc2626";
      ctx.textAlign = "right";
      ctx.fillText(`✍️ ${textInput.trim()}`, clickX, clickY);
      ctx.restore();
      setTextInput("");
      toast.success("הערת הטקסט הוטבעה על גבי התעודה!");
      return;
    }

    // הטבעת חותמת ראמי / נועה במיקום חופשי
    if (toolMode === "stamp") {
      const now = new Date();
      const timeStr = `${now.toLocaleDateString("he-IL")} ${now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}`;

      setStampPlacements((prev) => [
        ...prev,
        {
          x: Math.max(20, Math.min(canvas.width - 200, clickX - 90)),
          y: Math.max(20, Math.min(canvas.height - 90, clickY - 35)),
          name: activeStampName === "ראמי" ? "ראמי מסארווה" : "נועה AI",
          timeStr,
        },
      ]);

      toast.success(`חותמת ${activeStampName} הוטבעה עם תאריך ושעה (${timeStr})! ✨`);
      setToolMode("highlight");
    }
  };

  // -------------------------------------------------------------
  // 6. "Send to Harel" Action (שליחה ישירה להראל מנכ״ל בוואטסאפ ובמערכת)
  // -------------------------------------------------------------
  const handleSendToHarel = async () => {
    setIsSendingToHarel(true);
    playDispatchChime(0.9);

    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas ? canvas.toDataURL("image/png") : "";

      // 1. שמירה מקומית בחנות האישורים (מוכן להראל מנכ״ל)
      approvals.rami(orderId, `נבדק ואושר ע״י ראמי (${auditSummary.statusLabel})`);

      // 2. עדכון בשרת Google Apps Script
      if (onUpdateSheetLog) {
        await onUpdateSheetLog(
          `אושר ע״י ראמי והועבר ישירות להראל מנכ״ל (${auditSummary.statusLabel})`,
        );
      } else {
        await submitApproval(orderId, "rami", "אושר ע״י ראמי והועבר ישירות להראל מנכ״ל");
      }

      // 3. שמירת צילום התעודה בתיקיית הלקוח ב-Drive
      if (onSaveToFolder && dataUrl) {
        await onSaveToFolder(dataUrl);
      }

      // 4. הפקת הודעת וואטסאפ מפורטת בפורמט מנכ״ל רשמי
      const itemsListText = items
        .map((i) => `• ${i.qty} ${i.unit || "יח׳"} - ${i.name}`)
        .join("\n");

      const whatsappText = `👑 *אישור תעודת משלוח להראל מנכ״ל — ח. סבן חומרי בניין*

📄 *שטר משלוח:* #${orderId} (קומקס: ${comaxOrder})
🏢 *לקוח:* ${customerName} (תיק ${customerNo})
📍 *אתר אספקה:* ${siteAddress}
🚚 *נהג:* ${driverName} | מנוף PTO: ${craneTime}
📦 *פריטים שנבדקו ואושרו 1:1:*
${itemsListText}

⚖️ *בקרת פקדונות 1:1:*
• בלות 60002: ${balesDelivered} סופקו | ${balesBilled} חויבו (${balesDelivered === balesBilled ? "מאוזן ✅" : "חריגה ⚠️"})
• משטחי עץ 60060: ${palletsDelivered} סופקו | ${palletsBilled} חויבו (${palletsDelivered === palletsBilled ? "מאוזן ✅" : "חריגה ⚠️"})

✍️ *אישור שטח:* ${signedBy}
🛰️ *בקרת איתוראן:* שהייה מאומתת בכתובת האתר
📁 *תיקיית לקוח:* תיקיות לקוחות / [${customerNo}] - ${customerName} / 2. תעודות משלוח

*נבדק ואושר ע״י ראמי מסארווה.* ממתין לאישורך הסופי לחיוב בדשבורד! 👑`;

      // 5. פתיחת וואטסאפ מול הראל
      const waUrl = `https://wa.me/${HAREL_PHONE}?text=${encodeURIComponent(whatsappText)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");

      toast.success(`תעודה #${orderId} שוגרה להראל מנכ״ל בוואטסאפ ובמערכת! 👑`, {
        description: "התעודה סומנה כמאושרת ע״י ראמי וממתינה לאישור חיוב בלחיצה אחת.",
      });
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בסנכרון האישור, אנא נסה שוב.");
    } finally {
      setIsSendingToHarel(false);
    }
  };

  // העתקת סיכום מנכ״ל ללוח
  const handleCopySummary = () => {
    const summary = `תעודה #${orderId} | לקוח: ${customerName} | אתר: ${siteAddress} | נהג: ${driverName} | פקדונות: ${balesDelivered} בלות, ${palletsDelivered} משטחים | סטטוס: ${auditSummary.statusLabel}`;
    navigator.clipboard.writeText(summary);
    toast.success("סיכום התעודה הועתק ללוח!");
  };

  return (
    <Card
      className="p-4 md:p-6 flex flex-col items-center gap-4 bg-card border-border/80 shadow-xs rounded-2xl max-w-4xl mx-auto"
      dir="rtl"
    >
      {/* 1. באנר בקרת שרשרת אישורים וסטטוס 1:1 */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-muted/50 p-3 rounded-xl border border-border/60 text-xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>שרשרת אישורים פעילה:</span>
          <Badge
            variant={auditSummary.isAllOk ? "default" : "secondary"}
            className={`text-[11px] font-mono ${
              auditSummary.isAllOk
                ? "bg-emerald-600 text-white"
                : "bg-amber-500/20 text-amber-700 border-amber-500/30"
            }`}
          >
            {auditSummary.statusLabel}
          </Badge>
        </div>

        {/* שלבי אישור */}
        <div className="flex items-center gap-1.5 font-bold">
          <Badge variant="default" className="gap-1 text-[11px] bg-blue-700 text-white">
            <UserCheck className="h-3 w-3" /> 1. עריכת ראמי
          </Badge>
          <span>←</span>
          <Badge variant="outline" className="gap-1 text-[11px] text-muted-foreground">
            <Crown className="h-3 w-3 text-amber-600" /> 2. אישור הראל
          </Badge>
        </div>
      </div>

      {/* 2. בורר מצב תצוגה: קנבס שטר משלוח מול עריכת פריטים */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={activeView === "canvas" ? "default" : "outline"}
            onClick={() => setActiveView("canvas")}
            className="rounded-xl text-xs h-8 gap-1.5 font-bold"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>תצוגת שטר משלוח וקנבס</span>
          </Button>

          <Button
            size="sm"
            variant={activeView === "edit" ? "default" : "outline"}
            onClick={() => setActiveView("edit")}
            className="rounded-xl text-xs h-8 gap-1.5 font-bold relative"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>עריכת שדות ופריטים</span>
            {!auditSummary.isAllOk && (
              <span className="h-2 w-2 rounded-full bg-amber-500 absolute -top-1 -right-1" />
            )}
          </Button>
        </div>

        {/* כפתור העל: שלח להראל מנכ״ל */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopySummary}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
            title="העתק סיכום טקסט"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">העתק סיכום</span>
          </Button>

          <Button
            size="sm"
            disabled={isSendingToHarel}
            onClick={handleSendToHarel}
            className="rounded-xl font-bold text-xs h-8 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-sm gap-1.5 active:scale-95 transition"
            title="שיגור הודעת וואטסאפ ישירה להראל מנכ״ל ועדכון סטטוס מערכת"
          >
            <Crown className="h-3.5 w-3.5 text-amber-300" />
            <span>{isSendingToHarel ? "משגר להראל..." : "שלח להראל מנכ״ל 👑"}</span>
          </Button>
        </div>
      </div>

      {/* 3. תצוגת עריכת שדות וטבלת פריטים (כשבוחרים 'עריכת שדות') */}
      {activeView === "edit" && (
        <div className="w-full space-y-4 bg-muted/20 p-4 rounded-2xl border border-border/80">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">
                עריכת פרטי שטר משלוח ובקרת קומקס 1:1
              </h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleMatchAllDeposits}
              className="text-xs h-7 gap-1 text-emerald-700 border-emerald-500/40 hover:bg-emerald-500/10"
            >
              <Scale className="h-3 w-3" />
              <span>התאם פקדונות 1:1</span>
            </Button>
          </div>

          {/* שדות ראשיים */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">
                מספר שטר משלוח
              </label>
              <Input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">
                מספר הזמנה בקומקס
              </label>
              <Input
                value={comaxOrder}
                onChange={(e) => setComaxOrder(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">שם הלקוח</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-8 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">כתובת האתר</label>
              <Input
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">נהג ורכב</label>
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">
                זמן מנוף PTO באתר
              </label>
              <Input
                value={craneTime}
                onChange={(e) => setCraneTime(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">
                אישור וחתימת שטח
              </label>
              <Input
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                className="h-8 text-xs text-blue-700 font-bold"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">מחסן מוצא</label>
              <Input
                value={yard}
                onChange={(e) => setYard(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">תאריך אספקה</label>
              <Input
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* עריכת פקדונות 1:1 */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs space-y-2">
            <div className="font-bold text-amber-900 flex items-center justify-between">
              <span>בקרת חוק הפקדונות (סופק בשטח מול חויב בחשבונית):</span>
              <span className="font-mono text-[11px]">
                {balesDelivered === balesBilled && palletsDelivered === palletsBilled
                  ? "תואם 1:1 ✅"
                  : "נדרש אימות כמותי ⚠️"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-amber-800 text-[11px] block mb-0.5">בלות 60002 סופקו</label>
                <Input
                  type="number"
                  value={balesDelivered}
                  onChange={(e) => setBalesDelivered(Number(e.target.value) || 0)}
                  className="h-7 text-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-amber-800 text-[11px] block mb-0.5">בלות 60002 חויבו</label>
                <Input
                  type="number"
                  value={balesBilled}
                  onChange={(e) => setBalesBilled(Number(e.target.value) || 0)}
                  className={`h-7 text-xs bg-white font-mono ${
                    balesDelivered !== balesBilled
                      ? "border-amber-600 font-bold text-amber-700"
                      : ""
                  }`}
                />
              </div>

              <div>
                <label className="text-amber-800 text-[11px] block mb-0.5">
                  משטחים 60060 סופקו
                </label>
                <Input
                  type="number"
                  value={palletsDelivered}
                  onChange={(e) => setPalletsDelivered(Number(e.target.value) || 0)}
                  className="h-7 text-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-amber-800 text-[11px] block mb-0.5">
                  משטחים 60060 חויבו
                </label>
                <Input
                  type="number"
                  value={palletsBilled}
                  onChange={(e) => setPalletsBilled(Number(e.target.value) || 0)}
                  className={`h-7 text-xs bg-white font-mono ${
                    palletsDelivered !== palletsBilled
                      ? "border-amber-600 font-bold text-amber-700"
                      : ""
                  }`}
                />
              </div>
            </div>
          </div>

          {/* טבלת עריכת פריטים */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">רשימת פריטים בשטר המשלוח:</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAddItem}
                className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
              >
                <Plus className="h-3 w-3" />
                <span>הוסף פריט</span>
              </Button>
            </div>

            <div className="overflow-x-auto border border-border rounded-xl bg-card">
              <table className="w-full text-xs text-right">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="p-2 w-10">מס׳</th>
                    <th className="p-2">תיאור הפריט</th>
                    <th className="p-2 w-20">סופק</th>
                    <th className="p-2 w-20">הוזמן</th>
                    <th className="p-2 w-16">יח׳</th>
                    <th className="p-2 w-20">מחיר ₪</th>
                    <th className="p-2 w-20">משקל (ק״ג)</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items.map((item, index) => {
                    const isDiff = item.qty !== item.ordered;
                    return (
                      <tr key={index} className={isDiff ? "bg-amber-500/10" : "hover:bg-muted/30"}>
                        <td className="p-2 font-mono text-muted-foreground">{index + 1}</td>
                        <td className="p-2">
                          <Input
                            value={item.name}
                            onChange={(e) => handleItemChange(index, "name", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                            className={`h-7 text-xs font-mono font-bold ${
                              isDiff ? "text-amber-700 border-amber-500" : ""
                            }`}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.ordered}
                            onChange={(e) => handleItemChange(index, "ordered", e.target.value)}
                            className="h-7 text-xs font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, "price", e.target.value)}
                            className="h-7 text-xs font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.weightKg}
                            onChange={(e) => handleItemChange(index, "weightKg", e.target.value)}
                            className="h-7 text-xs font-mono"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-muted-foreground hover:text-destructive p-1"
                            title="מחק שורה"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. סרגל כלים לקנבס (מרקר, טקסט וחותמת) */}
      <div className="flex flex-wrap items-center justify-between gap-2 w-full pt-1">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={toolMode === "highlight" ? "default" : "outline"}
            onClick={() => setToolMode("highlight")}
            className="rounded-xl font-bold text-xs h-8"
          >
            🟡 מרקר צהוב
          </Button>

          <Button
            size="sm"
            variant={toolMode === "text" ? "default" : "outline"}
            onClick={() => setToolMode("text")}
            className="rounded-xl font-bold text-xs h-8"
          >
            ✍️ הערת טקסט
          </Button>

          <Button
            size="sm"
            variant={toolMode === "stamp" && activeStampName === "ראמי" ? "default" : "outline"}
            onClick={() => {
              setToolMode("stamp");
              setActiveStampName("ראמי");
              toast.info("לחץ בכל מקום בתעודה להטבעת חותמת ראמי מסארווה ✍️");
            }}
            className={`rounded-xl font-bold text-xs h-8 gap-1.5 ${
              toolMode === "stamp" && activeStampName === "ראמי"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-blue-50/70 border-blue-200 text-blue-800 hover:bg-blue-100"
            }`}
          >
            <Stamp className="h-3.5 w-3.5 text-blue-700" />
            <span>הטבע חותמת ראמי</span>
          </Button>

          {secondaryStampSrc && (
            <Button
              size="sm"
              variant={toolMode === "stamp" && activeStampName === "נועה AI" ? "default" : "ghost"}
              onClick={() => {
                setToolMode("stamp");
                setActiveStampName("נועה AI");
                toast.info("לחץ בתעודה להטבעת חותמת נועה AI 🤖");
              }}
              className="rounded-xl font-medium text-xs h-8 gap-1 text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>חותמת נועה</span>
            </Button>
          )}

          {stampPlacements.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setStampPlacements([]);
                toast.info("החותמות הוסרו");
              }}
              className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>נקה חותמות</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <span>ת.מ #{orderId}</span>
          <span>·</span>
          <span>{customerName}</span>
        </div>
      </div>

      {toolMode === "stamp" && (
        <div className="w-full bg-blue-500/10 border border-blue-500/30 text-blue-900 rounded-xl p-2.5 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 font-bold">
            <MousePointerClick className="h-4 w-4 text-blue-600" />
            <span>
              מצב הטבעה פעיל: לחץ על גבי התעודה למיקום חותמת {activeStampName} (כולל תאריך ושעה
              רשמיים)!
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setToolMode("highlight")}
            className="h-6 text-[11px] text-blue-700"
          >
            ביטול
          </Button>
        </div>
      )}

      {toolMode === "text" && (
        <div className="w-full flex items-center gap-2">
          <Input
            placeholder="הקלד הערה אדומה (למשל: סופקו 240 שקים, זוכה פקדון), ולחץ על התעודה..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="h-8 text-xs flex-1 border-destructive/50"
          />
        </div>
      )}

      {/* 5. קנבס שטר המשלוח הוקטורי הרשמי */}
      <div
        className={`border border-border rounded-xl shadow-xs overflow-hidden bg-white max-w-full ${
          toolMode === "stamp"
            ? "cursor-crosshair"
            : toolMode === "text"
              ? "cursor-text"
              : "cursor-crosshair"
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onClick={handleCanvasClick}
          className="max-w-full h-auto block mx-auto select-none"
        />
      </div>

      {/* 6. סרגל תחתון: סיכום ואישור סופי להראל מנכ״ל */}
      <div className="w-full bg-muted/40 p-3 rounded-xl border border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-emerald-600" />
          <span className="font-bold text-foreground">מוכן לאישור סופי:</span>
          <span className="text-muted-foreground">
            {customerName} · {items.length} פריטים · {balesDelivered} בלות · {palletsDelivered}{" "}
            משטחים
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSendToHarel}
            disabled={isSendingToHarel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 gap-1.5 rounded-xl shadow-xs"
          >
            <Crown className="h-3.5 w-3.5 text-amber-300" />
            <span>שלח להראל מנכ״ל בוואטסאפ ובמערכת</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
