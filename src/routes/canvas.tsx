import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import DeliveryCanvasEditor from '@/components/DeliveryCanvasEditor';
import { NOTES } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const Route = createFileRoute('/canvas')({
  component: CanvasPageRoute,
});

function CanvasPageRoute() {
  // בחירת תעודה מתוך הרשימה או ברירת מחדל
  const [selectedNoteId, setSelectedNoteId] = useState(NOTES[0]?.id || '1');
  
  // מיפוי תמונת סריקה לדוגמה (או קובץ PDF שהומר לתמונה)
  const currentNote = NOTES.find(n => n.id === selectedNoteId) || NOTES[0];
  const scanImageSrc = `/assets/scans/p02.jpg`; // או תמונה דינמית מתוך תיקיית הלקוח/סריקות

  const handleSaveToFolder = async (dataUrl: string) => {
    // שמירה בתיקיית הלקוח ב־Google Drive / שרת
    console.log('Saving final canvas to customer folder...', dataUrl);
    toast.success(`תעודה עבור לקוח ${currentNote.customer} נשמרה בהצלחה בתיקיית הלקוח! 📁`);
  };

  const handleUpdateSheetLog = async (statusMessage: string) => {
    // עדכון בגיליון "מערכת מאוחדת" / "נועה AI"
    console.log('Updating Google Sheets status:', statusMessage);
    toast.info(`סטטוס עודכן בגיליון: ${statusMessage}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">עריכה ובדיקת תעודת משלוח (Canvas)</h1>
          <p className="text-xs text-muted-foreground mt-1">
            ח. סבן חומרי בניין · מעקב בדיקות: ראמי ➔ ואחר ➔ הראל מנכ״ל
          </p>
        </div>

        {/* בורר תעודות מהיר */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {NOTES.slice(0, 5).map((note) => (
            <Button
              key={note.id}
              size="sm"
              variant={selectedNoteId === note.id ? "default" : "outline"}
              onClick={() => {
                setSelectedNoteId(note.id);
                toast.info(`נטענה תעודה #${note.comaxOrder || note.id} - ${note.customer}`);
              }}
              className="text-xs rounded-xl shrink-0"
            >
              #{note.comaxOrder || note.id} ({note.customer})
            </Button>
          ))}
        </div>
      </div>

      {/* קומפוננטת הקנבס המלאה */}
      <DeliveryCanvasEditor
        imageSrc={scanImageSrc}
        stampSrc="/assets/noa.jpg"
        onSaveToFolder={handleSaveToFolder}
        onUpdateSheetLog={handleUpdateSheetLog}
      />
    </div>
  );
}
