import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import {Container,Title,Text,Button,Table,Flex,Divider,Box,TextInput,NumberInput,} from '@mantine/core';
import { useForm } from '@mantine/form';
import { FaBars } from 'react-icons/fa';
import { useDisclosure } from '@mantine/hooks';

interface BoundingBox {
  id: number; // Unique ID
  questionId: string; // Question Identifier
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  pageNumber: number;
  title: string;
  points: number;
  type: 'NAME' | 'STUDENTID' | 'QUESTION';
  subQuestions?: SubQuestion[];
}


interface SubQuestion {
  title: string;
  points: number;
}

interface CreateOutlineProps {
  onNewQuestion: () => void;
  onEditName: () => void;
  onEditStudentID: () => void;
  boundingBoxes: BoundingBox[];
  updateBoundingBox: (index: number, updatedBox: BoundingBox) => void;
  removeBoundingBox: (index: number) => void;
  onToggleCollapse: (isCollapsed: boolean) => void;
}

const CreateOutline: React.FC<CreateOutlineProps> = ({
  onNewQuestion,
  onEditName,
  onEditStudentID,
  boundingBoxes,
  updateBoundingBox,
  removeBoundingBox,
  onToggleCollapse,
}) => {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;
  const [isCollapsed, { toggle }] = useDisclosure(false);

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
      localStorage.setItem(
        `boundingBoxes-${assignment_id}`,
        JSON.stringify(updatedBoxes)
      );
    }
  };

  const handleAddSubQuestion = (parentIndex: number) => {
    const updatedBoxes = [...form.values.boundingBoxes];
    const parentBox = updatedBoxes[parentIndex];

    if (!parentBox.subQuestions) {
      parentBox.subQuestions = [];
    }

    const newSubQuestion: SubQuestion = {
      title: `${parentBox.title}.${parentBox.subQuestions.length + 1}`,
      points: 0,
    };

    parentBox.subQuestions.push(newSubQuestion);
    form.setFieldValue('boundingBoxes', updatedBoxes);

    if (assignment_id) {
      localStorage.setItem(
        `boundingBoxes-${assignment_id}`,
        JSON.stringify(updatedBoxes)
      );
    }
  };

  const handleSaveOutline = () => {
    if (assignment_id) {
      const dataToSave = form.values.boundingBoxes.map((box) => ({
        id: box.id,
        questionId: box.questionId,
        topLeft: box.topLeft,
        bottomRight: box.bottomRight,
        pageNumber: box.pageNumber,
        title: box.title,
        points: box.points,
        type: box.type,
      }));
  
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(dataToSave));
      alert('Outline saved successfully!');
    }
  };
  

  const handleToggle = () => {
    toggle();
    onToggleCollapse(!isCollapsed);
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
    <Container
      className={`fixed top-0 right-0 h-full transition-all duration-300 bg-white shadow-lg ${isCollapsed ? 'w-25' : 'w-[450px]'}`}
      style={{
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
      }}
    >
      <Flex justify="space-between" align="center" p="md" style={{ backgroundColor: '#6665AC', color: '#F9F9F9' }}>
        <Title order={4} className={`${isCollapsed ? 'hidden' : 'block'}`}>
          Outline for Assignment
        </Title>
        <Button
          onClick={handleToggle}
          variant="subtle"
          radius="md"
          styles={() => ({
            root: {
              backgroundColor: '#6665AC',
              color: '#F9F9F9',
              padding: 0,
              height: 'auto',
              ':hover': { backgroundColor: '#4e4d9f' },
            },
          })}
        >
          <FaBars
            size={24}
            className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
          />
        </Button>
      </Flex>

      {!isCollapsed && (
        <Container size="sm" py="xl" px="md">
          
          <Box pt={16} pl={16} pr={16}>
            <Text size="sm" color="dimmed">
              {form.values.boundingBoxes.length} bounding boxes total
            </Text>
          </Box>

          <Flex gap="sm" pt={16} pl={16} pr={16}>
            <Button size="sm" variant="outline" onClick={onEditName} w={180}>
              Edit Name
            </Button>
            <Button size="sm" variant="outline" onClick={onEditStudentID} w={180}>
              Edit Student ID
            </Button>
          </Flex>

          <Text size="sm" c="dimmed" pt={16} pl={16} pr={16}>
            Create questions and sub-questions via the + buttons below, or by dragging boxes on the template.
          </Text>

          <Table highlightOnHover >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '5%' }}>#</Table.Th>
                <Table.Th style={{ width: '70%' }}>Title</Table.Th>
                <Table.Th style={{ width: '10%', textAlign: 'center' }}>Points</Table.Th>
                <Table.Th style={{ width: '15%', textAlign: 'center' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {form.values.boundingBoxes.map((box, index) => (
                <React.Fragment key={index}>
                  <Table.Tr>
                    <Table.Td>{box.questionId}</Table.Td>
                    <Table.Td>
                      <TextInput
                        variant="unstyled"
                        size="xs"
                        value={box.title}
                        onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        variant="unstyled"
                        size="xs"
                        value={box.points}
                        onChange={(value) => handleInputChange(index, 'points', value)}
                        hideControls
                      />
                    </Table.Td>
                    <Table.Td>
                      <Flex gap="xs">
                        <Button
                          size="xs"
                          color="red"
                          variant="outline"
                          onClick={() => removeBoundingBox(index)}
                        >
                          X
                        </Button>
                        <Button
                          size="xs"
                          color="blue"
                          variant="outline"
                          onClick={() => handleAddSubQuestion(index)}
                        >
                          +
                        </Button>
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                  {box.subQuestions &&
                    box.subQuestions.map((sub, subIndex) => (
                      <Table.Tr key={`${index}-${subIndex}`}>
                        <Table.Td style={{ paddingLeft: '1.5rem' }}>{`${index + 1}.${subIndex + 1}`}</Table.Td>
                        <Table.Td>
                          <TextInput
                            variant="unstyled"
                            size="xs"
                            value={sub.title}
                            onChange={(e) => {
                              const updatedSubQuestions = box.subQuestions || [];
                              updatedSubQuestions[subIndex].title = e.target.value;
                              handleInputChange(index, 'subQuestions', updatedSubQuestions);
                            }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            variant="unstyled"
                            size="xs"
                            value={sub.points}
                            onChange={(value) => {
                              const updatedSubQuestions = box.subQuestions || [];
                              updatedSubQuestions[subIndex].points = typeof value === 'number' ? value : 0;
                              handleInputChange(index, 'subQuestions', updatedSubQuestions);
                            }}
                            hideControls
                          />
                        </Table.Td>
                        <Table.Td>
                          <Button
                            size="xs"
                            color="red"
                            variant="outline"
                            onClick={() => {
                              const updatedSubQuestions = box.subQuestions || [];
                              updatedSubQuestions.splice(subIndex, 1);
                              handleInputChange(index, 'subQuestions', updatedSubQuestions);
                            }}
                          >
                            X
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </React.Fragment>
              ))}
              <Table.Tr>
                <Table.Td colSpan={4} align="center">
                  <Button size="xs" variant="default" onClick={onNewQuestion}>
                    + New Question
                  </Button>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>

          <Divider />

          <Flex gap="sm" mt="lg" justify="flex-end" pl={16} pr={16}>
            <Button variant="default" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="filled" onClick={handleSaveOutline}>
              Save Outline
            </Button>
          </Flex>
        </Container>
      )}
    </Container>
  );
};

export default CreateOutline;
