import React from 'react';
import { useRouter } from 'next/router';
import { Container, Title, Text, Button, Table, Flex, Divider, Box, TextInput } from '@mantine/core';

interface BoundingBox {
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  pageNumber: number;
  title: string;
  points: number;
}

interface CreateOutlineProps {
  onNewQuestion: () => void;
  boundingBoxes: BoundingBox[];
  updateBoundingBox: (index: number, updatedBox: BoundingBox) => void;
  removeBoundingBox: (index: number) => void;
}

const CreateOutline: React.FC<CreateOutlineProps> = ({
  onNewQuestion,
  boundingBoxes,
  updateBoundingBox,
  removeBoundingBox,
}) => {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;

  const handleCancel = () => {
    router.push(`/courses/${course_id}/assignments/${assignment_id}`);
  };

  const handleInputChange = (index: number, field: keyof BoundingBox, value: any) => {
    const updatedBox = { ...boundingBoxes[index], [field]: value };
    updateBoundingBox(index, updatedBox);
  };

  const handleSaveOutline = () => {
    if (assignment_id) {
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(boundingBoxes));
      alert('Outline saved successfully!');
    }
  };

  return (
    <Container size="md" py="xl">
      <Box mb="md">
        <Title order={4}>Outline for Assignment</Title>
        <Text size="sm" color="dimmed">
          {boundingBoxes.length} bounding boxes total
        </Text>
      </Box>

      <Flex mb="lg" gap="sm">
        <Button size="xs" variant="default" onClick={onNewQuestion}>
          + New Question
        </Button>
      </Flex>

      <Text size="sm" color="dimmed" mb="lg">
        Create questions and subquestions via the + buttons below, or by dragging boxes on the template.
      </Text>

      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Points</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {boundingBoxes.map((box, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <TextInput
                  size="xs"
                  value={box.title}
                  onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                />
              </td>
              <td>
                <TextInput
                  size="xs"
                  type="number"
                  value={box.points}
                  onChange={(e) => handleInputChange(index, 'points', Number(e.target.value))}
                />
              </td>
              <td>
                <Button size="xs" color="red" variant="outline" onClick={() => removeBoundingBox(index)}>
                  X
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Divider my="lg" />

      <Flex gap="sm" mt="lg">
        <Button variant="default" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="filled" onClick={handleSaveOutline}>
          Save Outline
        </Button>
      </Flex>
    </Container>
  );
};

export default CreateOutline;
