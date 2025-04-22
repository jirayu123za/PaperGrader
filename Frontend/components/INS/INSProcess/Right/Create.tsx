"use client";

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  bounding_box_id?: string;
  subquestions?: SubQuestion[];
}

interface SubQuestion {
  bounding_box_id: string;
  subquestion_id: string;
  subquestion_point: number;
  subquestion_title: string;
}

// interface CreateProps {
//   currentPage: number;
//   onToggleCollapse: (isCollapsed: boolean) => void;
// }

// const Create: React.FC<CreateProps> = ({ currentPage, onToggleCollapse }) => {
const Create: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;
  const { addBoundingBox, addQuestion, removeQuestion, updateQuestion, removeBoundingBox, setRubricData, setBoundingBoxes } = useBoundingBoxStore();
  const [ isCollapsed, { toggle }] = useDisclosure(false);
  const { boundingBoxes, rubricData } = useBoundingBoxStore();
  const { mutate: addBoundingBoxAndQuestion } = useAddBoundingBoxAndQuestion(assignment_id as string);
  const { isLoading, isError } = useFetchBoundingBoxesAndQuestions(assignment_id as string);

  const form = useForm({
    initialValues: {
      activeTab: 'outline',
    },
  });

  const handleCancel = () => {
    router.push(`/courses/${course_id}/assignments/${assignment_id}`);
  };

  // const handleToggle = () => {
  //   toggle();
  //   onToggleCollapse(!isCollapsed);
  // };

  const handleNewQuestion = () => {
    if (!rubricData || !rubricData.questions) {
      console.error('rubricData or questions is undefined');
      return;
    }

    const newBoundingBox: BoundingBox = {
      bounding_box_id: `temp-${Date.now()}`,
      bounding_box_position: `(100,100),(300,300)`,
      bounding_box_type: 'question',
      // bounding_box_page: currentPage,
      bounding_box_page: 1,
    };

    const newQuestion: Question = {
      question_id: `temp-${Date.now()}`, // เพิ่ม question_id
      question_point: 0,
      question_title: `Question ${rubricData.questions.length + 1 || 1}`,
      bounding_box_id: newBoundingBox.bounding_box_id,
      subquestions: [], // เพิ่ม subquestions
    };

    // อัปเดต Store
    addBoundingBox(newBoundingBox); // เพิ่ม Bounding Box
    addQuestion(newQuestion); // เพิ่มคำถาม

    console.log('✅ Added Bounding Box and Question:', { newBoundingBox, newQuestion });
  };

  // useEffect(() => {
  //   console.log("📌 Bounding Boxes ใน Store:", boundingBoxes);
  // }, [boundingBoxes]);

  // useEffect(() => {
  //   console.log("🟢 rubricData อัปเดต:", rubricData);
  // }, [rubricData]);

  const handleSave = () => {
    if (!assignment_id) return;

    if (!rubricData.rubric_id) {
      console.error("❌ rubric_id is missing! Cannot save data.");
      return;
    }

    const newBoundingBoxes = Array.isArray(boundingBoxes)
      ? boundingBoxes.filter((box) => box.bounding_box_id.startsWith('temp-'))
      : [];

    const newQuestions = Array.isArray(rubricData.questions)
      ? rubricData.questions.filter((question) => question.question_id.startsWith('temp-'))
      : [];

    console.log("📌 Bounding Boxes ที่จะส่งไป:", newBoundingBoxes);
    console.log("📌 Questions ที่จะส่งไป:", newQuestions);

    // newBoundingBoxes.forEach((box, index) => {
    //   addBoundingBoxAndQuestion({
    //     boundingBoxes: newBoundingBoxes.map((box) => ({
    //       bounding_box_position: box.bounding_box_position,
    //       bounding_box_type: box.bounding_box_type,
    //       bounding_box_page: box.bounding_box_page,
    //     })),
    //     questionsData: newQuestions.length > 0
    //       ? {
    //         questions: newQuestions.map((question) => ({
    //           question_id: question.question_id || `temp-${Date.now()}`,
    //           question_point: question.question_point || 0,
    //           question_title: question.question_title || `Question ${question.question_id}`,
    //           subquestions: question.subquestions || [],
    //         })),
    //       }
    //       : undefined, // ถ้าไม่มี questions ให้ส่ง undefined
    //   });
    // });
  };

  // const handleRemoveQuestion = (questionId: string) => {
  //   const questionToRemove = rubricData.questions.find((q) => q.question_id === questionId);

  //   if (questionToRemove) {
  //     questionToRemove.subquestions?.forEach((sub) => {
  //       removeBoundingBox(sub.bounding_box_id);
  //     });

  //     if (questionToRemove.bounding_box_id) {
  //       removeBoundingBox(questionToRemove.bounding_box_id);
  //     }

  //     removeQuestion(questionId);
  //   }
  // };

  const handleChangeQuestion = (questionId: string, value: string) => {
    updateQuestion(questionId, { question_title: value });
  };

  // const handleChangePoint = (questionId: string, value: number) => {
  //   updateQuestion(questionId, { question_point: value });
  // };


  const createBoundingBox = (type: "NAME" | "STUDENTID") => {

    const newBoundingBox: BoundingBox = {
      bounding_box_id: `temp-${Date.now()}`,
      bounding_box_position: `(100,100),(300,300)`,
      bounding_box_type: type,
      // bounding_box_page: currentPage,
      bounding_box_page: 1,
    };
    
    console.log('สร้าง BoundingBox:', newBoundingBox);
    addBoundingBox(newBoundingBox);
  };

  // useEffect(() => {
  //   if (!rubricData || !Array.isArray(rubricData.questions)) {
  //     setRubricData({ rubric_id: assignment_id as string, questions: [] });
  //   }
  // }, [rubricData, setRubricData, assignment_id]);

  // useEffect(() => {
  //   if (!boundingBoxes || !Array.isArray(boundingBoxes)) {
  //     setBoundingBoxes([]);
  //   }
  // }, [boundingBoxes, setBoundingBoxes]);


  const handleNewSubQuestion = (questionId: string) => {
    const question = rubricData.questions.find(q => q.question_id === questionId);
    const subIndex = (question?.subquestions?.length || 0) + 1;

    const newSubQuestion: SubQuestion = {
      bounding_box_id: `temp-${Date.now()}`,
      subquestion_id: `sub-temp-${Date.now()}`,
      subquestion_point: 0,
      subquestion_title: `${question?.question_title}.${subIndex}`, // แสดงเป็น "เลขข้อใหญ่.1", "เลขข้อใหญ่.2"
    };

    updateQuestion(questionId, {
      subquestions: [...(question?.subquestions || []), newSubQuestion],
    });

    console.log('✅ Added Subquestion:', newSubQuestion);
  };

  return (
    <Container className={`related top-0 right-0 h-full transition-all duration-300 bg-white shadow-lg ${isCollapsed ? 'w-25' : 'w-[450px]'}`}
      style={{ borderLeft: '1px solid #ddd', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
      <Flex justify="space-between" align="center" p="md" style={{ backgroundColor: '#6665AC', color: '#F9F9F9' }}>
        <Title order={4} className={`${isCollapsed ? 'hidden' : 'block'}`}>Assignment Processing</Title>
        
        <Button onClick={toggle} variant="subtle" radius="md"
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
              <Tabs.Tab value="grading">Create Rubrics</Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {form.values.activeTab === 'outline' ? (
            <>
              <Flex gap="sm" justify="center" mb="md">
                <Button onClick={() => createBoundingBox("NAME")} variant="outline" color="blue">
                  Name
                </Button>
                <Button onClick={() => createBoundingBox("STUDENTID")} variant="outline" color="green">
                  Student ID
                </Button>
              </Flex>
              <Box pt={16} pl={16} pr={16}>
                <Text size="sm" c="dimmed">Total Questions: {rubricData?.questions?.length || 0}</Text>
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
                  {rubricData?.questions?.map((question, index) => (
                    <React.Fragment key={question?.question_id || index}>
                      <Table.Tr>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>
                          <TextInput
                            value={question?.question_title || ''}
                            onChange={(event) =>
                              handleChangeQuestion(question?.question_id, event.currentTarget.value)
                            }
                          />
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <NumberInput
                            hideControls
                            value={question?.question_point || 0}
                            // onChange={(value) => handleChangePoint(question?.question_id, value as number)}
                            min={0}
                          />
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Button
                            size="xs"
                            color="blue"
                            variant="outline"
                            // onClick={() => handleNewSubQuestion(question?.question_id)}
                          >
                            +
                          </Button>
                        </Table.Td>
                        <Table.Td>
                          <Button
                            size="xs"
                            color="red"
                            variant="outline"
                            // onClick={() => handleRemoveQuestion(question?.question_id)}
                          >
                            X
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                      {/* แสดง Subquestions ใต้ Question */}
                      {question.subquestions && question.subquestions.map((sub, subIndex) => (
                        <Table.Tr key={sub.subquestion_id} style={{ backgroundColor: '#f9f9f9' }}>
                          <Table.Td style={{ paddingLeft: '30px' }}>{index + 1}.{subIndex + 1}</Table.Td>
                          <Table.Td>
                            <TextInput
                              value={sub.subquestion_title}
                              onChange={(event) =>
                                updateQuestion(question.question_id, {
                                  subquestions: question.subquestions?.map(sq =>
                                    sq.subquestion_id === sub.subquestion_id
                                      ? { ...sq, subquestion_title: event.currentTarget.value }
                                      : sq
                                  ),
                                })
                              }
                            />
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'center' }}>
                            <NumberInput
                              hideControls
                              value={sub.subquestion_point}
                              onChange={(value) =>
                                updateQuestion(question.question_id, {
                                  subquestions: question.subquestions?.map(sq =>
                                    sq.subquestion_id === sub.subquestion_id
                                      ? { ...sq, subquestion_point: value as number }
                                      : sq
                                  ),
                                })
                              }
                              min={0}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Button
                              size="xs"
                              color="red"
                              variant="outline"
                              onClick={() => {
                                updateQuestion(question.question_id, {
                                  subquestions: question.subquestions?.filter(sq => sq.subquestion_id !== sub.subquestion_id),
                                });
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
                      <Button size="xs" variant="default" onClick={handleNewQuestion}>
                        + New Question
                      </Button>
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
