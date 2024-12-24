import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Title, Text, Button, Table, Flex, Divider, Box, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

interface BoundingBox {
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  pageNumber: number;
  title: string;
  points: number;
  type: 'NAME' | 'STUDENTID' | 'QUESTION';
}

interface CreateOutlineProps {
  onNewQuestion: () => void;
  onEditName: () => void;
  onEditStudentID: () => void;
  boundingBoxes: BoundingBox[];
  updateBoundingBox: (index: number, updatedBox: BoundingBox) => void;
  removeBoundingBox: (index: number) => void;
}

const CreateOutline: React.FC<CreateOutlineProps> = ({
  onNewQuestion,
  onEditName,
  onEditStudentID,
  boundingBoxes,
  updateBoundingBox,
  removeBoundingBox,
}) => {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;

  const form = useForm({
    initialValues: {
      boundingBoxes: boundingBoxes as BoundingBox[],
    },
  });

  const handleCancel = () => {
    router.push(`/courses/${course_id}/assignments/${assignment_id}`);
  };

  const handleInputChange = (index: number, field: keyof BoundingBox, value: any) => {
    const updatedBox = { ...form.values.boundingBoxes[index], [field]: value };
    const updatedBoxes = [...form.values.boundingBoxes];
    updatedBoxes[index] = updatedBox;
    form.setFieldValue('boundingBoxes', updatedBoxes);

    if (assignment_id) {
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
    }
  };

  const handleSaveOutline = () => {
    if (assignment_id) {
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(form.values.boundingBoxes));
      alert('Outline saved successfully!');
    }
  };

  useEffect(() => {
    const savedBoxes = localStorage.getItem(`boundingBoxes-${assignment_id}`);
    if (savedBoxes) {
      try {
        const parsedBoxes: BoundingBox[] = JSON.parse(savedBoxes);
        if (Array.isArray(parsedBoxes)) {
          form.setFieldValue('boundingBoxes', parsedBoxes);
        }
      } catch (error) {
        console.error('Error parsing bounding box data:', error);
      }
    }
  }, [assignment_id, form]);

  return (
    <Container size="md" py="xl">
      <Box mb="md">
        <Title order={4}>Outline for Assignment</Title>
        <Text size="sm" color="dimmed">
          {form.values.boundingBoxes.length} bounding boxes total
        </Text>
      </Box>

      {/* ปุ่ม Edit Name และ Edit Student ID */}
      <Flex mb="lg" gap="sm">
        <Button size="xs" variant="outline" onClick={onEditName}>
          Edit Name
        </Button>
        <Button size="xs" variant="outline" onClick={onEditStudentID}>
          Edit Student ID
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
          {form.values.boundingBoxes
            .filter((box) => box.type === 'QUESTION') // แสดงเฉพาะ Question ในตาราง
            .map((box, index) => (
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
          <tr>
            <td colSpan={4} align="center">
              <Button size="xs" variant="default" onClick={onNewQuestion}>
                + New Question
              </Button>
            </td>
          </tr>
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
