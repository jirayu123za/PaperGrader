import React from 'react';
import { Box, Text, Title, Anchor, Divider } from '@mantine/core';

const CreateRubricPage: React.FC = () => {
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
        <Anchor href="/create-outline" size="sm" underline="hover">
          Create Outline
        </Anchor>{' '}
        page before you can begin creating a rubric.
      </Text>
    </Box>
  );
};

export default CreateRubricPage;
