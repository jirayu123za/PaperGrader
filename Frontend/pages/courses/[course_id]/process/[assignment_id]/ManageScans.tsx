import React from 'react';
import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import INSManageScans from '../../../../../components/INS/INSProcess/INSManageScans';

export default function INSManageScanspage() {
  return (
    <div className="flex min-h-screen">
      <LeftProcess />
      <div className="flex-grow p-4">
        <INSManageScans />
      </div>
    </div>
  );
}
