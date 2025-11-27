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

export function ReviewStatsChartTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="sm" w="200px">
      <Text fw={600} mb={4}>
        Score range {label}
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
          Total students:{" "}
            <Box component="span" ml="xl">
              {item.value !== undefined ? item.value : "-"}
            </Box>
        </Text>
      </Group>
    </Paper>
  );
}
