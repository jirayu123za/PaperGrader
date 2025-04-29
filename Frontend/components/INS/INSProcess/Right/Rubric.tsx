"use client";
import { ActionIcon, Box, Button, Checkbox, Divider, Flex, Group, NumberInput, Progress, ScrollArea, Text, Title } from '@mantine/core';
import React, { useState } from 'react'
import { MdExpandMore } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { AiTwotoneDelete } from "react-icons/ai"
import { RubricDescEdition } from '@/components/Create/Editor.tsx/RubricDescEdition';
import { RubricSettings } from './RubricSettings';
import { QuestionSelector } from './QuestionSelector';

interface Rubric {
    rubric_setting: string;
}

interface RubricItem {
    rubric_id: number;
    rubric_point: number;
    rubric_description: string;
    rubric_selected?: boolean;
}

interface Question {
    question_id: number;
    question_number: number;
    question_title: string;
    question_points: number;
}

interface Graded {
    has_graded: number;
    total_grade: number;
}

export const Rubric = () => {
    const [rubrics, setRubrics] = useState<RubricItem[]>([
        { rubric_id: 1, rubric_point: 1.5, rubric_description: 'rubric description one', rubric_selected: true },
        { rubric_id: 2, rubric_point: 1.0, rubric_description: 'rubric description two rubric description two rubric description two rubric description two rubric description two  rubric description two', rubric_selected: false },
        { rubric_id: 3, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 4, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 5, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: true },
        { rubric_id: 6, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: true },
        { rubric_id: 7, rubric_point: 1.0, rubric_description: 'rubric description two', rubric_selected: false },
        { rubric_id: 8, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 9, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 10, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 11, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 12, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 13, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 14, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 15, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
    ]);
    const [question, setQuestion] = useState<Question>({
        question_id: 1,
        question_number: 1,
        question_title: 'Question Title',
        question_points: 10.0,
    });
    const [graded, setGraded] = useState<Graded>({
        has_graded: 2,
        total_grade: 10,
    });

    const totalScore = rubrics.reduce((sum, r) => sum + r.rubric_point, 0);
    const [editingRubricId, setEditingRubricId] = useState<number | null>(null);
    const [editingDescriptionId, setEditingDescriptionId] = useState<number | null>(null);

    return (
        <Flex direction="column" className="flex-1 min-h-0 p-4">
            {/* Header */}
            <Box className="flex-shrink-0">
                <Flex className="group items-center pb-1 gap-1">
                    <QuestionSelector/>
                </Flex>

                <Progress color="violet" value={(totalScore / question.question_points) * 100} />
                <Text size="xs" c="#495057">
                    {graded.has_graded} of {graded.total_grade} questions graded
                </Text>

                <Flex justify="space-between" align="flex-end" pt="md">
                    <Box>
                        <Text span fw={500} c="#495057">Total Points</Text>
                        <Text fw={500} size="xl" c="#495057" style={{ fontSize: '28px', lineHeight: '1.2' }}>
                            {totalScore.toFixed(1)}
                            <Text span fw={500} c="#495057" style={{ fontSize: '28px', lineHeight: '1.2' }}>
                                / {question.question_points} pts
                            </Text>
                        </Text>
                    </Box>
                    <RubricSettings/>
                </Flex>

                <Divider label="Collapse View" labelPosition="right" pb='xs' />
            </Box>

            {/* Scroll Area */}
            <ScrollArea type="auto" scrollbarSize={4} scrollbars="y" h="calc(100vh - 340px)">
                <Flex direction="column" gap="xs">
                    {rubrics.map((rubric) => (
                        <Checkbox.Card
                            key={rubric.rubric_id}
                            checked={rubric.rubric_selected}
                            p="sm"
                            w="456px"
                            className="hover:shadow-sm group"
                            component="div"
                            styles={{
                                card: {
                                    backgroundColor: rubric.rubric_selected ? '#edf2ff' : undefined,
                                    borderColor: rubric.rubric_selected ? '#3b5bdb' : undefined,
                                    transition: 'all 150ms ease',
                                },
                            }}
                        >
                            <Group wrap="nowrap" align="flex-start">
                                <Checkbox.Indicator icon={() => <Text size="sm" fw={500}>{rubric.rubric_id}</Text>} />
                                <div>
                                    {editingRubricId === rubric.rubric_id ? (
                                        <NumberInput
                                            hideControls
                                            w={100}
                                            value={rubric.rubric_point}
                                            min={0}
                                            max={question.question_points}
                                            onChange={(val) => {
                                                setRubrics((prev) =>
                                                    prev.map((r) =>
                                                        r.rubric_id === rubric.rubric_id
                                                            ? { ...r, rubric_point: typeof val === 'number' ? val : 0 }
                                                            : r
                                                    )
                                                );
                                            }}
                                            onBlur={() => setEditingRubricId(null)}
                                            autoFocus
                                        />
                                    ) : (
                                        <Text fw={600} onClick={() => setEditingRubricId(rubric.rubric_id)}>
                                            {rubric.rubric_point.toFixed(1)}
                                        </Text>
                                    )}
                                    {editingDescriptionId === rubric.rubric_id ? (
                                        <RubricDescEdition
                                            value={rubric.rubric_description}
                                            onUpdate={(updatedVal) => {
                                                setRubrics((prev) =>
                                                    prev.map((r) =>
                                                        r.rubric_id === rubric.rubric_id
                                                            ? { ...r, rubric_description: updatedVal }
                                                            : r
                                                    )
                                                );
                                            }}
                                            onBlurEditor={() => setEditingDescriptionId(null)}
                                        />
                                    ) : (
                                        <Text
                                            size="sm"
                                            c="dimmed"
                                            onClick={() => setEditingDescriptionId(rubric.rubric_id)}
                                        >
                                            {rubric.rubric_description}
                                        </Text>
                                    )}
                                </div>
                                <Box
                                    onClick={() => console.log("Delete rubric", rubric.rubric_id)}
                                    className="ml-auto cursor-pointer text-gray-500 hover:text-red-600 hover:scale-105 transition-transform duration-200 opacity-0 group-hover:opacity-100"
                                >
                                    <AiTwotoneDelete size={20} />
                                </Box>
                            </Group>
                        </Checkbox.Card>
                    ))}
                </Flex>

                <Button
                    leftSection={<FaPlus size={12} />}
                    w={456}
                    variant="outline"
                    color="violet"
                    className="mt-2 flex-shrink-0"
                >
                    Add Rubric Item
                </Button>
            </ScrollArea>
        </Flex>
    );
}