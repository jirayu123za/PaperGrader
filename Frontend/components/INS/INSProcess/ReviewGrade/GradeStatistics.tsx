"use client";

import React, { useState, useMemo } from "react";
import { Card, Title, Text, SimpleGrid, Flex, NumberInput } from "@mantine/core";
import { BarChart } from "@mantine/charts";

interface GradeStatisticsProps {
  scores?: number[];
}

export default function GradeStatistics({ scores }: GradeStatisticsProps) {
  const mockScores = useMemo<number[]>(
    () => Array.from({ length: 50 }, () => Math.floor(Math.random() * 101)),
    []
  );
  const dataScores = scores && scores.length > 0 ? scores : mockScores;

  const FULL_SCORE = 100;
  const minScore = 0;
  const maxScore = FULL_SCORE;
  const [binCount, setBinCount] = useState<number>(20);
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

  const stdDev = useMemo(() => {
    if (dataScores.length === 0) return 0;
    const mu = mean;
    const variance =
      dataScores.reduce((acc, v) => acc + Math.pow(v - mu, 2), 0) / dataScores.length;
    return Math.sqrt(variance);
  }, [dataScores, mean]);


  const gradesData = useMemo(() => {
    if (binCount < 1) return [];
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
  }, [dataScores, binCount]);

  const minimum = useMemo(
    () => (dataScores.length ? Math.min(...dataScores) : 0),
    [dataScores]
  );
  const maximum = useMemo(
    () => (dataScores.length ? Math.max(...dataScores) : 0),
    [dataScores]
  );

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>

      <style jsx global>{`
        .pg-hover-purple .recharts-bar-rectangle:hover path,
        .pg-hover-purple .recharts-bar-rectangle:hover rect,
        .pg-hover-purple .recharts-rectangle:hover {
          fill: #6665ac !important;
        }
      `}</style>

      <Flex justify="space-between" align="center" mb="md">
        <Title order={3}>Review Grades for Test</Title>
        <Flex align="center" gap="xs">
          <Text size="xs" fw={500}>
            Bins:
          </Text>
          <NumberInput
            value={binCount}
            onChange={(v) => setBinCount(typeof v === "number" ? v : 1)}
            min={1}
            max={FULL_SCORE}
            size="xs"
            style={{ width: 60 }}
          />
        </Flex>
      </Flex>

      <div className="pg-hover-purple">
        <BarChart
          h={300}
          data={gradesData}
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
          <Text size="sm" c="dimmed">
            Minimum
          </Text>
          <Text size="xl" fw={700}>
            {minimum.toFixed(2)}
          </Text>
        </div>
        <div>
          <Text size="sm" c="dimmed">
            Median
          </Text>
          <Text size="xl" fw={700}>
            {median.toFixed(2)}
          </Text>
        </div>
        <div>
          <Text size="sm" c="dimmed">
            Maximum
          </Text>
          <Text size="xl" fw={700}>
            {maximum.toFixed(2)}
          </Text>
        </div>
        <div>
          <Text size="sm" c="dimmed">
            Mean
          </Text>
          <Text size="xl" fw={700}>
            {mean.toFixed(2)}
          </Text>
        </div>
        <div>
          <Text size="sm" c="dimmed">
            Std Dev
          </Text>
          <Text size="xl" fw={700}>
            {stdDev.toFixed(2)}
          </Text>
        </div>
      </SimpleGrid>
    </Card>
  );
}
