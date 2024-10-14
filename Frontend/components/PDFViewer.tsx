import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation'; // ปลั๊กอินสำหรับการเลื่อนหน้า
import { zoomPlugin } from '@react-pdf-viewer/zoom'; // ปลั๊กอินสำหรับการซูม
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';

const PDFViewer = () => {
  // ปลั๊กอินสำหรับการนำทางหน้า
  const pageNavigationPluginInstance = pageNavigationPlugin();
  // ปลั๊กอินสำหรับการซูม
  const zoomPluginInstance = zoomPlugin();

  // เมื่อ component mount, กำหนด zoom เริ่มต้นที่ 100%
  const setInitialZoom = () => {
    zoomPluginInstance.zoomTo(1); // ซูม 100%
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.14.305/build/pdf.worker.min.js`}>
        <Viewer
          fileUrl="/pdf/26x497-Quiz-167.pdf" // URL ของไฟล์ PDF
          plugins={[pageNavigationPluginInstance, zoomPluginInstance]} // เพิ่มปลั๊กอินการเลื่อนหน้าและการซูม
          onDocumentLoad={setInitialZoom} // เรียกฟังก์ชันเมื่อโหลดเอกสารเสร็จ
        />
      </Worker>

      {/* ปุ่มเลื่อนหน้า */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        {/* ปุ่มไปยังหน้าก่อนหน้า */}
        <button onClick={() => pageNavigationPluginInstance.jumpToPreviousPage()}>
          {'<'} Previous
        </button>

        {/* ปุ่มไปยังหน้าถัดไป */}
        <button onClick={() => pageNavigationPluginInstance.jumpToNextPage()}>
          Next {'>'}
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
