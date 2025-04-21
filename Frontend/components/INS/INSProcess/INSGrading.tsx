"use client";

import React from 'react';
import { useRouter } from 'next/router';
import { Container, Title, Text, Divider, Button, Table, Center, Box } from '@mantine/core';

const INSGrading: React.FC = () => {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;

  const handleEditOutline = () => {
    router.push(`/courses/${course_id}/process/${assignment_id}/CreateOutline`);
  };

  return (
    <Container size="lg" py="xl" px="sm" style={{ margin: '0', padding: '0', maxWidth: '100%' }}>
      {/* Title */}
      <Title order={3} mb="md" style={{ textAlign: 'left' }}>
        Grading Dashboard
      </Title>

      {/* Table Header */}
      <Table style={{ marginTop: '0', width: '100%' }}>
        <thead>
          <tr>
            <th>Question</th>
            <th>Points</th>
            <th>Progress</th>
            <th>Grouped by</th>
            <th>Graded by</th>
          </tr>
        </thead>
      </Table>

      {/* Divider */}
      <Divider my="sm" />

      {/* Table Body */}
      <Table style={{ marginTop: '0', width: '100%' }}>
        <tbody>
          <tr>
            <td colSpan={5}>
              <Center>
                <Box>
                  {/* Empty State Message */}
                  <Text
                    style={{
                      textAlign: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    There are no questions to grade because you haven't set up your Assignment Outline yet.
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: '#6c757d', // Adjusted to a dimmed color
                      marginBottom: '1rem',
                    }}
                  >
                    Set up your Assignment Outline to start grading.
                  </Text>

                  {/* Button to Edit Outline */}
                  <Center>
                    <Button variant="outline" onClick={handleEditOutline} size="sm">
                      Edit Outline
                    </Button>
                  </Center>
                </Box>
              </Center>
            </td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};

export default INSGrading;
