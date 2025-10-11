"use client";

import { useMemo, useState } from "react";
import {Modal,Group,Stack,Text,Tooltip,ScrollArea,Box,Divider,useMantineTheme,rem,} from "@mantine/core";
import { PieChart } from "@mantine/charts";
import type { PieProps, SectorProps } from "recharts";
import { Sector } from "recharts";

export type RubricSlice = {
  id: string;
  label: string;
  value: number;
  color?: string;
};

type RubricPieModalProps = {
  opened: boolean;
  onClose: () => void;
  title?: string;
  data?: RubricSlice[];
  height?: number;
};

const mockData: RubricSlice[] = [
  { id: "r1", label: "Excellent", value: 14, color: "#845EF7" },
  { id: "r2", label: "Good", value: 12, color: "#BE4BDB" },
  { id: "r3", label: "Fair", value: 10, color: "#4C6EF5" },
  { id: "r4", label: "Poor", value: 8, color: "#228BE6" },
];

function darken(hex: string, amount = 0.15) {
  const n = (h: string) => parseInt(h, 16);
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  const r = n(hex.slice(1, 3)),
    g = n(hex.slice(3, 5)),
    b = n(hex.slice(5, 7));
  return `#${c(r * (1 - amount))}${c(g * (1 - amount))}${c(b * (1 - amount))}`;
}

export default function RubricPieModal({
  opened,
  onClose,
  data,
  title = "Rubric breakdown",
  height = 280,
}: RubricPieModalProps) {
  const theme = useMantineTheme();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const sourceData = data && data.length > 0 ? data : mockData;

  const palette = useMemo(() => {
    const order = [
      "violet",
      "grape",
      "indigo",
      "blue",
      "cyan",
      "teal",
      "green",
      "lime",
      "orange",
      "red",
    ];
    return order.map((k) => theme.colors[k]?.[6] || "#8884d8");
  }, [theme]);

  const chartData = useMemo(
    () =>
      sourceData.map((d, i) => ({
        name: d.label,
        value: d.value,
        color: d.color || palette[i % palette.length],
      })),
    [sourceData, palette]
  );

  const total = useMemo(
    () => sourceData.reduce((s, d) => s + d.value, 0),
    [sourceData]
  );

  const renderActive: PieProps["activeShape"] = (props: SectorProps) => {
    const fill = (props as any).fill as string;
    return (
      <g>
        <Sector
          {...props}
          outerRadius={(props.outerRadius as number) + 8}
          stroke={darken(fill, 0.35)}
          strokeWidth={2}
        />
      </g>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>{title}</Text>}
      size="lg"
      centered
      styles={{
        content: { background: "#ffffff", color: "#1f2937" },
        header: { background: "#ffffff", borderBottom: "1px solid #e9ecef" },
        body: { background: "#ffffff" },
      }}
      overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
    >
      <Group align="start" wrap="nowrap">
        <Box w="60%" style={{ minWidth: 280 }}>
          <PieChart
            key={opened ? "open" : "closed"}
            data={chartData}
            size={height}
            withTooltip
            tooltipDataSource="segment"
            paddingAngle={2}
            pieProps={{
              innerRadius: 40,
              onMouseEnter: (_: any, idx: number) => setActiveIndex(idx),
              onMouseLeave: () => setActiveIndex(undefined),
              activeIndex,
              activeShape: renderActive,
              isAnimationActive: false,
              stroke: theme.colors.gray[2],
              strokeWidth: 1,
            }}
            tooltipProps={{
              labelFormatter: (label: string) => label,
              formatter: (value: number, _name: string, payload: any) => {
                const v = Number(value);
                const pct = total ? ((v / total) * 100).toFixed(1) : "0.0";
                return [`${v} (${pct}%)`, payload?.payload?.name];
              },
            }}
          />
          <Divider my="xs" color="#e9ecef" />
          <Text size="sm" c="dimmed">
            รวมทั้งหมด:{" "}
            <Text span fw={600} c="dark">
              {total}
            </Text>{" "}
            คน
          </Text>
        </Box>

        <Box w="40%">
          <ScrollArea.Autosize mah={height} type="auto">
            <Stack gap="xs">
              {chartData.map((item, i) => {
                const hovered = i === activeIndex;
                return (
                  <Group
                    key={i}
                    gap="sm"
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                    style={{
                      background: hovered ? "#f6f8fa" : "transparent",
                      borderRadius: rem(8),
                      padding: rem(8),
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      w={12}
                      h={12}
                      style={{
                        borderRadius: 3,
                        background: hovered
                          ? darken(item.color, 0.15)
                          : item.color,
                        outline: hovered
                          ? `2px solid ${darken(item.color, 0.35)}`
                          : "none",
                      }}
                    />
                    <Tooltip label={item.name} withArrow withinPortal>
                      <Text
                        size="sm"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "16rem",
                          color: "#374151",
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </Text>
                    </Tooltip>
                    <Box style={{ marginLeft: "auto" }}>
                      <Text size="sm" fw={700} c="dark">
                        {item.value}
                      </Text>
                    </Box>
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
