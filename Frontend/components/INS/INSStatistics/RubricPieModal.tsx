"use client";

import { useMemo, useState } from "react";
import { Modal, Group, Stack, Text, Tooltip, ScrollArea, Box, Divider, useMantineTheme, rem } from "@mantine/core";
import { PieChart } from "@mantine/charts";
import type { PieProps, SectorProps } from "recharts";
import { Sector } from "recharts";

export type RubricSlice = { id: string; label: string; value: number; color?: string; };

type RubricPieModalProps = { opened: boolean; onClose: () => void; title?: string; data?: RubricSlice[]; height?: number; };

const mockData: RubricSlice[] = [
  { id: "r1", label: "Excellent", value: 14 },
  { id: "r2", label: "Good", value: 12 },
  { id: "r3", label: "Fair", value: 10 },
  { id: "r4", label: "Poor", value: 8 },
];

function darken(hex: string, amount = 0.15) {
  const n = (h: string) => parseInt(h, 16), c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  const r = n(hex.slice(1, 3)), g = n(hex.slice(3, 5)), b = n(hex.slice(5, 7));
  return `#${c(r * (1 - amount))}${c(g * (1 - amount))}${c(b * (1 - amount))}`;
}

export default function RubricPieModal({ opened, onClose, data, title = "Rubric breakdown", height = 340 }: RubricPieModalProps) {
  const theme = useMantineTheme();
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);
  const sourceData = data && data.length > 0 ? data : mockData;

  const customPalette = useMemo(
    () => ["#6665AC", "#845EF7", "#BE4BDB", "#4C6EF5", "#228BE6", "#15AABF", "#12B886", "#40C057", "#FAB005", "#FA5252"],
    []
  );

  const chartData = useMemo(() => sourceData.map((d, i) => ({ name: d.label, value: d.value, color: d.color || customPalette[i % customPalette.length] })), [sourceData, customPalette]);
  const total = useMemo(() => sourceData.reduce((s, d) => s + d.value, 0), [sourceData]);

  const maxIndex = useMemo(() => {
    if (!sourceData.length) return 0;
    return sourceData.reduce((max, d, i, arr) => (d.value > arr[max].value ? i : max), 0);
  }, [sourceData]);

  const emphasisIndex = hoverIndex ?? maxIndex;
  const activeDelta = 6;
  const paddingX = 24, paddingY = 16;
  const outerRadius = Math.max(40, Math.floor(height / 2 - Math.max(paddingX, paddingY) - activeDelta));
  const innerRadius = Math.max(24, Math.floor(outerRadius * 0.45));

  const renderActive: PieProps["activeShape"] = (props: SectorProps) => {
    const fill = (props as any).fill as string;
    const { cx, cy, startAngle, endAngle } = props;
    return <g><Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + activeDelta} startAngle={startAngle} endAngle={endAngle} fill={fill} stroke={darken(fill, 0.2)} strokeWidth={0} /></g>;
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={600}>{title}</Text>} size="60%" centered
      styles={{ content: { background: "#ffffff", color: "#1f2937", overflow: "visible" }, body: { background: "#ffffff", overflow: "visible" }, header: { background: "#ffffff", borderBottom: "1px solid #e9ecef" } }}
      overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}>
      <Group align="start" wrap="nowrap" gap="lg">
        <Box w="65%" style={{ minWidth: 360, overflow: "visible", padding: `${paddingY}px ${paddingX}px` }}>
          <PieChart
            data={chartData}
            size={height}
            withTooltip
            tooltipDataSource="segment"
            paddingAngle={2}
            pieProps={{
              cx: "50%",
              cy: "50%",
              innerRadius,
              outerRadius,
              onMouseEnter: (_: any, idx: number) => setHoverIndex(idx),
              onMouseLeave: () => setHoverIndex(undefined),
              activeIndex: emphasisIndex,
              activeShape: renderActive,
              isAnimationActive: false,
              stroke: "none",
              strokeWidth: 0,
            }}
            tooltipProps={{
              labelFormatter: (label: string) => label,
              formatter: (value: number, _name: string, payload: any) => {
                const v = Number(value); const pct = total ? ((v / total) * 100).toFixed(1) : "0.0";
                return [`${v} (${pct}%)`, payload?.payload?.name];
              },
            }}
          />
          <Divider my="xs" color="#e9ecef" />
          <Text size="sm" c="dimmed">รวมทั้งหมด: <Text span fw={600} c="dark">{total}</Text> คน</Text>
        </Box>

        <Box w="35%">
          <ScrollArea.Autosize mah={height} type="auto">
            <Stack gap="xs">
              {chartData.map((item, i) => {
                const isMax = i === maxIndex, hovered = i === hoverIndex, bg = hovered ? "#f6f8fa" : isMax ? "#f9fafb" : "transparent";
                return (
                  <Group key={i} gap="sm" onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(undefined)}
                    style={{ background: bg, borderRadius: rem(8), padding: rem(8), cursor: "pointer", outline: isMax && !hovered ? `2px dashed ${darken(item.color, 0.35)}` : "none" }}>
                    <Box w={12} h={12} style={{ borderRadius: 3, background: hovered || isMax ? darken(item.color, 0.15) : item.color, outline: hovered ? `2px solid ${darken(item.color, 0.35)}` : "none" }} title={item.name} />
                    <Tooltip label={item.name} withArrow withinPortal>
                      <Text size="sm" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "18rem", color: "#374151", fontWeight: isMax ? 700 : 500 }} title={item.name}>{item.name}</Text>
                    </Tooltip>
                    <Box style={{ marginLeft: "auto" }}><Text size="sm" fw={700} c={isMax ? "dark" : undefined}>{item.value}</Text></Box>
                  </Group>
                );
              })}
            </Stack>
          </ScrollArea.Autosize>
        </Box>
      </Group>
    </Modal>
  );
}
