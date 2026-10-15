import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertCircle, FileText, Stamp, Highlighter, Type, Send, Save, ArrowRight } from "lucide-react";

interface DeliveryCanvasEditorProps {
documentId: string;
clientName: string;
imageSrc: string;
stampSrc?: string;
currentStage?: 'rami' | 'other' | 'harel' | 'approved';
onSaveToFolder: (dataUrl: string, stage: string) => Promise;
onUpdateSheetLog: (logEntry: { docId: string; stage: string; user: string; status: string }) => Promise;
}

export default function DeliveryCanvasEditor({
documentId,
clientName,
imageSrc,
stampSrc = '/stamps/default-stamp.png',
currentStage = 'rami',
onSaveToFolder,
onUpdateSheetLog,
}: DeliveryCanvasEditorProps) {
const canvasRef = useRef<HTMLCanvasElement | null>(null);
const [mode, setMode] = useState<'highlight' | 'text' | 'stamp'>('highlight');
const [textInput, setTextInput] = useState('');
const [stage, setStage] = useState<'rami' | 'other' | 'harel' | 'approved'>(currentStage);
const [isSaving, setIsSaving] = useState(false);
const [successMsg, setSuccessMsg] = useState('');
const isDrawing = useRef(false);

// טעינת תמונת הרקע של תעודת המשלוח לקנבס
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

// ציור חופשי (מרקר צהוב שקוף)
const startDrawing = (e: React.MouseEvent) => {
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

const draw = (e: React.MouseEvent) => {
if (!isDrawing.current || mode !== 'highlight') return;
const canvas = canvasRef.current;
if (!canvas) return;
const ctx = canvas.getContext('2d');
if (!ctx) return;

const rect = canvas.getBoundingClientRect();
ctx.strokeStyle = 'rgba(255, 235, 59, 0.45)'; // מרקר צהוב מודגש ושקוף
ctx.lineWidth = 24;
ctx.lineCap = 'round';
ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
ctx.stroke();


};

const stopDrawing = () => {
isDrawing.current = false;
};

// הוספת טקסט או חותמת בלחיצה על הקנבס
const handleCanvasClick = (e: React.MouseEvent) => {
const canvas = canvasRef.current;
if (!canvas) return;
const ctx = canvas.getContext('2d');
if (!ctx) return;

const rect = canvas.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;

if (mode === 'text' && textInput) {
  ctx.font = 'bold 16px Heebo, Arial, sans-serif';
  ctx.fillStyle = '#d97706'; // צבע כתום-צהוב בולט להערות
  ctx.fillText(textInput, x, y);
  setTextInput('');
} else if (mode === 'stamp') {
  const stampImg = new Image();
  stampImg.crossOrigin = 'anonymous';
  stampImg.src = stampSrc;
  stampImg.onload = () => {
    ctx.drawImage(stampImg, x - 60, y - 40, 120, 80);
  };
}


};

// שמירה והעברה לשלב הבא בשרשרת (ראמי -> ואחר -> הראל)
const handleNextStage = async () => {
const canvas = canvasRef.current;
if (!canvas) return;
setIsSaving(true);

try {
  const dataUrl = canvas.toDataURL('image/png');
  
  let nextStage: 'rami' | 'other' | 'harel' | 'approved' = stage;
  let user = 'ראמי';
  if (stage === 'rami') {
    nextStage = 'other';
    user = 'ראמי';
  } else if (stage === 'other') {
    nextStage = 'harel';
    user = 'בדיקה שנייה (ואחר)';
  } else if (stage === 'harel') {
    nextStage = 'approved';
    user = 'הראל (אישור סופי)';
  }

  // שמירה בתיקיית הלקוח
  await onSaveToFolder(dataUrl, nextStage);

  // עדכון לוג בגיליון הבקרה
  await onUpdateSheetLog({
    docId: documentId,
    stage: nextStage,
    user: user,
    status: nextStage === 'approved' ? 'מאושר סופית' : 'בטיפול',
  });

  setStage(nextStage);
  setSuccessMsg(`התעודה עודכנה בהצלחה ונשלחה לשלב הבא (${nextStage})!`);
} catch (error) {
  console.error("שגיאה בתהליך השמירה:", error);
} finally {
  setIsSaving(false);
}


};

return (


</div>


);
}
