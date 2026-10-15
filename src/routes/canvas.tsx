import { createFileRoute } from '@tanstack/react-router';
import DeliveryCanvasEditor from '@/components/DeliveryCanvasEditor';

export const Route = createFileRoute('/canvas')({
  component: CanvasPageRoute,
});

function CanvasPageRoute() {
  const handleSaveToFolder = async (dataUrl: string) => {
    console.log('Saved to customer folder:', dataUrl);
  };

  const handleUpdateSheetLog = async (status: string) => {
    console.log('Sheet status updated:', status);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">עריכה ובדיקת תעודות משלוח (Canvas)</h1>
        <p className="text-xs text-muted-foreground mt-1">
          ח. סבן חומרי בניין · בדיקת ראמי, בדיקה נוספת ואישור סופי של הראל
        </p>
      </div>

      <DeliveryCanvasEditor
        imageSrc="/assets/delivery-note.jpg"
        stampSrc="/assets/noa.jpg"
        onSaveToFolder={handleSaveToFolder}
        onUpdateSheetLog={handleUpdateSheetLog}
      />
    </div>
  );
}
