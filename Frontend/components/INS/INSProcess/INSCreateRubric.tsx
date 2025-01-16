import React, { useEffect, useState } from 'react';
import { Box, Text, Title, Anchor, Divider, Table, NumberInput, Button, Flex } from '@mantine/core';
import { useRouter } from 'next/router';

interface BoundingBox {
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  pageNumber: number;
  title: string;
  points: number;
  type: 'NAME' | 'STUDENTID' | 'QUESTION';
}

const INSCreateRubric: React.FC = () => {
  const router = useRouter();
  const { course_id, assignment_id } = router.query;

  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);

  useEffect(() => {
    // ตรวจสอบว่า assignment_id มีค่าหรือไม่
    if (!assignment_id) return;

    // ดึงข้อมูล boundingBoxes จาก localStorage
    const savedBoxes = localStorage.getItem(`boundingBoxes-${assignment_id}`);
    if (savedBoxes) {
      try {
        const parsedBoxes: BoundingBox[] = JSON.parse(savedBoxes);
        if (Array.isArray(parsedBoxes)) {
          setBoundingBoxes(parsedBoxes);
        } else {
          console.error('Invalid bounding box data format.');
        }
      } catch (error) {
        console.error('Error parsing bounding box data:', error);
      }
    }
  }, [assignment_id]);

  if (!course_id || !assignment_id) {
    return <div>Invalid course or assignment ID</div>;
  }

  const handleSavePoints = (index: number, points: number) => {
    const updatedBoxes = [...boundingBoxes];
    updatedBoxes[index].points = points;

    setBoundingBoxes(updatedBoxes);

    // บันทึกกลับไปยัง localStorage
    localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
  };

  return (
    <Box px="lg" pt="xl">
      {/* Title */}
      <Title order={2} mb="md">
        Create Rubric
      </Title>

      {/* Divider */}
      <Divider mb="md" />

      {/* Description */}
      <Text mb="lg">
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

      {/* Display Bounding Box Content */}
      {boundingBoxes.length === 0 ? (
        <Text>No questions available. Add questions in the Create Outline page.</Text>
      ) : (
        <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
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
                {box.imageData ? (
                  <img src={box.imageData} alt={`Box ${index + 1}`} style={{ width: '100px', height: 'auto' }} />
                ) : (
                  'No image'
                )}
              </td>
              <td>{box.title}</td>
              <td>
                <NumberInput
                  value={box.points}
                  onChange={(value) => handleSavePoints(index, value || 0)}
                />
              </td>
              <td>
                <Button color="red" onClick={() => handleDeleteBox(index)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      )}
    </Box>
  );
};

export default INSCreateRubric;
