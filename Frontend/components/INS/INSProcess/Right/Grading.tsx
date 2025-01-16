import React, { useEffect, useState } from 'react';
import { Box, Text, Title, Divider, NumberInput, Button, Flex, ActionIcon, Select, Textarea } from '@mantine/core';
import { IconX, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/router';



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
  const router = useRouter();
  const { assignment_id } = router.query;
  
  // ดึงข้อมูล boundingBoxes จาก localStorage
  useEffect(() => {
    if (!assignment_id) {
      console.log('Assignment ID is not available.');
      return;
    }
  
    const savedData = localStorage.getItem(`boundingBoxes-${assignment_id}`);
    console.log(`Fetching data for key: boundingBoxes-${assignment_id}`);
    
    if (savedData) {
      try {
        const parsedData: BoundingBox[] = JSON.parse(savedData);
        if (Array.isArray(parsedData)) {
          console.log('Parsed boundingBoxes:', parsedData);
          setBoundingBoxes(parsedData);
        } else {
          console.error('Invalid bounding box data format.');
        }
      } catch (error) {
        console.error('Error parsing bounding box data:', error);
      }
    } else {
      console.log(`No data found in localStorage for key: boundingBoxes-${assignment_id}`);
    }
  }, [assignment_id]);
  

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
    localStorage.setItem('boundingBoxes-${assignment_id}', JSON.stringify(updatedBoxes));
  };

  const handleAddRubric = (boxIndex: number) => {
    const updatedBoxes = [...boundingBoxes];
    updatedBoxes[boxIndex].rubrics.push({ points: 0, description: '' });
    setBoundingBoxes(updatedBoxes);
    localStorage.setItem('boundingBoxes-${assignment_id}', JSON.stringify(updatedBoxes));
  };

  const handleDeleteRubric = (boxIndex: number, rubricIndex: number) => {
    const updatedBoxes = [...boundingBoxes];
    updatedBoxes[boxIndex].rubrics.splice(rubricIndex, 1);
    setBoundingBoxes(updatedBoxes);
    localStorage.setItem('boundingBoxes-${assignment_id}', JSON.stringify(updatedBoxes));
  };

  const selectedBox = boundingBoxes.find((box) => box.id === selectedBoxId);

  return (
    <Box style={{ padding: '1rem', overflowY: 'auto' }}>
      <Title order={3}>Grading</Title>
      <Divider my="sm" />

      {/* Select BoundingBox */}
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
        <Text>
          Total Points: {selectedBox?.earnedPoints || 0} / {selectedBox?.points || 0}
        </Text>
      </Flex>

      {/* Rubric Section */}
      {selectedBox ? (
        <Box my="lg" p="sm" style={{ border: '1px solid #ccc', borderRadius: '8px' }}>
          <Flex justify="space-between" align="center">
            <Text>{selectedBox.title}</Text>
            <Text>Points: {selectedBox.earnedPoints} / {selectedBox.points}</Text>
          </Flex>

          {selectedBox.rubrics.length === 0 ? (
            <Text color="dimmed">No rubrics available for this question. Add a new rubric below.</Text>
          ) : (
            selectedBox.rubrics.map((rubric, rubricIndex) => (
              <Flex key={rubricIndex} align="center" my="sm" gap="sm">
                <NumberInput
                  hideControls
                  value={rubric.points}
                  onChange={(value) =>
                    handleSaveRubric(boundingBoxes.indexOf(selectedBox), rubricIndex, 'points', value || 0)
                  }
                  style={{ width: '45px' }}
                />
                <Textarea
                  value={rubric.description}
                  onChange={(e) =>
                    handleSaveRubric(boundingBoxes.indexOf(selectedBox), rubricIndex, 'description', e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <ActionIcon
                  color="red"
                  onClick={() => handleDeleteRubric(boundingBoxes.indexOf(selectedBox), rubricIndex)}
                >
                  <IconX />
                </ActionIcon>
              </Flex>
            ))
          )}

          <Button
            leftIcon={<IconPlus />}
            onClick={() => handleAddRubric(boundingBoxes.indexOf(selectedBox))}
          >
            Add Rubric Item
          </Button>
        </Box>
      ) : (
        <Text color="dimmed">Select a question to view and manage rubrics.</Text>
      )}

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

      <Button  fullWidth>
        Save Grading
      </Button>
    </Box>
  );
};

export default Grading;
