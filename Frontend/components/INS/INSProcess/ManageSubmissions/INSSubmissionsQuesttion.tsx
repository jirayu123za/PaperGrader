import React from 'react';
import { Table, Progress, Text, Divider } from '@mantine/core';

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

const INSSubmissionsQuestion: React.FC = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <Text size="lg" fw={500} mb="md">
        Grading Dashboard
      </Text>
      <Text size="sm" color="dimmed" mb="md">
        Grade submissions by selecting individual questions below.
      </Text>
      <Table
        highlightOnHover
        verticalSpacing="md"
        horizontalSpacing="lg"
        striped
        withColumnBorders
      >
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Question</th>
            <th style={{ textAlign: 'center' }}>Points</th>
            <th>Progress</th>
            <th>Graded by</th>
          </tr>
        </thead>
        {/* เพิ่ม Divider ตรงนี้ */}
        <tbody>
          <tr>
            <td colSpan={4}>
              <Divider size="sm" color="gray" />
            </td>
          </tr>
          {mockQuestions.map((question) => (
            <React.Fragment key={question.questionId}>
              <tr>
                <td>{`${question.questionId}: ${question.questionText}`}</td>
                <td style={{ textAlign: 'center' }}>{question.points}</td>
                <td>
                  <Progress
                    value={question.progress}
                    color={question.progress === 100 ? 'green' : 'blue'}
                    size="md"
                    striped
                  />
                  <Text size="xs" mt={4}>
                    {`${question.gradedCount}/${question.totalSubmissions}`} ({question.progress}%)
                  </Text>
                </td>
                <td>--</td>
              </tr>
              {question.subQuestions &&
                question.subQuestions.map((subQuestion) => (
                  <tr key={subQuestion.questionId}>
                    <td style={{ paddingLeft: '2rem' }}>
                      {`${subQuestion.questionId}: ${subQuestion.questionText}`}
                    </td>
                    <td style={{ textAlign: 'center' }}>{subQuestion.points}</td>
                    <td>
                      <Progress
                        value={subQuestion.progress}
                        color={subQuestion.progress === 100 ? 'green' : 'blue'}
                        size="md"
                        striped
                      />
                      <Text size="xs" mt={4}>
                        {`${subQuestion.gradedCount}/${subQuestion.totalSubmissions}`} ({subQuestion.progress}%)
                      </Text>
                    </td>
                    <td>--</td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default INSSubmissionsQuestion;
