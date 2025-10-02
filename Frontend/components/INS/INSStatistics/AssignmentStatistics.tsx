"use client";

import React, { useMemo, useRef, useCallback } from "react";
import { Card, Title, Text, Flex, NumberInput, SimpleGrid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { BarChart } from "@mantine/charts";

interface GradeStatisticsProps {
  scores?: number[];
  assignmentName: string;
  initialChartHeight?: number;
  initialBinCount?: number;
  compact?: boolean;
  minHeight?: number;
  maxHeight?: number;
}

export default function AssignmentStatistics({
  scores,
  assignmentName,
  initialChartHeight = 220,
  initialBinCount = 20,
  compact = true,
  minHeight = 120,
  maxHeight = 480,
}: GradeStatisticsProps) {

  const mockScores = useMemo<number[]>(
    () => Array.from({ length: 50 }, () => Math.floor(Math.random() * 101)),
    []
  );
  const dataScores = scores && scores.length > 0 ? scores : mockScores;

  const FULL_SCORE = 100;
  const minScore = 0;
  const maxScore = FULL_SCORE;

  const form = useForm({
    initialValues: {
      binCount: initialBinCount,
      chartHeight: initialChartHeight,
    },
  });


  const sorted = useMemo(() => [...dataScores].sort((a, b) => a - b), [dataScores]);
  const mean =
    dataScores.length > 0
      ? dataScores.reduce((sum, v) => sum + v, 0) / dataScores.length
      : 0;
  const median = useMemo(() => {
    const len = sorted.length;
    if (len === 0) return 0;
    const mid = Math.floor(len / 2);
    return len % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }, [sorted]);

  const gradesData = useMemo(() => {
    const binCount = Math.max(1, form.values.binCount || 1);
    const range = maxScore - minScore;
    const size = range / binCount;
    return Array.from({ length: binCount }, (_, i) => {
      const lower = minScore + i * size;
      const upper = i === binCount - 1 ? maxScore : lower + size;
      const count = dataScores.filter((v) =>
        i === binCount - 1 ? v >= lower && v <= upper : v >= lower && v < upper
      ).length;
      return {
        bin: `${Math.ceil(lower)}–${Math.floor(upper)}`,
        count,
      };
    });
  }, [dataScores, form.values.binCount]);

  const stats = useMemo(
    () => [
      { label: "Minimum", value: Math.min(...dataScores, 0) },
      { label: "Median", value: median },
      { label: "Maximum", value: Math.max(...dataScores, 0) },
      { label: "Mean", value: mean },
    ],
    [dataScores, median, mean]
  );


  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(form.values.chartHeight);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientY - startYRef.current;
      const next = Math.max(
        minHeight,
        Math.min(maxHeight, Math.round(startHeightRef.current + delta))
      );
      form.setFieldValue("chartHeight", next);
    },
    [form, minHeight, maxHeight]
  );

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", endDrag);
  }, [onMouseMove]);

  const onHandleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      startYRef.current = e.clientY;
      startHeightRef.current = form.values.chartHeight;
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", endDrag);
    },
    [form.values.chartHeight, onMouseMove, endDrag]
  );

  const resetHeight = useCallback(() => {
    form.setFieldValue("chartHeight", initialChartHeight);
  }, [form, initialChartHeight]);

  return (
    <Card shadow="sm" padding={compact ? "md" : "lg"} radius="md" withBorder>

      <Flex justify="space-between" align="center" mb={compact ? "sm" : "md"} wrap="wrap" gap="xs">
        <Title order={compact ? 4 : 3} style={{ whiteSpace: "nowrap" }}>
          Review Grades for {assignmentName}
        </Title>

        <Flex align="center" gap="sm" wrap="wrap">
          <Flex align="center" gap={6}>
            <Text size="xs" fw={500}>
              Bins
            </Text>
            <NumberInput
              value={form.values.binCount}
              onChange={(v) => form.setFieldValue("binCount", typeof v === "number" ? v : 1)}
              min={1}
              max={FULL_SCORE}
              size="xs"
              style={{ width: 72 }}
            />
          </Flex>
        </Flex>
      </Flex>


      <div
        className="relative select-none rounded-md border border-transparent hover:border-gray-300"
        style={{ paddingBottom: 10 }}
        onDoubleClick={resetHeight}
      >
        <BarChart
          h={form.values.chartHeight}
          data={gradesData}
          dataKey="bin"
          series={[{ name: "count", color: "blue.6" }]}
          gridAxis="y"
          tickLine="y"
          xAxisLabel="Score Range"
          yAxisLabel="Number of Students"
          xAxisProps={{
            angle: -45,
            dy: 10,
            interval: 0,
            height: compact ? 48 : 60,
          }}
          yAxisProps={{
            domain: [0, "auto"],
            tickCount: compact ? 5 : 6,
          }}
        />

        <div
          onMouseDown={onHandleMouseDown}
          title="Drag to resize"
          className="absolute left-0 right-0 bottom-0 h-3 flex items-center justify-center cursor-ns-resize"
          style={{

            borderTop: "1px dashed rgba(148,163,184,0.6)", 
            userSelect: "none",
          }}
        >
          <div
            className="w-16 h-1 rounded"
            style={{ background: "rgba(148,163,184,0.9)" }}
          />
        </div>
      </div>

      <SimpleGrid cols={4} mt={compact ? "sm" : "md"} spacing={compact ? "md" : "lg"}>
        {stats.map((stat) => (
          <div key={stat.label}>
            <Text size={compact ? "xs" : "sm"} c="dimmed">
              {stat.label}
            </Text>
            <Text size={compact ? "lg" : "xl"} fw={700}>
              {stat.value.toFixed(2)}
            </Text>
          </div>
        ))}
      </SimpleGrid>
    </Card>
  );
}
