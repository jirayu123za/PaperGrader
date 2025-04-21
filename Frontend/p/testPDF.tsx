import React from 'react';
import PDFViewer from '../components/PDFViewer'; // อ้างอิงไปยัง component ที่แสดงผล PDF

export default function TestPDFPage() {
  return (
    <div>
      <h1>Test PDF Viewer</h1>
      <PDFViewer />
    </div>
  );
}
