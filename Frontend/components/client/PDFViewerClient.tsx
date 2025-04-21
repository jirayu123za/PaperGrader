"use client";

import React, { useEffect, useState } from 'react';

export default function PDFViewerClient({ courseId, assignmentId }: { courseId: string, assignmentId: string }) {
  const [PDFViewer, setPDFViewer] = useState<any>(null);

  useEffect(() => {
    import('../PDFViewer').then((mod) => {
      setPDFViewer(() => mod.default);
    });
  }, []);

  if (!PDFViewer) return null; // หรือ <Loader />

  return <PDFViewer courseId={courseId} assignmentId={assignmentId} />;
}
