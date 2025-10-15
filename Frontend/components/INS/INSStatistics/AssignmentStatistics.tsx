"use client";

import React, { useMemo, useRef, useCallback, useState } from "react";
import { Card, Title, Text, Flex, SimpleGrid } from "@mantine/core";
import { BarChart } from "@mantine/charts";

interface QuestionStat {
  question: string;
  mean: number;
}

interface GradeStatisticsProps {
  assignmentName: string;
  questions?: QuestionStat[];
  initialChartHeight?: number;
  compact?: boolean;
  minHeight?: number;
  maxHeight?: number;
}

export default function AssignmentStatistics({
  assignmentName,
  questions,
  initialChartHeight = 220,
  compact = true,
  minHeight = 120,
  maxHeight = 480,
}: GradeStatisticsProps) {
  const data = questions ?? [];

  const means = useMemo(() => data.map((d) => d.mean), [data]);
  const minimum = useMemo(() => (means.length ? Math.min(...means) : 0), [means]);
  const maximum = useMemo(() => (means.length ? Math.max(...means) : 0), [means]);
  const average = useMemo(
    () => (means.length ? means.reduce((s, v) => s + v, 0) / means.length : 0),
    [means]
  );

  const median = useMemo(() => {
    if (!means.length) return 0;
    const sorted = [...means].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }, [means]);

  const stdDev = useMemo(() => {
    if (!means.length) return 0;
    const mu = average;
    const variance =
      means.reduce((acc, v) => acc + Math.pow(v - mu, 2), 0) / means.length;
    return Math.sqrt(variance);
  }, [means, average]);

  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const [chartHeight, setChartHeight] = useState(initialChartHeight);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientY - startYRef.current;
      setChartHeight((prev) =>
        Math.max(minHeight, Math.min(maxHeight, prev + delta))
      );
    },
    [minHeight, maxHeight]
  );

  const endDrag = useCallback(() => {
    draggingRef.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", endDrag);
  }, [onMouseMove]);

  const onHandleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      startYRef.current = e.clientY;
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", endDrag);
    },
    [onMouseMove, endDrag]
  );
  if (data.length === 0) return null;

  return (
    <Card shadow="sm" padding={compact ? "md" : "lg"} radius="md" withBorder>
      <style jsx global>{`
        .pg-hover-purple .recharts-bar-rectangle:hover path,
        .pg-hover-purple .recharts-bar-rectangle:hover rect,
        .pg-hover-purple .recharts-rectangle:hover {
          fill: #6665ac !important;
        }
      `}</style>

      <Flex justify="space-between" align="center" mb={compact ? "sm" : "md"}>
        <Title order={compact ? 4 : 3}>Review Grades for {assignmentName}</Title>
      </Flex>

      <div
        className="relative select-none rounded-md border border-transparent hover:border-gray-300 pg-hover-purple"
        style={{ paddingBottom: 10 }}
      >
        <BarChart
          h={chartHeight}
          data={data}
          dataKey="question"
          series={[{ name: "mean", color: "violet.3" }]}
          xAxisLabel="Question"
          yAxisLabel="Mean (%)"
          yAxisProps={{ domain: [0, 100], tickCount: 6 }}
          tooltipAnimationDuration={150}
          tooltipProps={{
            cursor: false,
            content: ({ label, payload }) => {
              if (!payload?.length) return null;
              const value = payload[0]?.value;
              return (
                <div
                  style={{
                    background: "rgba(0,0,0,0.75)",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <div style={{ fontWeight: 500 }}>Question {label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{value}% Mean</div>
                </div>
              );
            },
          }}
        />
        <div
          onMouseDown={onHandleMouseDown}
          title="Drag to resize"
          className="absolute left-0 right-0 bottom-0 h-3 flex items-center justify-center cursor-ns-resize"
          style={{ borderTop: "1px dashed rgba(148,163,184,0.6)", userSelect: "none" }}
        >
          <div className="w-16 h-1 rounded" style={{ background: "rgba(148,163,184,0.9)" }} />
        </div>
      </div>

      <SimpleGrid cols={5} mt={compact ? "sm" : "md"} spacing={compact ? "md" : "lg"}>
        <div>
          <Text size={compact ? "xs" : "sm"} c="dimmed">
            Minimum
          </Text>
          <Text size={compact ? "lg" : "xl"} fw={700}>
            {minimum.toFixed(2)}%
          </Text>
        </div>
        <div>
          <Text size={compact ? "xs" : "sm"} c="dimmed">
            Median
          </Text>
          <Text size={compact ? "lg" : "xl"} fw={700}>
            {median.toFixed(2)}%
          </Text>
        </div>
        <div>
          <Text size={compact ? "xs" : "sm"} c="dimmed">
            Maximum
          </Text>
          <Text size={compact ? "lg" : "xl"} fw={700}>
            {maximum.toFixed(2)}%
          </Text>
        </div>
        <div>
          <Text size={compact ? "xs" : "sm"} c="dimmed">
            Mean
          </Text>
          <Text size={compact ? "lg" : "xl"} fw={700}>
            {average.toFixed(2)}%
          </Text>
        </div>
        <div>
          <Text size={compact ? "xs" : "sm"} c="dimmed">
            Std Dev
          </Text>
          <Text size={compact ? "lg" : "xl"} fw={700}>
            {stdDev.toFixed(2)}%
          </Text>
        </div>
      </SimpleGrid>
    </Card>
  );
}
