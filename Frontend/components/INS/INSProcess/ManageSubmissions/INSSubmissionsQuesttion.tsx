'use client';

import React from 'react';
import { Table, Progress, Text, Divider, Flex, Paper } from '@mantine/core';

interface Question {
  questionId: string;
  questionText: string;
  points: number;
  progress: number;
  gradedCount: number;
  totalSubmissions: number;
  subQuestions?: Question[];
}

const mockQuestions: Question[] = [
  {
    questionId: '1',
    questionText: 'What is SQL?',
    points: 10,
    progress: 50,
    gradedCount: 10,
    totalSubmissions: 20,
    subQuestions: [
      {
        questionId: '1.1',
        questionText: 'What is data?',
        points: 5,
        progress: 40,
        gradedCount: 8,
        totalSubmissions: 20,
      },
      {
        questionId: '1.2',
        questionText: 'What is a number?',
        points: 5,
        progress: 60,
        gradedCount: 12,
        totalSubmissions: 20,
      },
    ],
  },
  {
    questionId: '2',
    questionText: 'Explain primary keys.',
    points: 8,
    progress: 25,
    gradedCount: 5,
    totalSubmissions: 20,
    subQuestions: [
      {
        questionId: '2.1',
        questionText: 'What is a primary key?',
        points: 4,
        progress: 50,
        gradedCount: 10,
        totalSubmissions: 20,
      },
      {
        questionId: '2.2',
        questionText: 'Why are primary keys important?',
        points: 4,
        progress: 0,
        gradedCount: 0,
        totalSubmissions: 20,
      },
    ],
  },
  {
    questionId: '3',
    questionText: 'Define normalization.',
    points: 6,
    progress: 100,
    gradedCount: 20,
    totalSubmissions: 20,
  },
];

const RenderProgress = ({ graded, total, percent }: { graded: number; total: number; percent: number }) => (
  <Flex direction="column" align="center">
    <Flex justify="space-between" align="center" w={400}>
      <Progress
        value={percent}
        color={percent === 100 ? 'green' : 'blue'}
        size="md"
        striped
        w={380}
      />
      <Text size="xs" ml="sm">{`${percent}%`}</Text>
    </Flex>
    <Text size="xs" mt={4}>
      {`${graded}/${total}`}
    </Text>
  </Flex>
);

const INSSubmissionsQuestion: React.FC = () => {
  return (
    <Flex direction="column" justify="flex-start" gap="xs" p="xs">
      <Text size="lg" fw={500}>
        Grading Dashboard
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Grade submissions by selecting individual questions below.
      </Text>

      <Paper withBorder h="100%">
        <Table
          highlightOnHover
          verticalSpacing="md"
          horizontalSpacing="lg"
        >
          <Table.Thead className='bg-gray-100'>
            <Table.Tr>
              <Table.Th ta='left'>Question</Table.Th>
              <Table.Th ta='center'>Points</Table.Th>
              <Table.Th ta='center'>Progress</Table.Th>
              <Table.Th ta='center'>Graded by</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {mockQuestions.map((question) => (
              <React.Fragment key={question.questionId}>
                <Table.Tr>
                  <Table.Td>{`${question.questionId}: ${question.questionText}`}</Table.Td>
                  <Table.Td ta='center'>{question.points}</Table.Td>
                  <Table.Td ta='center'>
                    {/* <Progress
                      value={question.progress}
                      color={question.progress === 100 ? 'green' : 'blue'}
                      size="md"
                      striped
                    />
                    <Text size="xs" mt={4}>
                      {`${question.gradedCount}/${question.totalSubmissions}`} ({question.progress}%)
                    </Text> */}
                    <RenderProgress graded={question.gradedCount} total={question.totalSubmissions} percent={question.progress} />
                  </Table.Td>
                  <Table.Td ta='center'>--</Table.Td>
                </Table.Tr>

                {question.subQuestions &&
                  question.subQuestions.map((subQuestion) => (
                    <Table.Tr key={subQuestion.questionId}>
                      <Table.Td pl='2rem'>
                        {`${subQuestion.questionId}: ${subQuestion.questionText}`}
                      </Table.Td>
                      <Table.Td ta='center'>{subQuestion.points}</Table.Td>
                      <Table.Td ta='center'>
                        {/* <Progress
                          value={subQuestion.progress}
                          color={subQuestion.progress === 100 ? 'green' : 'blue'}
                          size="md"
                          striped
                        />
                        <Text size="xs" mt={4}>
                          {`${subQuestion.gradedCount}/${subQuestion.totalSubmissions}`} ({subQuestion.progress}%)
                        </Text> */}
                        <RenderProgress graded={subQuestion.gradedCount} total={subQuestion.totalSubmissions} percent={subQuestion.progress} />
                      </Table.Td>
                      <Table.Td ta='center'>--</Table.Td>
                    </Table.Tr>
                  ))
                }
              </React.Fragment>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Flex>
  );
};

export default INSSubmissionsQuestion;
