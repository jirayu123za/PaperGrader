"use client";

import { Paper, Text, Group, Box } from "@mantine/core";

interface ChartTooltipProps {
  label?: React.ReactNode;
  payload?: Record<string, any>[];
}

function toFixedDown(value: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

export function StatsChartTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload || payload.length === 0) return null;

  const item = payload[0];
  const rawValue = item.value as number | undefined;

  const truncated = typeof rawValue === "number" && Number.isFinite(rawValue)
    ? toFixedDown(rawValue, 2)
    : null;

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="sm" w="200px">
      <Text fw={600} mb={4}>
        Question {label}
      </Text>

      <Group gap="xs">
        <Box
          style={{
            width: 12,
            height: 12,
            borderRadius: "999px",
            backgroundColor: item.color,
          }}
        />
        <Text fz="sm">
          Mean (%):{" "}
            <Box component="span" ml="xl">
              {truncated !== null ? truncated.toFixed(2) : "-"}
            </Box>
        </Text>
      </Group>
    </Paper>
  );
}
