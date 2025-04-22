'use client';
import React, { useEffect, useState } from 'react';
import STD_LeftMain from '@/components/STD/STD_LeftAss';
import PDFViewer from '@/components/PDFViewer';

const STDAssignment = () => {
  const [data, setData] = useState<any>(null);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <div className="w-1/5 max-w-xs">
        <STD_LeftMain 
          studentId={data.studentId} 
          courseName={data.courseName} 
          instructors={data.instructors} 
        />
      </div>

      {/* Right Content */}
      <div className="grow p-4">
        <PDFViewer /> {/* แสดง PDF Viewer */}
      </div>
    </div>
  );
};

export default STDAssignment;
