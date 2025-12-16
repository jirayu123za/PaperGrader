import React from 'react';
import { Loader } from '@mantine/core';
import { Suspense } from 'react';
import StatisticsSummary from '@/components/INS/INSStatistics/StatisticsSummary';

export const metadata = {
    title: ' Statistics ',
    description: ' Statistics ',
};


export default async function StatisticsPage() {
    return (
        <Suspense fallback={<Loader size="sm" />}>
            <StatisticsSummary  />
        </Suspense>
    );
}
