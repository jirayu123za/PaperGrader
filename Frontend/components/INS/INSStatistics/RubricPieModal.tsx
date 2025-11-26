import type { PieProps, SectorProps } from "recharts";
import type { PieChartCell } from "@mantine/charts";
import { useMemo, useState } from "react";
import { Modal, Group, Stack, Text, Tooltip, ScrollArea, Box, Divider, rem, Image, Flex } from "@mantine/core";
import { PieChart } from "@mantine/charts";
import { Sector } from "recharts";
import { useStatisticsStore } from "@/store/statistic/useStatisticsStore";
import { NoRubricPieModal } from "@/components/INS/INSStatistics/NoRubricPieModal";
import { RubricChartTooltip } from "@/components/INS/INSStatistics/RubricChartTooltip";

type RubricSlice = PieChartCell & {
  id: string;
  name: string;
  label: string;
  value: number;
  color: string;
};

type RubricDetail = {
  rubric_id: string;
  description?: string | null;
  totals_select: number;
};

type RubricPieModalProps = {
  opened: boolean;
  onClose: () => void;
  questionID: string | null;
  subQuestionID?: string | null;
};

function darken(hex: string, amount = 0.15) {
  const n = (h: string) => parseInt(h, 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  const r = n(hex.slice(1, 3));
  const g = n(hex.slice(3, 5));
  const b = n(hex.slice(5, 7));
  return `#${c(r * (1 - amount))}${c(g * (1 - amount))}${c(b * (1 - amount))}`;
}

export default function RubricPieModal({ opened, onClose, questionID, subQuestionID }: RubricPieModalProps) {
  const height = 315;
  const { statisticsData: stats } = useStatisticsStore();
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);

  const { rubric, title } = useMemo(() => {
    if (!stats || !questionID) {
      return { rubric: null as any, title: "" };
    }

    const question = stats.questions_list.find(
      (q) => q.question_id === questionID
    );
    
    if (!question) return { rubric: null, title: "" };

    if (subQuestionID) {
      const sub = question.sub_questions?.find(
        (sq) => sq.sub_question_id === subQuestionID
      );
      return {
        rubric: sub?.rubric ?? null,
        title: `${sub?.question_number ?? ""} ${sub?.sub_question_title ?? ""}`.trim(),
      };
    }

    return {
      rubric: question.rubric ?? null,
      title: `${question.question_number} ${question.question_title ?? ""}`.trim(),
    };
  }, [stats, questionID, subQuestionID]);

  const FALLBACK_LABEL = "Not assigned descriptions";
  const sourceData: RubricSlice[] = useMemo(() => {
    if (!rubric || !Array.isArray(rubric.rubrics_detail)) return [];
    return (rubric.rubrics_detail as RubricDetail[]).map((r) => ({
      id: String(r.rubric_id),
      name: String(r.rubric_id),
      label: r.description && r.description.trim().length > 0 ? r.description : FALLBACK_LABEL,
      value: Number(r.totals_select ?? 0),
      color: "",
    }));
  }, [rubric]);

  const customPalette = useMemo(
    () => [
      "#6665AC",
      "#845EF7",
      "#BE4BDB",
      "#4C6EF5",
      "#228BE6",
      "#15AABF",
      "#12B886",
      "#40C057",
      "#FAB005",
      "#FA5252",
    ],
    []
  );

  const chartData: RubricSlice[] = useMemo(
    () =>
      sourceData.map((d, i) => ({
        ...d,
        color: d.color || customPalette[i % customPalette.length],
      })),
    [sourceData, customPalette]
  );

  const total = useMemo(
    () => sourceData.reduce((s, d) => s + d.value, 0),
    [sourceData]
  );

  const maxIndex = useMemo(() => {
    if (!sourceData.length) return 0;
    return sourceData.reduce(
      (max, d, i, arr) => (d.value > arr[max].value ? i : max),
      0
    );
  }, [sourceData]);

  const emphasisIndex = hoverIndex ?? maxIndex;
  const activeDelta = 6;
  const paddingX = 24, paddingY = 16;
  const outerRadius = Math.max(40, Math.floor(height / 2 - Math.max(paddingX, paddingY) - activeDelta));
  const innerRadius = Math.max(24, Math.floor(outerRadius * 0.45));

  const renderActive: PieProps["activeShape"] = (props: SectorProps) => {
    const fill = (props as any).fill as string;
    const { cx, cy, startAngle, endAngle } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + activeDelta}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke={darken(fill, 0.2)}
          strokeWidth={1.5}
        />
      </g>
    );
  };

  const noRubric = !rubric || !Array.isArray(rubric.rubrics_detail) || rubric.rubrics_detail.length === 0;
  const hasResponses = total > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>{title || "Rubric distribution"}</Text>}
      size="60%"
      miw="500px"
      centered
      styles={{
        content: { background: "#ffffff", color: "#1f2937", overflow: "visible" },
        body: { background: "#ffffff", overflow: "visible" },
        header: { background: "#ffffff", borderBottom: "1px solid #e9ecef" },
      }}
      overlayProps={{ backgroundOpacity: 0.35, blur: 0 }}
    >
      {noRubric ? (
        <NoRubricPieModal />
      ) : (
        <Group align="start" wrap="nowrap" gap="lg">
          <Box w="50%">
            {hasResponses ? (
              <>
              <Flex direction="column" align="center">
                <PieChart
                  data={chartData}
                  size={height}
                  withTooltip
                  tooltipDataSource="segment"
                  paddingAngle={2}
                  tooltipAnimationDuration={200}
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
                  } as any}
                  tooltipProps={{
                    content: (props) => (
                      <RubricChartTooltip
                        label={props.label}
                        payload={props.payload}
                        total={total}
                      />
                    ),
                  }}
                />
              </Flex>
                <Divider my="xs" color="#e9ecef" />
                
                <Text size="sm" c="dimmed">
                  Total rubrics selected:{" "}
                  <Text span fw={600} c="dark">
                    {total}
                  </Text>{" "}
                </Text>
              </>
            ) : (
              <>
                <Box
                  h={height}
                  display="flex"
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%'>
                    <Image
                      w="auto"
                      h={200}
                      src="/Image/statistic/graph_pie.svg"
                      alt="No data"
                    />
                    <Text size="sm" c="dimmed">
                      No responses for this question yet
                    </Text>
                  </Flex>
                </Box>

                  <Divider my="xs" color="#e9ecef" />
                  <Text size="sm" c="dimmed">
                    Total students:{" "}
                    <Text span fw={600} c="dark">
                      {total}
                    </Text>
                  </Text>
              </>
            )}
          </Box>

          <Box w="auto" style={{flex: 1}}>
            <ScrollArea.Autosize mah={height} type="auto">
              <Stack gap="xs" p="sm">
                {chartData.map((item, i) => {
                  const isMax = hasResponses && i === maxIndex;
                  const hovered = i === hoverIndex;
                  const bg = hovered ? "#f6f8fa" : isMax ? "#f3f0ff" : "transparent";
                  return (
                    <Group
                      key={item.id}
                      gap="sm"
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(undefined)}
                      style={{
                        background: bg,
                        borderRadius: rem(10),
                        padding: rem(10),
                        cursor: "pointer",
                        border: isMax
                          ? `1px solid ${darken(item.color!, 0.25)}`
                          : "1px solid #e9ecef",
                        boxShadow: isMax
                          ? "0 4px 10px rgba(15, 23, 42, 0.10)"
                          : "none",
                        transition: "background 120ms ease, box-shadow 120ms ease, transform 120ms ease",
                        transform: hovered || isMax ? "translateY(-1px)" : "none",
                      }}
                    >                      
                      <Box
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          minWidth: 0,
                        }}
                      >
                        <Box
                          w={12}
                          h={12}
                          style={{
                            borderRadius: 999,
                            background: isMax ? darken(item.color!, 0.1) : item.color,
                            boxShadow: isMax
                              ? `0 0 0 3px ${item.color}33`
                              : "none",
                            flexShrink: 0,
                          }}
                        />
                        <Tooltip label={item.label} withArrow withinPortal>
                          <Box maw="80%">
                            <Text
                              size="sm"
                              lineClamp={1}
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                flex: 1,
                                color: "#374151",
                                fontWeight: isMax ? 600 : 500,
                                fontStyle:
                                  item.label === FALLBACK_LABEL ? "italic" : "normal",
                                opacity: item.label === FALLBACK_LABEL ? 0.8 : 1,
                              }}
                            >
                              {item.label}
                            </Text>
                          </Box>
                        </Tooltip>
                        <Text
                          size="sm"
                          ml="auto"
                          mr="md"
                          fw={isMax ? 800 : 600}
                          style={{
                            color: isMax ? "#111827" : "#374151",
                          }}
                        >
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
      )}
    </Modal>
  );
}
