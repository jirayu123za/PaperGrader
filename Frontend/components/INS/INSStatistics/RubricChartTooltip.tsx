"use client";

import { Paper, Text, Group, Box, Flex } from "@mantine/core";
import React from "react";

interface RubricChartTooltipProps {
  label?: React.ReactNode;
  payload?: any[];
  total: number;
}

export function RubricChartTooltip({ label, payload, total }: RubricChartTooltipProps) {
  if (!payload || payload.length === 0) return null;

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      {label && (
        <Text fw={600} mb={4}>
          {label}
        </Text>
      )}

      {payload.map((item) => {
        const d = item.payload as {
          label: string;
          value: number;
          color?: string;
        };

        return (
          <Group key={d.label} gap="xs" align="center">
            <Flex gap="sm" align="center" w="100%">
              <Box
                w={10}
                h={10}
                bdrs={999}
                style={{
                  flexShrink: 0,
                  backgroundColor: d.color ?? item.color,
                }}
              />
              <Text size="sm"
                style={{
                  flex: 1,
                  minWidth: 200,
                  maxWidth: 300,
                }}>
                {d.label}
              </Text>
              <Text size="sm" fw="bold" ml="auto"
                style={{
                  flexShrink: 0,
                  marginLeft: 8,
                }}> 
                {d.value}
              </Text>
            </Flex>
          </Group>
        );
      })}
    </Paper>
  );
}
