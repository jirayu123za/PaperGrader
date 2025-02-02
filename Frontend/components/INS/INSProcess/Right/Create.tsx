import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Title, Text, Button, Table, Flex, Divider, Box, Tabs, TextInput, NumberInput } from '@mantine/core';
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useAddBoundingBoxAndQuestion, useFetchBoundingBoxesAndQuestions } from '../../../../hooks/BoundingBox/useFetchBoundingBox';
import useBoundingBoxStore from '../../../../store/BoundingBox/useBoundingBoxStore';
import Grading from './Grading';

interface BoundingBox {
  bounding_box_id: string;
  bounding_box_position: string;
  bounding_box_type: string;
  bounding_box_page: number;
}

interface Question {
  question_id: string;
  question_point: number;
  question_title: string;
}

interface CreateProps {
  currentPage: number;
  onToggleCollapse: (isCollapsed: boolean) => void;
}

const Create: React.FC<CreateProps> = ({ currentPage, onToggleCollapse }) => {
  const { addBoundingBox, addQuestion, removeQuestion, updateQuestion } = useBoundingBoxStore();
  const router = useRouter();
  const { assignment_id, course_id } = router.query;
  const [isCollapsed, { toggle }] = useDisclosure(false);
  const { boundingBoxes, rubricData } = useBoundingBoxStore();
  const { mutate: addBoundingBoxAndQuestion } = useAddBoundingBoxAndQuestion(assignment_id as string);

  useFetchBoundingBoxesAndQuestions(assignment_id as string);

  const form = useForm({
    initialValues: {
      activeTab: 'outline',
    },
  });

  const handleCancel = () => {
    router.push(`/courses/${course_id}/assignments/${assignment_id}`);
  };

  const handleToggle = () => {
    toggle();
    onToggleCollapse(!isCollapsed);
  };

  const handleNewQuestion = () => {
    const newBoundingBox: BoundingBox = {
      bounding_box_id: `temp-${Date.now()}`,
      bounding_box_position: `(50,50),(150,150)`,
      bounding_box_type: 'question',
      bounding_box_page: currentPage,
    };

    const newQuestion: Question = {
      question_id: `temp-${Date.now()}`,
      question_point: 0,
      question_title: `Question ${rubricData.questions.length + 1}`,
    };

    addBoundingBox(newBoundingBox);
    addQuestion(newQuestion);

    console.log('✅ Bounding Boxes:', boundingBoxes);
  };

  const handleSave = () => {
    if (!assignment_id) return;

    const newBoundingBoxes = boundingBoxes.filter((box) => box.bounding_box_id.startsWith('temp-'));
    const newQuestions = rubricData.questions.filter((question) => question.question_id.startsWith('temp-'));

    newBoundingBoxes.forEach((box, index) => {
      addBoundingBoxAndQuestion(
        {
          boundingBox: {
            bounding_box_position: box.bounding_box_position,
            bounding_box_type: box.bounding_box_type,
            bounding_box_page: box.bounding_box_page,
          },
          question: {
            question_point: newQuestions[index]?.question_point || 0,
            question_title: newQuestions[index]?.question_title || `Question ${index + 1}`,
          },
        },
        {
          onSuccess: () => {
            console.log('✅ Data Saved to Backend');
          },
          onError: (error) => {
            console.error('❌ Failed to Save Data', error);
          },
        }
      );
    });
  };

  const handleRemoveQuestion = (questionId: string) => {
    removeQuestion(questionId);
  };

  const handleChangeQuestion = (questionId: string, value: string) => {
    updateQuestion(questionId, { question_title: value });
  };

  const handleChangePoint = (questionId: string, value: number) => {
    updateQuestion(questionId, { question_point: value });
  };

  return (
    <Container className={`fixed top-0 right-0 h-full transition-all duration-300 bg-white shadow-lg ${isCollapsed ? 'w-25' : 'w-[450px]'}`}
      style={{ overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
      <Flex justify="space-between" align="center" p="md" style={{ backgroundColor: '#6665AC', color: '#F9F9F9' }}>
        <Title order={4} className={`${isCollapsed ? 'hidden' : 'block'}`}>Assignment Processing</Title>
        <Button onClick={handleToggle} variant="subtle" radius="md"
          styles={() => ({
            root: {
              backgroundColor: '#6665AC',
              color: '#F9F9F9',
              padding: 0,
              height: 'auto',
              ':hover': { backgroundColor: '#4e4d9f' },
            },
          })}>
          <FaRegArrowAltCircleLeft size={24} className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
        </Button>
      </Flex>

      {!isCollapsed && (
        <Container size="sm" py="xl" px="md">
          <Tabs value={form.values.activeTab} onChange={(value) => form.setFieldValue('activeTab', value || 'outline')}>
            <Tabs.List>
              <Tabs.Tab value="outline">Create Outline</Tabs.Tab>
              <Tabs.Tab value="grading">Grading</Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {form.values.activeTab === 'outline' ? (
            <>
              <Box pt={16} pl={16} pr={16}>
                <Text size="sm" color="dimmed">Total Questions: {rubricData.questions.length}</Text>
              </Box>

              <Text size="sm" c="dimmed" pt={16} pl={16} pr={16}>
                Create questions via the + button below.
              </Text>

              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '5%', textAlign: 'center' }}>#</Table.Th>
                    <Table.Th style={{ width: '65%', textAlign: 'center' }}>Title</Table.Th>
                    <Table.Th style={{ width: '15%', textAlign: 'center' }}>Points</Table.Th>
                    <Table.Th style={{ width: '20%', textAlign: 'center' }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rubricData.questions.map((question, index) => (
                    <Table.Tr key={question.question_id}>
                      <Table.Td>{index + 1}</Table.Td>
                      <Table.Td>
                        <TextInput
                          value={question.question_title}
                          onChange={(event) => handleChangeQuestion(question.question_id, event.currentTarget.value)}
                        />
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <NumberInput
                          hideControls
                          value={question.question_point}
                          onChange={(value) => handleChangePoint(question.question_id, value as number)}
                          min={0}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Button size="xs" color="red" variant="outline" onClick={() => handleRemoveQuestion(question.question_id)}>
                          X
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  <Table.Tr>
                    <Table.Td colSpan={4} align="center">
                      <Button size="xs" variant="default" onClick={handleNewQuestion}>+ New Question</Button>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>

              <Divider />

              <Flex gap="sm" mt="lg" justify="flex-end">
                <Button variant="default" onClick={handleCancel}>Cancel</Button>
                <Button variant="filled" onClick={handleSave}>Save Outline</Button>
              </Flex>
            </>
          ) : (
            <Grading />
          )}
        </Container>
      )}
    </Container>
  );
};

export default Create;
