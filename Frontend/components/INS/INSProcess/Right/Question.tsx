'use client';

import { Button, NumberInput, TextInput, ActionIcon, Table, ScrollArea, Box } from '@mantine/core';
import { FaTrash, FaPlus } from 'react-icons/fa';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { nanoid } from 'nanoid';
import { handleAddNameBoundingBox, handleAddIdBoundingBox, handleAddQuestionAndBoundingBox } from '@/components/INS/INSProcess/Right/Boundingbox/boundingBoxActions';
import { useCreateBoundingBoxes, mapRubricToQuestionsData, useFetchTemplate } from '@/hooks/BoundingBox/useFetchBoundingBox';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import React from 'react';

export default function QuestionOutline() {
  const { rubricData, boundingBoxes, updateQuestion, removeQuestion } = useBoundingBoxStore();
  const { mutate: createBoundingBoxes } = useCreateBoundingBoxes();
  const params = useParams();
  const assignment_id = params.assignment_id as string;
  const { setBoundingBoxesFromAPI, setRubricDataFromAPI } = useBoundingBoxStore();
  const { data: template } = useFetchTemplate(assignment_id);

  useEffect(() => {
    if (template && template.bounding_boxes) {
      setBoundingBoxesFromAPI(template.bounding_boxes);
    }
  }, [template]);

  useEffect(() => {
    if (!template) return;

    const rubricQuestions = template.questions?.rubric_data?.questions;

    if (Array.isArray(rubricQuestions)) {
      const withBoxIds = rubricQuestions.map((q, i) => ({
        question_id: nanoid(),
        ...q,
        bounding_box_id: template.bounding_boxes?.[i]?.bounding_box_id ?? '',
      }));
      setRubricDataFromAPI(withBoxIds);
    }
  }, [template]);

  const calculateTotalPoints = () =>
    rubricData.questions.reduce((acc, q) => {
      const subPoints = q.subquestions?.reduce((a, s) => a + s.subquestion_point, 0) || 0;
      return acc + q.question_point + subPoints;
    }, 0);

  const handleSave = () => {
    createBoundingBoxes({
      assignment_id,
      bounding_boxes: boundingBoxes.map((b) => ({
        bounding_box_position: b.bounding_box_position,
        bounding_box_type: b.bounding_box_type as 'question' | 'name' | 'id',
        bounding_box_page: b.bounding_box_page,
      })),
      questions_data: mapRubricToQuestionsData(rubricData),
    });
  };

  return (
    <div className="p-6 space-y-6 rounded-md max-h-[86vh] overflow-y-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Outline for Test</h1>
        <p className="text-gray-600">{calculateTotalPoints()} points total</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddNameBoundingBox}>Student Name</Button>
          <Button variant="outline" onClick={handleAddIdBoundingBox}>Student ID</Button>
        </div>
      </div>

      <ScrollArea>
        <Table highlightOnHover style={{ border: 'none' }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th></Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th>Points</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rubricData.questions.map((question, index) => (
              <React.Fragment key={question.question_id}>
                <Table.Tr>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>
                    <TextInput
                      value={question.question_title}
                      onChange={(e) =>
                        updateQuestion(question.question_id, {
                          question_title: e.currentTarget.value,
                        })
                      }
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      value={question.question_point}
                      onChange={(val) =>
                        updateQuestion(question.question_id, {
                          question_point: typeof val === 'number' ? val : 0,
                        })
                      }
                      min={0}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <ActionIcon color="blue" variant="light" onClick={() => handleAddSubquestion(question)}>
                        <FaPlus size={16} />
                      </ActionIcon>
                      <ActionIcon color="red" variant="light" onClick={() => removeQuestion(question.question_id)}>
                        <FaTrash size={16} />
                      </ActionIcon>
                    </Box>
                  </Table.Td>
                </Table.Tr>

                {question.subquestions?.map((sub, idx) => (
                  <Table.Tr key={sub.subquestion_id} style={{ background: '#f9f9f9' }}>
                    <Table.Td>{`${index + 1}.${idx + 1}`}</Table.Td>
                    <Table.Td>
                      <TextInput
                        value={sub.subquestion_title}
                        onChange={(e) =>
                          handleSubChange(question, idx, 'subquestion_title', e.currentTarget.value)
                        }
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={sub.subquestion_point}
                        onChange={(val) =>
                          handleSubChange(question, idx, 'subquestion_point', Number(val))
                        }
                        min={0}
                      />
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon color="red" variant="light" onClick={() => handleSubDelete(question, idx)}>
                        <FaTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </React.Fragment>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <div className="flex justify-between mt-4">
        <Button variant="subtle" color="blue" onClick={handleAddQuestionAndBoundingBox}>
          + New Question
        </Button>
        <Button color="teal" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}

function handleAddSubquestion(question: any) {
  const { updateQuestion } = useBoundingBoxStore.getState();
  const newSub = {
    bounding_box_id: '',
    subquestion_id: nanoid(),
    subquestion_point: 1,
    subquestion_title: 'New Subquestion',
  };
  updateQuestion(question.question_id, {
    subquestions: [...(question.subquestions || []), newSub],
  });
}

function handleSubChange(question: any, subIdx: number, field: string, value: any) {
  const { updateQuestion } = useBoundingBoxStore.getState();
  const newSubs = [...(question.subquestions || [])];
  newSubs[subIdx] = { ...newSubs[subIdx], [field]: value };
  updateQuestion(question.question_id, { subquestions: newSubs });
}

function handleSubDelete(question: any, subIdx: number) {
  const { updateQuestion } = useBoundingBoxStore.getState();
  const newSubs = question.subquestions?.filter((_: any, idx: number) => idx !== subIdx) || [];
  updateQuestion(question.question_id, { subquestions: newSubs });
}