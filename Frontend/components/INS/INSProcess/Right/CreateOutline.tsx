import React from 'react';
import { useRouter } from 'next/router';
import { Container, Title, Text, Button, Table, Flex, Divider, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Stage, Layer, Rect } from 'react-konva';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  title: string;
  points: number;
}

interface CreateOutlineProps {
  onNewQuestion: () => void;
  boundingBoxes: BoundingBox[];
  removeBoundingBox: (index: number) => void;
}

const CreateOutline: React.FC<CreateOutlineProps> = ({ onNewQuestion, boundingBoxes,removeBoundingBox, }) => {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;

  const form = useForm({
    initialValues: {
      boundingBoxes: [] as BoundingBox[],
    },
  });
  

  const handleNewQuestion = () => {
    alert('Add New Question logic here');
  };

  const handleCancel = () => {
    router.push(`/courses/${course_id}/assignments/${assignment_id}`);
  };

  return (
    <Container size="md" py="xl">
      {/* Title */}
      <Box mb="md">
        <Title order={4}>Outline for Assignment</Title>
        <Text size="sm" color="dimmed">
          {boundingBoxes.length} bounding boxes total
        </Text>
      </Box>

      {/* Buttons */}
      <Flex mb="lg" gap="sm">
        <Button size="xs" variant="default" onClick={onNewQuestion}>
          + New Question
        </Button>
      </Flex>

      {/* Description */}
      <Text size="sm" color="dimmed" mb="lg">
        Create questions and subquestions via the + buttons below, or by dragging boxes on the template.
        Reorder and indent questions by dragging them in the outline.
      </Text>

      {/* Table */}
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {boundingBoxes.map((box, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{box.title}</td>
              <td>{box.points}</td>
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

      {/* Buttons */}
      <Flex gap="sm" mt="lg">
        <Button variant="default">Cancel</Button>
        <Button variant="filled">Save Outline</Button>
      </Flex>
    </Container>
  );
};

export default CreateOutline;
