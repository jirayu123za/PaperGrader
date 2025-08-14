// Updated file: Question.tsx
'use client';

import { Button, NumberInput, TextInput, ActionIcon, Table, ScrollArea, Box } from '@mantine/core';
import { FaTrash, FaPlus } from 'react-icons/fa';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { nanoid } from 'nanoid';
import {
  handleAddNameBoundingBox,
  handleAddIdBoundingBox,
  handleAddQuestionAndBoundingBox,
  handleAddBoundingBox,
  handleAddSubquestion,
  handleSubChange,
  handleSubDelete,
} from '@/components/INS/INSProcess/Right/Boundingbox/boundingBoxActions';
import {
  useUpsertBoundingBoxesAndQuestions,
  mapRubricToQuestionsData,
  useFetchTemplate,
} from '@/hooks/BoundingBox/useFetchBoundingBox';
import { useBatchDeletePairs } from '@/hooks/BoundingBox/useFetchBoundingBox';
import { mapBoundingBoxesToApiFormat } from '@/hooks/BoundingBox/useFetchBoundingBox';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import React from 'react';

export default function QuestionOutline() {
  const params = useParams();
  const assignment_id = params.assignment_id as string;
  const { rubricData, boundingBoxes, updateQuestion, removeQuestion, pendingDeletes, markForDelete, clearPendingDeletes} = useBoundingBoxStore();
  const { mutateAsync: upsertAll } = useUpsertBoundingBoxesAndQuestions(assignment_id);
  const { mutateAsync: batchDelete } = useBatchDeletePairs(assignment_id);

  const { data: template } = useFetchTemplate(assignment_id);

  const upsert = useUpsertBoundingBoxesAndQuestions(assignment_id);


  const calculateTotalPoints = () =>
    rubricData.questions.reduce((acc, q) => acc + q.question_point, 0);




 
  const queueDeleteQuestion = (q: any) => {
    if (q?.bounding_box_id) {
      markForDelete({ bounding_box_id: q.bounding_box_id, question_id: q.question_id ?? null });
    }
    removeQuestion(q.question_id);
  };

const handleSave = async () => {
  // เลือกส่งเฉพาะกล่องที่ "ถูกใช้งานจริง" เพื่อตัดกล่อง question ที่ลอย/ค่าเริ่มต้น
  const usedIds = new Set<string>();
  rubricData.questions.forEach((q: any) => {
    if (q.bounding_box_id) usedIds.add(q.bounding_box_id);
    (q.subquestions ?? []).forEach((s: any) => {
      if (s.bounding_box_id) usedIds.add(s.bounding_box_id);
    });
  });
  const filteredBoxes = boundingBoxes.filter((b: any) => {
    if (b.bounding_box_type === 'question') {
      return usedIds.has(b.bounding_box_id);
    }
    return true; // name/id ส่งทั้งหมด
  });

  const payload = {
    bounding_boxes: mapBoundingBoxesToApiFormat(filteredBoxes, true),
    questions_data: mapRubricToQuestionsData(rubricData, true),
  };


  await upsertAll(payload);
  if (pendingDeletes && pendingDeletes.length > 0) {
    await batchDelete(pendingDeletes);
    clearPendingDeletes();
  }
};


  return (
    <div className="p-6 space-y-6 rounded-md max-h-[86vh] overflow-y-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Outline for Test</h1>
        <p className="text-gray-600">{calculateTotalPoints()} points total</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddNameBoundingBox}>
            Student Name
          </Button>
          <Button variant="outline" onClick={handleAddIdBoundingBox}>
            Student ID
          </Button>
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
                      disabled={!!question.subquestions?.length}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <ActionIcon
                        color="blue"
                        variant="light"
                        onClick={() => handleAddSubquestion(question)}
                      >
                        <FaPlus size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => queueDeleteQuestion(question)}
                      >
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
                          handleSubChange(
                            question,
                            idx,
                            'subquestion_title',
                            e.currentTarget.value
                          )
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
                        max={question.question_point}
                      />
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleSubDelete(question, idx)}
                      >
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
