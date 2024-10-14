import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { scrollModePlugin } from '@react-pdf-viewer/scroll-mode';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

interface PDFViewerProps {
  fileUrl: string; // รับ URL ของไฟล์ PDF
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  const pageNavigationPluginInstance = pageNavigationPlugin();

  const scrollModePluginInstance = scrollModePlugin();
  const zoomPluginInstance = zoomPlugin();
  console.log("PDF URL:", fileUrl);
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
        <div style={{ height: '100%', width: '100%' }}>
          <Viewer
            fileUrl={fileUrl} // ใช้ URL ของ PDF ที่ได้รับจาก prop
            plugins={[pageNavigationPluginInstance, scrollModePluginInstance, zoomPluginInstance]}
          />
        </div>
      </Worker>

      {/* ปุ่มควบคุม PDF ที่ลอยอยู่ในเอกสาร */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          display: 'flex',
          gap: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: '10px',
          borderRadius: '8px',
        }}
      >
        <button onClick={() => pageNavigationPluginInstance.jumpToPreviousPage()} style={{ padding: '5px' }}>
          {'<'} Previous
        </button>
        <ZoomOutButton />
        <ZoomInButton />
        <button onClick={() => pageNavigationPluginInstance.jumpToNextPage()} style={{ padding: '5px' }}>
          Next {'>'}
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
