import React from 'react';
import LeftProcess from '@/components/LeftINS/LeftProcess';
import INSGrading from '@/components/INS/INSProcess/INSGrading';

export default function INSGradingPage() {
  return (
    <div className="flex min-h-screen">
      <LeftProcess />
      <div className="flex-grow p-4">
        <INSGrading />
      </div>
    </div>
  );
}
