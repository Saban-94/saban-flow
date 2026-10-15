import { createFileRoute } from '@tanstack/react-router';
import DeliveryCanvasEditor from '@/components/DeliveryCanvasEditor';

export const Route = createFileRoute('/canvas')({
  component: CanvasPageRoute,
});

function CanvasPageRoute() {
  const handleSaveToFolder = async (dataUrl: string) => {
    console.log('Saving to customer folder...', dataUrl);
    // כאן תוסיף את הקריאה ל־API / Google Apps Script לשמירה ב־Drive
    alert('התעודה נשמרה בהצלחה בתיקיית הלקוח ונשלחה להראל!');
  };

  const handleUpdateSheetLog = async (status: string) => {
    console.log('Updating sheet status to:', status);
    // כאן תוסיף את העדכון לגיליון "מערכת מאוחדת"
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">עריכת תעודת משלוח וחתימה — נועה AI</h1>
      <DeliveryCanvasEditor
        imageSrc="/assets/delivery-note.jpg" // או לינק דינמי מתעודת המשלוח
        stampSrc="/assets/noa.jpg" // חותמת או לוגו אישור
        onSaveToFolder={handleSaveToFolder}
        onUpdateSheetLog={handleUpdateSheetLog}
      />
    </div>
  );
}
