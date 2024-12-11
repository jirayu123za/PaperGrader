import React from 'react';
import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import INSCreateRubric from '../../../../../components/INS/INSProcess/INSCreateRubric';

export default function CreateRubric() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <LeftProcess />
            <div className="flex-grow p-6">
                <INSCreateRubric />
            </div>
        </div>
    );
}
