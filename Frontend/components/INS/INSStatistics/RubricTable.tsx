import React, { useMemo } from 'react';
import { Table, Progress, Text, ScrollArea, Center, Group } from '@mantine/core';

interface RubricRow {
  id: string;
  question: string;
  points: number;
  mean: number;
  subRows?: RubricRow[];
}

// Define questions with optional sub-questions
const rawData = [
  { id: '1', question: 'Describe the useState hook in React', points: 2 },
  {
    id: '2',
    question: 'Explain event delegation in JavaScript',
    points: 3,
    subRows: [
      { id: '2.1', question: 'Provide a code example', points: 1 },
      { id: '2.2', question: 'Discuss performance considerations', points: 1 },
    ],
  },
  { id: '3', question: 'What is prototypal inheritance?', points: 2 },
  {
    id: '4',
    question: 'Describe the component lifecycle in React',
    points: 3,
    subRows: [
      { id: '4.1', question: 'Class component methods', points: 1 },
      { id: '4.2', question: 'Hooks equivalent', points: 1 },
    ],
  },
  { id: '5', question: 'Explain CSS flexbox layout', points: 2 },
];

export function RubricTable() {
  // Generate mock data with random mean values
  const mockData: RubricRow[] = useMemo(
    () =>
      rawData.map((row) => ({
        ...row,
        mean: Math.random(),
        subRows: row.subRows?.map((sub) => ({ ...sub, mean: Math.random() })),
      })),
    []
  );

  // Empty state
  if (!mockData.length) {
    return (
      <Center py="md">
        <Text color="dimmed">No rubric data available</Text>
      </Center>
    );
  }

  // Recursive renderer with numbering and indent
  const renderRows = (
    data: RubricRow[],
    indent = 0,
    prefix = ''
  ): React.ReactNode[] =>
    data.flatMap((row, idx) => {
      const number = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
      const percentage = Math.round(row.mean * 100);
      const rowElement = (
        <Table.Tr key={row.id}>
          <Table.Td>
            <Group spacing="sm" style={{ marginLeft: indent * 24, alignItems: 'flex-start' }}>
              <Text fw={indent === 0 ? 700 : 500}>{number}</Text>
              <Text fw={indent === 0 ? 500 : 400} style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                {row.question}
              </Text>
            </Group>
          </Table.Td>
          <Table.Td>
            <Text>{row.points} point</Text>
          </Table.Td>
          <Table.Td>
            <Group position="apart" style={{ width: '100%' }}>
              <Progress value={percentage} style={{ flex: 1, marginRight: 8 }} />
              <Text>{percentage}%</Text>
            </Group>
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
