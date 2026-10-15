import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, FileText, Image as ImageIcon, Send, ShieldCheck, UserCheck, Stamp, MousePointerClick } from "lucide-react";

interface DeliveryCanvasEditorProps {
  imageSrc: string;
  stampSrc?: string; // נתיב חותמת ראמי - ברירת מחדל /sing-rami.jpg
  secondaryStampSrc?: string; // חותמת נועה
  onSaveToFolder: (finalDataUrl: string) => Promise<void> | void;
  onUpdateSheetLog: (status: string) => Promise<void> | void;
}

export default function DeliveryCanvasEditor({
  imageSrc,
  stampSrc = "/sing-rami.jpg",
  secondaryStampSrc,
  onSaveToFolder,
  onUpdateSheetLog,
}: DeliveryCanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'highlight' | 'text' | 'stamp'>('highlight');
  const [activeStampSrc, setActiveStampSrc] = useState<string>(stampSrc);
  const [activeStampName, setActiveStampName] = useState<string>('ראמי');
  const [textInput, setTextInput] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState<'rami_review' | 'secondary_review' | 'harel_approved'>('rami_review');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDrawing = useRef(false);

  // טעינת תמונת התעודה על גבי הקנבס
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width || 800;
      canvas.height = img.height || 1050;
      ctx.drawImage(img, 0, 0);
    };
  }, [imageSrc]);

  // מירקור צהוב - התחלת ציור
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'highlight') return;
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || mode !== 'highlight') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.strokeStyle = 'rgba(255, 235, 59, 0.45)';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  /**
   * לחיצה על גבי הקנבס - מיקום חופשי של חותמת או הערת טקסט
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // 1. מצב טקסט
    if (mode === 'text' && textInput.trim()) {
      ctx.save();
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillStyle = '#b91c1c';
      ctx.fillText(textInput.trim(), clickX, clickY);
      ctx.restore();
      setTextInput('');
      toast.success('הערת הטקסט הוטבעה על גבי התעודה!');
      return;
    }

    // 2. מצב הטבעת חותמת במיקום חופשי עם תאריך ושעה
    if (mode === 'stamp') {
      const src = activeStampSrc || stampSrc;
      const stampImg = new Image();
      stampImg.crossOrigin = 'anonymous';
      stampImg.src = src;

      stampImg.onload = () => {
        const stampWidth = 180;
        const stampHeight = 80;
        const xPos = Math.max(10, Math.min(canvas.width - stampWidth - 10, clickX - stampWidth / 2));
        const yPos = Math.max(10, Math.min(canvas.height - stampHeight - 35, clickY - stampHeight / 2));

        // הטבעת תמונת החותמת
        ctx.drawImage(stampImg, xPos, yPos, stampWidth, stampHeight);

        // הטבעת תאריך ושעה בטקסט קטן מתחת לחותמת
        const now = new Date();
        const dateStr = now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        const timestampText = `אושר ע״י ${activeStampName} · ${dateStr} ${timeStr}`;

        ctx.save();
        ctx.font = 'bold 11px Assistant, Arial, sans-serif';
        ctx.fillStyle = '#1e3a8a'; // כחול רשמי
        ctx.textAlign = 'center';
        ctx.fillText(timestampText, xPos + stampWidth / 2, yPos + stampHeight + 15);
        ctx.restore();

        toast.success(`חותמת ${activeStampName} הוטבעה עם תאריך ושעה (${dateStr} ${timeStr})! ✨`);
        setMode('highlight'); // חוזר למצב סימון רגיל
      };

      stampImg.onerror = () => {
        if (secondaryStampSrc && src !== secondaryStampSrc) {
          const fallbackImg = new Image();
          fallbackImg.crossOrigin = 'anonymous';
          fallbackImg.src = secondaryStampSrc;
          fallbackImg.onload = () => {
            const stampWidth = 160;
            const stampHeight = 100;
            const xPos = Math.max(10, clickX - stampWidth / 2);
            const yPos = Math.max(10, clickY - stampHeight / 2);
            ctx.drawImage(fallbackImg, xPos, yPos, stampWidth, stampHeight);

            const now = new Date();
            const dateStr = now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
            ctx.save();
            ctx.font = 'bold 11px Assistant, Arial, sans-serif';
            ctx.fillStyle = '#065f46';
            ctx.textAlign = 'center';
            ctx.fillText(`נועה AI · ${dateStr} ${timeStr}`, xPos + stampWidth / 2, yPos + stampHeight + 15);
            ctx.restore();

            toast.success(`הוטבעה חותמת עם תאריך ושעה! ✨`);
            setMode('highlight');
          };
        } else {
          toast.error('שגיאה בטעינת קובץ החותמת.');
        }
      };
    }
  };

  /**
   * בחירת חותמת ראמי ומעבר למצב לחיצה למיקום
   */
  const handleSelectRamiStamp = () => {
    setMode('stamp');
    setActiveStampSrc(stampSrc);
    setActiveStampName('ראמי');
    toast.info('לחץ בכל מקום בתעודה (למשל על שורת חתימת הנהג/מקבל) למיקום החותמת ✍️');
  };

  /**
   * בחירת חותמת נועה ומעבר למצב לחיצה למיקום
   */
  const handleSelectNoaStamp = () => {
    if (!secondaryStampSrc) return;
    setMode('stamp');
    setActiveStampSrc(secondaryStampSrc);
    setActiveStampName('נועה AI');
    toast.info('לחץ בכל מקום בתעודה להטבעת חותמת נועה AI 🤖');
  };

  const handleCompleteWorkflowStep = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSubmitting(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');

      if (workflowStatus === 'rami_review') {
        setWorkflowStatus('secondary_review');
        await onUpdateSheetLog('בדיקת ראמי הושלמה והוטבעה חותמת עם תאריך ושעה');
      } else if (workflowStatus === 'secondary_review') {
        setWorkflowStatus('harel_approved');
        await onUpdateSheetLog('נשלח להראל מנכ״ל לאישור סופי');
      } else {
        await onSaveToFolder(dataUrl);
        await onUpdateSheetLog('אושר סופית ע״י הראל ונשמר בתיקיית הלקוח ב־Drive');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 md:p-6 flex flex-col items-center gap-4 bg-card border-border/80 shadow-xs rounded-2xl max-w-4xl mx-auto" dir="rtl">
      {/* סרגל שלבי אישור */}
      <div className="w-full flex items-center justify-between bg-muted/50 p-3 rounded-xl border border-border/60 text-xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>שרשרת אישורים:</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={workflowStatus === 'rami_review' ? 'default' : 'secondary'} className="gap-1 text-[11px]">
            <UserCheck className="h-3 w-3" /> 1. בדיקת ראמי
          </Badge>
          <span>←</span>
          <Badge variant={workflowStatus === 'secondary_review' ? 'default' : 'secondary'} className="gap-1 text-[11px]">
            <FileText className="h-3 w-3" /> 2. בדיקה נוספת
          </Badge>
          <span>←</span>
          <Badge variant={workflowStatus === 'harel_approved' ? 'default' : 'secondary'} className="gap-1 text-[11px]">
            <CheckCircle2 className="h-3 w-3" /> 3. אישור הראל
          </Badge>
        </div>
      </div>

      {/* הודעת הדרכה כאשר מצב הטבעה פעיל */}
      {mode === 'stamp' && (
        <div className="w-full bg-blue-500/10 border border-blue-500/30 text-blue-900 rounded-xl p-2.5 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 font-bold">
            <MousePointerClick className="h-4 w-4 text-blue-600" />
            <span>מצב הטבעה פעיל: לחץ בכל מקום בתעודה למיקום חותמת {activeStampName} (כולל תאריך ושעה)!</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setMode('highlight')} className="h-6 text-[11px] text-blue-700">
            ביטול
          </Button>
        </div>
      )}

      {/* סרגל כלים: מרקר, טקסט, בחירת חותמת ראמי/נועה וכפתור אישור */}
      <div className="flex flex-wrap items-center justify-start gap-2 w-full">
        <Button
          variant={mode === 'highlight' ? 'default' : 'outline'}
          onClick={() => setMode('highlight')}
          className="rounded-xl font-bold text-xs h-8"
        >
          🟡 מרקר צהוב
        </Button>

        <Button
          variant={mode === 'text' ? 'default' : 'outline'}
          onClick={() => setMode('text')}
          className="rounded-xl font-bold text-xs h-8"
        >
          ✍️ הערת טקסט
        </Button>

        {/* כפתור בחירת חותמת ראמי להטבעה במיקום חופשי */}
        <Button
          variant={mode === 'stamp' && activeStampName === 'ראמי' ? 'default' : 'outline'}
          onClick={handleSelectRamiStamp}
          className={`rounded-xl font-bold text-xs h-8 gap-1.5 ${
            mode === 'stamp' && activeStampName === 'ראמי'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-blue-50/70 border-blue-200 text-blue-800 hover:bg-blue-100'
          }`}
          title="בחר חותמת ראמי ולחץ על התעודה למיקום חופשי"
        >
          <Stamp className="h-3.5 w-3.5 text-blue-700" />
          <span>הטבע חותמת ראמי</span>
        </Button>

        {secondaryStampSrc && (
          <Button
            variant={mode === 'stamp' && activeStampName === 'נועה AI' ? 'default' : 'ghost'}
            onClick={handleSelectNoaStamp}
            className="rounded-xl font-medium text-xs h-8 gap-1 text-muted-foreground hover:text-foreground"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>חותמת נועה</span>
          </Button>
        )}

        <Button
          disabled={isSubmitting}
          onClick={handleCompleteWorkflowStep}
          className="rounded-xl font-bold text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white mr-auto gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          {workflowStatus === 'rami_review' && 'אשר שלב ראמי'}
          {workflowStatus === 'secondary_review' && 'שלח לאישור הראל'}
          {workflowStatus === 'harel_approved' && 'שמור בדרייב ובגיליון'}
        </Button>
      </div>

      {mode === 'text' && (
        <div className="w-full">
          <input
            type="text"
            placeholder="הקלד הערה, ולחץ על התעודה למיקום..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full rounded-xl bg-muted/60 px-3.5 py-2 text-xs border border-border/70 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* תצוגת הקנבס וההטבעה עם סמן עכבר אינטראקטיבי */}
      <div className={`border border-border rounded-xl shadow-xs overflow-hidden bg-white max-w-full ${
        mode === 'stamp' ? 'cursor-crosshair' : mode === 'text' ? 'cursor-text' : 'cursor-crosshair'
      }`}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onClick={handleCanvasClick}
          className="max-w-full h-auto block mx-auto select-none"
        />
      </div>
    </Card>
  );
}
