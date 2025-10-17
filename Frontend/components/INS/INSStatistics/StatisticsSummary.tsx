"use client";

import { Card, Stack, Skeleton, Text } from "@mantine/core";
import StatisticHeader from "@/components/INS/Header/StatisticHeader";
import AssignmentStatistics from "@/components/INS/INSStatistics/AssignmentStatistics";
import RubricTable from "@/components/INS/INSStatistics/RubricTable";
import { useFetchStatistics } from "@/hooks/Statistic/useFetchStatistics";

export default function StatisticsSunmary() {
  // ดึงข้อมูลสรุปทั้งหมดจาก backend (ยิงเองอัตโนมัติเมื่อ header เลือกครบ)
  const { data, isFetching, isError, error } = useFetchStatistics();

  return (
    <Stack gap="md">
      <StatisticHeader title="Assignment Statistics" />

      <Card withBorder radius="md" p="md">
        {isFetching ? (
          <Skeleton height={220} />
        ) : isError ? (
          <Text c="red">Failed to load statistics: {(error as Error)?.message}</Text>
        ) : data ? (
          <AssignmentStatistics stats={data.statistics} />
        ) : (
          <Text c="dimmed">Select assignment and sections to view statistics.</Text>
        )}
      </Card>

      <Card withBorder radius="md" p="md">
        {isFetching ? (
          <>
            <Skeleton height={28} mb="sm" />
            <Skeleton height={180} />
          </>
        ) : isError ? (
          <Text c="red">Failed to load questions: {(error as Error)?.message}</Text>
        ) : data ? (
          <RubricTable questions={data.questions_list} />
        ) : null}
      </Card>
    </Stack>
  );
}
