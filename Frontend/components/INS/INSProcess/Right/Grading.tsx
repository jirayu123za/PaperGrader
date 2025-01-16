import React, { useState } from 'react';
import { Box, Title, Divider, Text, Button, NumberInput, Textarea, Select, Flex } from '@mantine/core';

interface RubricItem {
  id: number;
  description: string;
  points: number;
  earnedPoints: number;
}

interface GradingProps {
  rubricItems?: RubricItem[]; // อนุญาตให้เป็น undefined ได้
}

const Grading: React.FC<GradingProps> = ({ rubricItems = [] }) => {
  const [adjustment, setAdjustment] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [selectedComment, setSelectedComment] = useState<string | null>(null);

  const totalPoints = rubricItems?.reduce((sum, item) => sum + item.points, 0) || 0;
  const earnedPoints = rubricItems?.reduce((sum, item) => sum + item.earnedPoints, 0) || 0;

  return (
    <Box p="lg" style={{ maxWidth: '600px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      {/* Title */}
      <Title order={3} mb="sm">Grading</Title>
      <Divider mb="md" />

      {/* Total Points */}
      <Box mb="md">
        <Text size="sm" fw={500}>Total Points</Text>
        <Text>{earnedPoints} / {totalPoints} pt</Text>
      </Box>

      {/* Rubric Items */}
      <Box mb="md">
        {rubricItems.map((item, index) => (
          <Box key={item.id} mb="sm">
            <Flex align="center" justify="space-between">
              <Text size="sm">{index + 1}. {item.description}</Text>
              <NumberInput
                value={item.earnedPoints}
                onChange={(value) => {
                  if (typeof value === 'number') {
                    rubricItems[index].earnedPoints = value;
                  }
                }}
                size="xs"
                hideControls
                styles={{ input: { width: '60px' } }}
              />
            </Flex>
          </Box>
        ))}
      </Box>

      {/* Point Adjustment */}
      <Box mb="md">
        <NumberInput
          label="Point Adjustment"
          value={adjustment}
          onChange={(value) => setAdjustment(value ?? 0)}
          size="xs"
        />
      </Box>

      {/* Comments */}
      <Box mb="md">
        <Textarea
          label="Provide Comments Specific To This Submission"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add comments here..."
          autosize
          minRows={3}
        />
      </Box>

      {/* Select Previously Used Comments */}
      <Box mb="md">
        <Select
          label="Apply Previously Used Comments"
          data={['Great job!', 'Needs improvement.', 'Check formatting.']}
          value={selectedComment}
          onChange={(value) => setSelectedComment(value)}
          placeholder="Select a comment"
        />
      </Box>

      {/* Actions */}
      <Flex justify="flex-end" gap="sm">
        <Button color="gray">Cancel</Button>
        <Button color="blue">Save</Button>
      </Flex>
    </Box>
  );
};

export default Grading;
