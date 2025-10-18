"use client";

import React, { useMemo } from "react";
import { Card, Text, SimpleGrid, Center } from "@mantine/core";
import { BarChart } from "@mantine/charts";

export interface ReviewGradeBin {
  lower: number;
  upper: number;
  count: number;
  label: string;
}
export interface ReviewGradeStatistics {
  minimum: number | null;
  median: number | null;
  maximum: number | null;
  mean: number | null;
  sd: number | null;
  total_submission: number;
  total_assignment_score: number;
  submission_scores: number[];
  grades_data: ReviewGradeBin[];
}

export default function GradeStatistics({
  statistics,
}: {
  statistics?: ReviewGradeStatistics;
}) {
  // เรียก useMemo เสมอ (แม้ statistics จะยังไม่มี)
  const chartData = useMemo(
    () =>
      (statistics?.grades_data ?? []).map((b) => ({
        bin: b.label,
        count: b.count,
      })),
    [statistics?.grades_data]
  );

  const minimum = statistics?.minimum ?? null;
  const median = statistics?.median ?? null;
  const maximum = statistics?.maximum ?? null;
  const mean = statistics?.mean ?? null;
  const sd = statistics?.sd ?? null;

  // ค่อยตัดสินใจเรนเดอร์หลังจากเรียกฮุคแล้ว
  if (!statistics) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Center py="md">
          <Text c="dimmed">No statistics yet</Text>
        </Center>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <style jsx global>{`
        .pg-hover-purple .recharts-bar-rectangle:hover path,
        .pg-hover-purple .recharts-bar-rectangle:hover rect,
        .pg-hover-purple .recharts-rectangle:hover {
          fill: #6665ac !important;
        }
      `}</style>

      <div className="pg-hover-purple">
        <BarChart
          h={300}
          data={chartData}
          dataKey="bin"
          series={[{ name: "count", color: "violet.3" }]}
          gridAxis="y"
          tickLine="y"
          xAxisLabel="Score Range"
          yAxisLabel="Number of Students"
          xAxisProps={{ angle: -45, dy: 10, interval: 0, height: 60 }}
          yAxisProps={{ domain: [0, "auto"], tickCount: 6 }}
          tooltipAnimationDuration={150}
          tooltipProps={{
            cursor: false,
            content: ({ payload }) => {
              if (!payload?.length) return null;
              const value = payload[0]?.value;
              return (
                <div
                  style={{
                    background: "rgba(0,0,0,0.75)",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 16,
                    fontWeight: 700,
                    textAlign: "center",
                    minWidth: 32,
                  }}
                >
                  {value}
                </div>
              );
            },
          }}
        />
      </div>

      <SimpleGrid cols={5} mt="md" spacing="lg">
        <div>
          <Text size="sm" c="dimmed">Minimum</Text>
          <Text size="xl" fw={700}>{minimum !== null ? minimum.toFixed(2) : "-"}</Text>
        </div>
        <div>
          <Text size="sm" c="dimmed">Median</Text>
          <Text size="xl" fw={700}>{median !== null ? median.toFixed(2) : "-"}</Text>
        </div>
        <div>
          <Text size="sm" c="dimmed">Maximum</Text>
          <Text size="xl" fw={700}>{maximum !== null ? maximum.toFixed(2) : "-"}</Text>
        </div>
        <div>
          <Text size="sm" c="dimmed">Mean</Text>
          <Text size="xl" fw={700}>{mean !== null ? mean.toFixed(2) : "-"}</Text>
        </div>
        <div>
          <Text size="sm" c="dimmed">Std Dev</Text>
          <Text size="xl" fw={700}>{sd !== null ? sd.toFixed(2) : "-"}</Text>
        </div>
      </SimpleGrid>
    </Card>
  );
}
