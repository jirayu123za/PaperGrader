import React from 'react';
import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import INSCreateRubric from '../../../../../components/INS/INSProcess/INSCreateRubric';

export default function CreateRubricPage() {
  return (
    <div className="flex min-h-screen">
      <LeftProcess />
      <div className="flex-grow p-4">
        <INSCreateRubric />
      </div>
    </div>
  );
}
