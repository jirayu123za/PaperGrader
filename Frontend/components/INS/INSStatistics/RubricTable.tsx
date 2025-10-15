import React, { useMemo, useState } from "react";
import { Table, Progress, Text, ScrollArea, Center, Flex, Anchor, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { VscListUnordered } from "react-icons/vsc";
import RubricPieModal, { RubricSlice } from "./RubricPieModal";

export interface RubricItem {
  id: string;
  question: string;
  points: number;
  subRows?: RubricItem[];
}

interface RubricTableProps {
  data: RubricItem[];
}

export function RubricTable({ data }: RubricTableProps) {
  type RowWithMean = RubricItem & { mean: number; subRows?: RowWithMean[] };

  const mockData: RowWithMean[] = useMemo(() => {
    const addMean = (rows: RubricItem[]): RowWithMean[] =>
      rows.map((row) => ({
        id: row.id,
        question: row.question,
        points: row.points,
        mean: Math.random(),
        subRows: row.subRows ? addMean(row.subRows) : undefined,
      }));
    return addMean(data);
  }, [data]);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [chartData, setChartData] = useState<RubricSlice[]>([]);

  const buildRubricChartData = (row: RowWithMean): RubricSlice[] => {
    const seed = [...row.id].reduce((s, ch) => s + ch.charCodeAt(0), 0);
    const rng = (i: number) => ((seed * (i + 37)) % 17) + 3; // 3..19

    const labels = row.subRows?.length
      ? row.subRows.map((r, i) => `Sub ${i + 1}: ${r.question}`)
      : ["Excellent", "Good", "Fair", "Poor"];
    return labels.map((label, i) => ({
      id: `${row.id}-${i}`,
      label,
      value: rng(i),
    }));
  };

  const handleOpenModal = (row: RowWithMean, numberLabel: string) => {
    setSelectedTitle(`Rubric for ${numberLabel} — ${row.question}`);
    setChartData(buildRubricChartData(row));
    open();
  };

  if (!data || data.length === 0) {
    return (
      <Center py="md">
        <Text c="dimmed">No rubric data available</Text>
      </Center>
    );
  }

  const renderRows = (
    rows: RowWithMean[],
    indent = 0,
    prefix = ""
  ): React.ReactNode[] =>
    rows.flatMap((row, idx) => {
      const number = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
      const percentage = Math.round(row.mean * 100);

      const rowElement = (
        <Table.Tr
          key={row.id}
          onClick={() => handleOpenModal(row, number)}
          style={{ cursor: "pointer" }}
          className="group" 
        >
          <Table.Td>
            <Flex gap="sm" align="flex-start" style={{ marginLeft: indent * 24 }}>
              <Text fw={indent === 0 ? 700 : 500}>{number}</Text>
              <Box className="relative w-fit flex items-center gap-1">
                <Text
                  fw={indent === 0 ? 500 : 400}
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                >
                  {row.question}
                </Text>

                <Anchor
                  underline="hover"
                  size="xs"
                  ml="xs"
                  className="invisible group-hover:visible"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleOpenModal(row, number);
                  }}
                >
                  <Flex align="center" gap={4}>
                    <VscListUnordered size={12} className="translate-y-[1px]" />
                    <span>Rubric</span>
                  </Flex>
                </Anchor>
              </Box>
            </Flex>
          </Table.Td>

          <Table.Td>
            <Text>
              {row.points} point{row.points > 1 ? "s" : ""}
            </Text>
          </Table.Td>

          <Table.Td>
            <Flex justify="space-between" align="center" style={{ width: "100%" }}>
              <Progress value={percentage} style={{ flex: 1, marginRight: 8 }} />
              <Text>{percentage}%</Text>
            </Flex>
          </Table.Td>
        </Table.Tr>
      );

      const subRows = row.subRows ? renderRows(row.subRows, indent + 1, number) : [];
      return [rowElement, ...subRows];
    });

  return (
    <>
      <ScrollArea style={{ height: "100%" }}>
        <Table highlightOnHover verticalSpacing="xs" horizontalSpacing="lg">
          <Table.Thead className="bg-gray-100">
            <Table.Tr>
              <Table.Th style={{ textAlign: "left", width: "40%" }}>Question</Table.Th>
              <Table.Th style={{ textAlign: "left", width: "20%" }}>Points</Table.Th>
              <Table.Th style={{ textAlign: "left", width: "40%" }}>Mean</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{renderRows(mockData)}</Table.Tbody>
        </Table>
      </ScrollArea>

      <RubricPieModal opened={opened} onClose={close} title={selectedTitle || "Rubric Example"} />
    </>
  );
}
