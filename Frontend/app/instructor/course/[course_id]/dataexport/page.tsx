import React from 'react';
import { Loader } from '@mantine/core';
import { Suspense } from 'react';
import ExportHistory from '@/components/INS/INSDataExport/ExportHistory';

export const metadata = {
    title: 'Data Export',
    description: 'Data Export',
};


export default async function ExportHistoryPage() {
    return (
        <div className="w-full">
            <Suspense fallback={<Loader size="sm" />}>
                <ExportHistory />
            </Suspense>
        </div>
    );
}
