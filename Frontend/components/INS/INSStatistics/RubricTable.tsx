import React, { useMemo } from 'react';
import { Table, Progress, Text, ScrollArea, Center, Flex } from '@mantine/core';

export interface RubricItem {
  id: string;
  question: string;
  points: number;
  subRows?: RubricItem[];
}

interface RubricTableProps {
  /** โครงสร้าง rubric ของ assignment ที่เลือก (ไม่มี mean) */
  data: RubricItem[];
}

export function RubricTable({ data }: RubricTableProps) {
  // Empty state
  if (!data || data.length === 0) {
    return (
      <Center py="md">
        <Text c="dimmed">No rubric data available</Text>
      </Center>
    );
  }

  // ให้ทุกแถว (รวม subRows ทุกระดับ) มี mean ด้วยการแปลงแบบ recursive
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

  // Recursive renderer with numbering and indent
  const renderRows = (
    rows: RowWithMean[],
    indent = 0,
    prefix = ''
  ): React.ReactNode[] =>
    rows.flatMap((row, idx) => {
      const number = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
      const percentage = Math.round(row.mean * 100);
      const rowElement = (
        <Table.Tr key={row.id}>
          <Table.Td>
            <Flex gap="sm" align="flex-start" style={{ marginLeft: indent * 24 }}>
              <Text fw={indent === 0 ? 700 : 500}>{number}</Text>
              <Text
                fw={indent === 0 ? 500 : 400}
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
              >
                {row.question}
              </Text>
            </Flex>
          </Table.Td>
          <Table.Td>
            <Text>
              {row.points} point{row.points > 1 ? 's' : ''}
            </Text>
          </Table.Td>
          <Table.Td>
            <Flex justify="space-between" align="center" style={{ width: '100%' }}>
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
    <ScrollArea style={{ height: '100%' }}>
      <Table verticalSpacing="lg" striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ textAlign: 'left', width: '40%' }}>Question</Table.Th>
            <Table.Th style={{ textAlign: 'left', width: '20%' }}>Points</Table.Th>
            <Table.Th style={{ textAlign: 'left', width: '40%' }}>Mean</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{renderRows(mockData)}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
