import React from 'react';
import { Table, Button, TextInput, Flex } from '@mantine/core';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';

interface Submission {
  studentCode: string;
  name: string;
  section: string;
  fileName: string;
  submittedAt: string;
}

const mockSubmissions: Submission[] = [
  {
    studentCode: '630111',
    name: 'Jirayu',
    section: '801',
    fileName: 'Jirayu_Assignment1.pdf',
    submittedAt: 'Dec 10 at 5:46PM',
  },
  {
    studentCode: '630222',
    name: 'Navadon Khunlertgit',
    section: '801',
    fileName: 'Navadon_Assignment1.pdf',
    submittedAt: 'Dec 11 at 9:45PM',
  },
  {
    studentCode: '630333',
    name: 'Pulom',
    section: '802',
    fileName: 'Pulom_Assignment1.pdf',
    submittedAt: 'Dec 21 at 5:21PM',
  },
  {
    studentCode: '630444',
    name: 'Test User',
    section: '802',
    fileName: 'TestUser_Assignment1.pdf',
    submittedAt: 'Dec 13 at 4:06PM',
  },
  {
    studentCode: '630555',
    name: 'Example User',
    section: '803',
    fileName: 'Example_Assignment1.pdf',
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
    // Redirect to the grading page
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
      <Table highlightOnHover>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>Student Code</th>
            <th>Name</th>
            <th style={{ textAlign: 'center' }}>Section</th>
            <th>PDF File</th>
            <th style={{ textAlign: 'center' }}>Submitted At</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubmissions.map((submission, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'center' }}>{submission.studentCode}</td>
              <td>{submission.name}</td>
              <td style={{ textAlign: 'center' }}>{submission.section}</td>
              <td>{submission.fileName}</td>
              <td style={{ textAlign: 'center' }}>{submission.submittedAt}</td>
              <td style={{ textAlign: 'center' }}>
                <Button
                  variant="light"
                  color="blue"
                  onClick={() => handleViewPDF(submission.studentCode)}
                >
                  View PDF
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default INSSubmissions;
