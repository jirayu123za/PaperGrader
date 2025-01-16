import React, { useEffect, useState } from 'react';
import { Box, Text, Title, Divider, NumberInput, Button, Flex, ActionIcon, Select, Textarea } from '@mantine/core';
import { IconX, IconPlus } from '@tabler/icons-react';

interface Rubric {
  points: number;
  description: string;
}

interface BoundingBox {
  id: number;
  title: string;
  points: number;
  earnedPoints: number;
  rubrics: Rubric[];
}

const Grading: React.FC = () => {
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [adjustment, setAdjustment] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem(`boundingBoxes-yourAssignmentId`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData)) {
          setBoundingBoxes(parsedData);
        }
      } catch (error) {
        console.error('Error parsing bounding box data:', error);
      }
    }
  }, []);

  const handleSaveRubric = (
    boxIndex: number,
    rubricIndex: number,
    field: 'points' | 'description',
    value: string | number
  ) => {
    const updatedBoxes = [...boundingBoxes];
    if (field === 'points' && typeof value === 'number') {
      updatedBoxes[boxIndex].rubrics[rubricIndex].points = value;
    } else if (field === 'description' && typeof value === 'string') {
      updatedBoxes[boxIndex].rubrics[rubricIndex].description = value;
    }
    setBoundingBoxes(updatedBoxes);
    localStorage.setItem(`boundingBoxes-yourAssignmentId`, JSON.stringify(updatedBoxes));
  };

  const handleAddRubric = (boxIndex: number) => {
    const updatedBoxes = [...boundingBoxes];
    updatedBoxes[boxIndex].rubrics.push({ points: 0, description: '' });
    setBoundingBoxes(updatedBoxes);
    localStorage.setItem(`boundingBoxes-yourAssignmentId`, JSON.stringify(updatedBoxes));
  };

  const handleDeleteRubric = (boxIndex: number, rubricIndex: number) => {
    const updatedBoxes = [...boundingBoxes];
    updatedBoxes[boxIndex].rubrics.splice(rubricIndex, 1);
    setBoundingBoxes(updatedBoxes);
    localStorage.setItem(`boundingBoxes-yourAssignmentId`, JSON.stringify(updatedBoxes));
  };

  const totalPoints = boundingBoxes.reduce((sum, box) => sum + box.points, 0);
  const earnedPoints = boundingBoxes.reduce((sum, box) => sum + box.earnedPoints, 0);

  const filteredBoundingBoxes = selectedBoxId
    ? boundingBoxes.filter((box) => box.id === selectedBoxId)
    : boundingBoxes;

  return (
    <Box style={{ padding: '1rem', overflowY: 'auto' }}>
      <Title order={3}>Grading</Title>
      <Divider my="sm" />

      {/* Total Points Section */}
      <Flex align="center" gap="sm" my="sm">
        <Select
          placeholder="Select Question"
          value={selectedBoxId ? `${selectedBoxId}` : null}
          onChange={(value) => setSelectedBoxId(value ? parseInt(value) : null)}
          data={boundingBoxes.map((box) => ({
            value: `${box.id}`,
            label: box.title,
          }))}
          clearable
          label="Select Question"
        />
        <Text>Total Points: {earnedPoints} / {totalPoints}</Text>
      </Flex>

      <NumberInput
        label="Point Adjustment"
        value={adjustment}
        onChange={(value) => setAdjustment(value || 0)}
      />

      {/* Rubric Section */}
      {filteredBoundingBoxes.map((box, boxIndex) => (
        <Box key={box.id} my="lg" p="sm" style={{ border: '1px solid #ccc', borderRadius: '8px' }}>
          <Flex justify="space-between" align="center">
            <Text>{box.title}</Text>
            <Text>Points: {box.earnedPoints} / {box.points}</Text>
          </Flex>

          {box.rubrics.length === 0 ? (
            <Text color="dimmed">No rubrics available for this question. Add a new rubric below.</Text>
          ) : (
            box.rubrics.map((rubric, rubricIndex) => (
              <Flex key={rubricIndex} align="center" my="sm" gap="sm">
                <NumberInput
                  value={rubric.points}
                  onChange={(value) => handleSaveRubric(boxIndex, rubricIndex, 'points', value || 0)}
                  style={{ width: '80px' }}
                />
                <Textarea
                  value={rubric.description}
                  onChange={(e) => handleSaveRubric(boxIndex, rubricIndex, 'description', e.target.value)}
                  style={{ flex: 1 }}
                />
                <ActionIcon
                  color="red"
                  onClick={() => handleDeleteRubric(boxIndex, rubricIndex)}
                >
                  <IconX />
                </ActionIcon>
              </Flex>
            ))
          )}

          <Button
            leftIcon={<IconPlus />}
            onClick={() => handleAddRubric(boxIndex)}
          >
            Add Rubric Item
          </Button>
        </Box>
      ))}

      {/* Comments Section */}
      <Box my="lg">
        <Textarea
          label="Provide Comments Specific to This Submission"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
        <Select
          label="Apply Previously Used Comments"
          placeholder="Select a comment"
          value={selectedComment}
          onChange={setSelectedComment}
          data={['Great job!', 'Needs improvement.', 'Incorrect format.']}
        />
      </Box>

      <Button color="green" fullWidth>
        Save Grading
      </Button>
    </Box>
  );
};

export default Grading;
