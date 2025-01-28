import React from 'react';
import { Table, Button, TextInput, Flex, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { useFetchSubmissions } from '../../../../hooks/useFetchINS_Submission';
import { useINS_SubmissionStore } from '../../../../store/useINS_SubmissionStore';

const INSSubmissions: React.FC = () => {
  const router = useRouter();
  const { course_id, assignment_id } = router.query;

  const form = useForm({
    initialValues: {
      searchTerm: '',
    },
  });

  const { submissions } = useINS_SubmissionStore();
  useFetchSubmissions(course_id as string, assignment_id as string);

  const filteredSubmissions = submissions.filter((submission) => {
    const lowercasedTerm = form.values.searchTerm.toLowerCase();
    return (
      submission.student_code.includes(lowercasedTerm) ||
      submission.full_name.toLowerCase().includes(lowercasedTerm) ||
      submission.section_name.includes(lowercasedTerm)
    );
  });

  const handleViewPDF = (studentCode: string) => {
    router.push(
      `/courses/${course_id}/process/${assignment_id}/submissions/${submissions}/Grade`
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
          {filteredSubmissions.map((submission) => (
            <Table.Tr key={submission.submission_id}>
              <Table.Td>{submission.student_code}</Table.Td>
              <Table.Td>{submission.full_name}</Table.Td>
              <Table.Td>{submission.section_name}</Table.Td>
              <Table.Td>{new Date(submission.submitted_at).toLocaleString()}</Table.Td>
              <Table.Td>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleViewPDF(submission.submission_id)}
                >
                  View
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
          {filteredSubmissions.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                <Text color="dimmed">No submissions yet</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </div>
  );
};

export default INSSubmissions;
