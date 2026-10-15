import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Image as ImageIcon, Send, ShieldCheck, UserCheck } from "lucide-react";

interface DeliveryCanvasEditorProps {
  imageSrc: string;
  stampSrc?: string;
  onSaveToFolder: (finalDataUrl: string) => Promise<void> | void;
  onUpdateSheetLog: (status: string) => Promise<void> | void;
}

export default function DeliveryCanvasEditor({
  imageSrc,
  stampSrc,
  onSaveToFolder,
  onUpdateSheetLog,
}: DeliveryCanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'highlight' | 'text' | 'stamp'>('highlight');
  const [textInput, setTextInput] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState<'rami_review' | 'secondary_review' | 'harel_approved'>('rami_review');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDrawing = useRef(false);

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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'highlight') return;
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || mode !== 'highlight') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = 'rgba(255, 235, 59, 0.45)';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'text' || !textInput) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText(textInput, e.clientX - rect.left, e.clientY - rect.top);
    setTextInput('');
  };

  const handleAddStamp = () => {
    if (!stampSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stampImg = new Image();
    stampImg.crossOrigin = 'anonymous';
    stampImg.src = stampSrc;
    stampImg.onload = () => {
      ctx.drawImage(stampImg, canvas.width - 220, canvas.height - 180, 160, 110);
    };
  };

  const handleCompleteWorkflowStep = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSubmitting(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');

      if (workflowStatus === 'rami_review') {
        setWorkflowStatus('secondary_review');
        await onUpdateSheetLog('בדיקת ראמי הושלמה - ממתין לבדיקה נוספת');
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
    <Card className="p-6 flex flex-col items-center gap-5 bg-card border-border/80 shadow-sm rounded-2xl max-w-4xl mx-auto">
      <div className="w-full flex items-center justify-between bg-muted/50 p-3.5 rounded-xl border border-border/60 text-xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>שרשרת אישורים:</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={workflowStatus === 'rami_review' ? 'default' : 'secondary'} className="gap-1">
            <UserCheck className="h-3 w-3" /> 1. בדיקת ראמי
          </Badge>
          <span>←</span>
          <Badge variant={workflowStatus === 'secondary_review' ? 'default' : 'secondary'} className="gap-1">
            <FileText className="h-3 w-3" /> 2. בדיקה נוספת
          </Badge>
          <span>←</span>
          <Badge variant={workflowStatus === 'harel_approved' ? 'default' : 'secondary'} className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> 3. אישור הראל
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
        <Button
          variant={mode === 'highlight' ? 'default' : 'outline'}
          onClick={() => setMode('highlight')}
          className="rounded-xl font-bold text-xs"
        >
          🟡 מרקר צהוב
        </Button>
        <Button
          variant={mode === 'text' ? 'default' : 'outline'}
          onClick={() => setMode('text')}
          className="rounded-xl font-bold text-xs"
        >
          ✍️ הוספת הערת טקסט
        </Button>
        {stampSrc && (
          <Button variant="outline" onClick={handleAddStamp} className="rounded-xl font-bold text-xs">
            <ImageIcon className="h-3.5 w-3.5 ml-1.5" /> הטבע חותמת
          </Button>
        )}
        <Button
          disabled={isSubmitting}
          onClick={handleCompleteWorkflowStep}
          className="rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white mr-auto gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          {workflowStatus === 'rami_review' && 'אשר שלב ראמי ושלח להמשך בדיקה'}
          {workflowStatus === 'secondary_review' && 'שלח לאישור סופי של הראל'}
          {workflowStatus === 'harel_approved' && 'שמור בתיקיית לקוח ותיעד בגיליון'}
        </Button>
      </div>

      {mode === 'text' && (
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="הקלד הערה, לחץ על מקום בתעודה להטבעה..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full rounded-xl bg-muted/60 px-3.5 py-2.5 text-xs border border-border/70 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      <div className="border border-border rounded-xl shadow-md overflow-hidden bg-white max-w-full cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onClick={handleCanvasClick}
          className="max-w-full h-auto block mx-auto"
        />
      </div>
    </Card>
  );
}
