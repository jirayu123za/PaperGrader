import React from 'react';
import { Table, Button, TextInput, Flex } from '@mantine/core';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';

interface Submission {
  studentCode: string;
  name: string;
  section: string;
  submittedAt: string;
}

const mockSubmissions: Submission[] = [
  {
    studentCode: '630111',
    name: 'Jirayu',
    section: '801',
    submittedAt: 'Dec 10 at 5:46PM',
  },
  {
    studentCode: '630222',
    name: 'Navadon Khunlertgit',
    section: '801',
    submittedAt: 'Dec 11 at 9:45PM',
  },
  {
    studentCode: '630333',
    name: 'Pulom',
    section: '802',
    submittedAt: 'Dec 21 at 5:21PM',
  },
  {
    studentCode: '630444',
    name: 'Test User',
    section: '802',
    submittedAt: 'Dec 13 at 4:06PM',
  },
  {
    studentCode: '630555',
    name: 'Example User',
    section: '803',
    submittedAt: 'Dec 14 at 2:30PM',
  },
];

interface INSSubmissionsProps {}

const INSSubmissions: React.FC<INSSubmissionsProps> = () => {
  const router = useRouter();
  const { course_id, assignment_id } = router.query;

  const form = useForm({
    initialValues: {
      searchTerm: '',
    },
  });

  const filteredSubmissions = mockSubmissions.filter((submission) => {
    const lowercasedTerm = form.values.searchTerm.toLowerCase();
    return (
      submission.studentCode.includes(lowercasedTerm) ||
      submission.name.toLowerCase().includes(lowercasedTerm) ||
      submission.section.includes(lowercasedTerm)
    );
  });

  const handleViewPDF = (studentCode: string) => {
    router.push(
      `/courses/${course_id}/process/${assignment_id}/submissions/${studentCode}/question/question_id/Grade`
    );
  };

  return (
    <div style={{ padding: '1rem' }}>
      <Flex justify="space-between" align="center" mb="md">
        <h3>Submissions for Assignment</h3>
        <TextInput
          placeholder="Search by Student Code, Name, or Section"
          value={form.values.searchTerm}
          onChange={(event) => form.setFieldValue('searchTerm', event.currentTarget.value)}
          style={{ maxWidth: '300px' }}
        />
      </Flex>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Student ID</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Section</Table.Th>
            <Table.Th>Submitted At</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredSubmissions.map((submission, index) => (
            <Table.Tr key={index}>
              <Table.Td>{submission.studentCode}</Table.Td>
              <Table.Td>{submission.name}</Table.Td>
              <Table.Td>{submission.section}</Table.Td>
              <Table.Td>{submission.submittedAt}</Table.Td>
              <Table.Td>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleViewPDF(submission.studentCode)}
                >
                  View PDF
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};

export default INSSubmissions;
