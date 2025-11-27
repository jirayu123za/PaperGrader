"use client";

import React, { useMemo } from "react";
import { Card, Text, SimpleGrid, Center } from "@mantine/core";
import { BarChart } from "@mantine/charts";
import { useReviewGradeStore } from "@/store/reviewGrade/useReviewGradeStore";
import { ReviewStatsChartTooltip } from "@/components/INS/INSProcess/ReviewGrade/ReviewStatsChartTooltip";

export default function GradeStatistics() {
  const { gradeStatistics } = useReviewGradeStore();

  const chartData = useMemo(
    () =>
      (gradeStatistics?.grades_data ?? []).map((b) => ({
        bin: b.label,
        count: b.count,
      })),
    [gradeStatistics?.grades_data]
  );

  return (
    <Card 
      withBorder
      radius="lg"
      p="lg"
      shadow="sm"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}>

      <SimpleGrid cols={{ base: 1, sm: 3, md: 6 }} spacing="sm" mb="md">
        <StatBox label="Minimum" value={gradeStatistics?.minimum} />
        <StatBox label="Median" value={gradeStatistics?.median} />
        <StatBox label="Maximum" value={gradeStatistics?.maximum} />
        <StatBox label="Mean" value={gradeStatistics?.mean} />
        <StatBox label="Std Dev" value={gradeStatistics?.sd} />
        <StatBox label="Total Score" value={gradeStatistics?.total_assignment_score} />
      </SimpleGrid>

      <Card withBorder radius="md" p="md">
        <BarChart
          h={300}
          data={chartData}
          withLegend
          series={[{ name: "count", label: "Total students", color: "violet.3" }]}
          dataKey="bin"
          gridAxis="xy"
          tickLine="xy"
          xAxisLabel="Score range"
          yAxisLabel="Number of Students"
          tooltipAnimationDuration={200}
          tooltipProps={{
            content: ({ label, payload }) => (
              <ReviewStatsChartTooltip label={label} payload={payload} />
            ),
          }}
        />
      </Card>
    </Card>
  );
}

function StatBox({ label, value }: { label: string; value?: number | null; }) {
  const formattedValue = typeof value === "number" && !isNaN(value) ? value.toFixed(2) : "-";
  return (
    <Card withBorder radius="md" p="sm">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={700} size="lg">
        {formattedValue}
      </Text>
    </Card>
  );
}