import React, { useEffect, useState } from 'react';
import { Box, Text, Title, Anchor, Divider, NumberInput, Button, SimpleGrid, Card, Image, Flex, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconX } from '@tabler/icons-react';

interface BoundingBox {
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  pageNumber: number;
  title: string;
  points: number;
  type: 'NAME' | 'STUDENTID' | 'QUESTION';
  imageData?: string | null;
  rubrics?: { points: number; description: string }[]; // Rubrics สำหรับแต่ละข้อ
}

const INSCreateRubric: React.FC = () => {
  const router = useRouter();
  const { course_id, assignment_id } = router.query;

  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!assignment_id) return;
  
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
    saveBoundingBoxesToLocalStorage(updatedBoxes);
  };

  const saveBoundingBoxesToLocalStorage = (updatedBoxes: BoundingBox[]) => {
    setBoundingBoxes(updatedBoxes);
    if (assignment_id) {
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
    }
  };

  const handleDeleteBox = (index: number) => {
    const updatedBoxes = boundingBoxes.filter((_, i) => i !== index);
    saveBoundingBoxesToLocalStorage(updatedBoxes);
  };

  const handleAddRubric = (index: number) => {
    const updatedBoxes = [...boundingBoxes];
    if (!updatedBoxes[index].rubrics) {
      updatedBoxes[index].rubrics = [];
    }
    updatedBoxes[index].rubrics.push({ points: 0, description: '' });
    saveBoundingBoxesToLocalStorage(updatedBoxes);
  };
  

  const handleRubricChange = (
    boxIndex: number,
    rubricIndex: number,
    field: 'points' | 'description',
    value: string | number
  ) => {
    const updatedBoxes = [...boundingBoxes];
    if (updatedBoxes[boxIndex].rubrics) {
      if (field === 'points' && typeof value === 'number') {
        updatedBoxes[boxIndex].rubrics[rubricIndex][field] = value;
      } else if (field === 'description' && typeof value === 'string') {
        updatedBoxes[boxIndex].rubrics[rubricIndex][field] = value;
      }
    }
    saveBoundingBoxesToLocalStorage(updatedBoxes);
  };
  
  const handleDeleteRubric = (boxIndex: number, rubricIndex: number) => {
    const updatedBoxes = [...boundingBoxes];
    if (updatedBoxes[boxIndex].rubrics) {
      updatedBoxes[boxIndex].rubrics.splice(rubricIndex, 1);
    }
    saveBoundingBoxesToLocalStorage(updatedBoxes);
  };

  return (
    <Box px="lg" pt="xl" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Title order={2} mb="md">Create Rubric</Title>
      <Divider mb="md" />
      <Text mb="lg">
        Questions must be added to the{' '}
        <Anchor href={`/courses/${course_id}/process/${assignment_id}/CreateOutline`} size="sm" underline="hover">
          Create Outline
        </Anchor>{' '}
        page before you can begin creating a rubric.
      </Text>

      <Box style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {boundingBoxes.length === 0 ? (
          <Text>No questions available. Add questions in the Create Outline page.</Text>
        ) : (
          <SimpleGrid cols={1} spacing="lg">
            {boundingBoxes.map((box, index) => (
              <Card key={index} shadow="sm" padding="lg">
                <Flex align="flex-start" gap="lg" justify="space-between">
                  {/* รูปภาพอยู่ฝั่งซ้าย */}
                  <Box style={{ flex: '0 0 500px' }}>
                    {box.imageData ? (
                      <Image src={box.imageData} alt={`Box ${index + 1}`} height={150} />
                    ) : (
                      <Text color="dimmed" style={{ textAlign: 'center' }}>No image</Text>
                    )}
                  </Box>

                  {/* เนื้อหาและ Rubric อยู่ฝั่งขวา */}
                  <Box style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 500, fontSize: 'lg' }}>{box.title}</Text>
                    <NumberInput
                      label="Max Points"
                      hideControls
                      value={box.points || 0} // ตรวจสอบให้แน่ใจว่าค่าเป็นตัวเลข
                      size="xs"
                      styles={{ input: { width: '45px', padding: '', } }}
                      onChange={(value) => handleSavePoints(index, value || 0)}
                      mt="sm"
                    />
                    <Button
                      color="blue"
                      mt="md"
                      onClick={() => handleAddRubric(index)}
                    >
                      Add Rubric
                    </Button>
                    <Box mt="sm">
                      {box.rubrics?.map((rubric, rubricIndex) => (
                        <Flex
                          key={rubricIndex}
                          align="center"
                          gap="sm"
                          mt="sm"
                          style={{
                            position: 'relative',
                            paddingRight: '24px', // เพิ่มพื้นที่สำหรับปุ่มลบ
                          }}
                        >
                          {/* ลำดับของ Rubric */}
                          <Text style={{ width: '20px', fontWeight: 500 }}>{rubricIndex + 1}</Text>

                          {/* ช่องใส่คะแนน */}
                          <NumberInput
                            placeholder="Points"
                            hideControls
                            value={rubric.points}
                            onChange={(value) =>
                              handleRubricChange(index, rubricIndex, 'points', value || 0)
                            }
                            styles={{ input: { width: '45px', padding: '' } }}
                          />

                          {/* ช่องใส่ข้อความ */}
                          <input
                            type="text"
                            placeholder="Description"
                            value={rubric.description}
                            onChange={(e) =>
                              handleRubricChange(index, rubricIndex, 'description', e.target.value)
                            }
                            style={{
                              flex: 1,
                              padding: '4px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                          />

                          {/* ปุ่มลบ Rubric */}
                          <ActionIcon
                            color="red"
                            size="sm"
                            style={{ position: 'absolute', right: 0 }}
                            onClick={() => handleDeleteRubric(index, rubricIndex)}
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        </Flex>
                      ))}
                    </Box>

                  </Box>

                  {/* ปุ่ม Delete Card */}
                  <Button color="red" onClick={() => handleDeleteBox(index)}>
                    Delete
                  </Button>
                </Flex>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
};

export default INSCreateRubric;
