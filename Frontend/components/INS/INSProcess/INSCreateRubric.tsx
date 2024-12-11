import React from 'react';
import { Box, Text, Title, Anchor, Divider } from '@mantine/core';
import { useRouter } from 'next/router';

const INSCreateRubric: React.FC = () => {
  const router = useRouter();
  const { course_id, assignment_id } = router.query;

  if (!course_id || !assignment_id) {
    return <div>Invalid course or assignment ID</div>;
  }

  return (
    <Box px="lg" pt="xl">
      {/* Title */}
      <Title order={2} mb="md">
        Create Rubric
      </Title>

      {/* Divider */}
      <Divider mb="md" />

      {/* Description */}
      <Text>
        Questions must be added to the{' '}
        <Anchor
          href={`/courses/${course_id}/process/${assignment_id}/CreateOutline`}
          size="sm"
          underline="hover"
        >
          Create Outline
        </Anchor>{' '}
        page before you can begin creating a rubric.
      </Text>
    </Box>
  );
};

export default INSCreateRubric;
