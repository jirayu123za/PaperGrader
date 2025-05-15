'use client';

import {Button,NumberInput,TextInput, ActionIcon, Table, ScrollArea, Text, Box, Group,} from '@mantine/core';
import { FaTrash, FaPlus } from 'react-icons/fa';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { nanoid } from 'nanoid';
import {
    handleAddNameBoundingBox,
    handleAddIdBoundingBox,
    handleAddQuestionAndBoundingBox,
} from '@/components/INS/INSProcess/Right/Boundingbox/boundingBoxActions';

export default function QuestionOutline() {
    const { rubricData, updateQuestion, removeQuestion } = useBoundingBoxStore();

    const calculateTotalPoints = () =>
        rubricData.questions.reduce((acc, q) => {
            const subPoints = q.subquestions?.reduce((a, s) => a + s.subquestion_point, 0) || 0;
            return acc + q.question_point + subPoints;
        }, 0);

    return (
        <div className="p-6 space-y-6 rounded-md max-h-[86vh] overflow-y-auto">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Outline for Test</h1>
                <p className="text-gray-600">{calculateTotalPoints()} points total</p>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleAddNameBoundingBox}>Student Name</Button>
                    <Button variant="outline" onClick={handleAddIdBoundingBox}>Student ID</Button>
                </div>
            </div>

            {/* Questions Table */}
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
                            <>
                                <Table.Tr key={question.question_id}>
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

                                {/* Subquestions */}
                                {question.subquestions?.map((sub, idx) => (
                                    <Table.Tr key={sub.subquestion_id} style={{ background: '#f9f9f9' }}>
                                        <Table.Td>{`${index + 1}.${idx + 1}`}</Table.Td>
                                        <Table.Td>
                                            <TextInput
                                                value={sub.subquestion_title}
                                                onChange={(e) => handleSubChange(question, idx, 'subquestion_title', e.currentTarget.value)}
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
                            </>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>

            <Button variant="subtle" color="blue" onClick={handleAddQuestionAndBoundingBox}>
                + New Question
            </Button>
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
