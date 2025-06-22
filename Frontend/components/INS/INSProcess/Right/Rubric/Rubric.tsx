"use client";
import markedKatex from 'marked-katex-extension';
import DOMPurify from 'dompurify';
import 'katex/dist/katex.min.css';
import { Box, Button, Checkbox, Divider, Flex, Group, NumberInput, Progress, ScrollArea, Text, Textarea, Image } from '@mantine/core';
import React, { useState } from 'react'
import { FaPlus } from "react-icons/fa";
import { AiTwotoneDelete } from "react-icons/ai"
import { RubricSettings } from './RubricSettings';
import { QuestionSelector } from './QuestionSelector';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { marked } from 'marked';
import { NoQuestion } from './NoQuestion';
import { useFetchRubric } from '@/hooks/Rubric/useFetchRubric';
import { useParams } from 'next/navigation';
import { useQuestionStore } from '@/store/question/useQuestionStore';
marked.use(markedKatex({ throwOnError: false }));

interface Rubric {
    rubric_setting: string;
}

interface RubricItem {
    rubric_id: number;
    rubric_point: number;
    rubric_description: string;
    rubric_selected?: boolean;
    rubric_setting: 'positive' | 'negative';
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
    const params = useParams();
    const assignment_id = params.assignment_id as string;
    const { questions, selectedQuestion, defaultSelectedQuestion } = useQuestionStore();

    const [rubrics, setRubrics] = useState<RubricItem[]>([
        { rubric_id: 1, rubric_point: 1.5, rubric_description: 'Clearly explains the concept with accurate terminology', rubric_selected: true, rubric_setting: 'positive' },
        { rubric_id: 2, rubric_point: 1.0, rubric_description: 'Demonstrates correct application of formulas or methods', rubric_selected: false , rubric_setting: 'positive'},
        { rubric_id: 3, rubric_point: 2.55, rubric_description: '$2x + 5 = 13$', rubric_selected: false , rubric_setting: 'negative'},
        { rubric_id: 4, rubric_point: 1.45, rubric_description: 'Includes appropriate and well-labeled diagrams or visuals', rubric_selected: false , rubric_setting: 'positive'},
        { rubric_id: 5, rubric_point: 2.0, rubric_description: '$x^2 - 4x + 3 = 0$', rubric_selected: true , rubric_setting: 'positive'},
        { rubric_id: 6, rubric_point: 0.0, rubric_description: 'Provides a complete and logical solution process', rubric_selected: true , rubric_setting: 'negative'},
        { rubric_id: 7, rubric_point: 1.0, rubric_description: 'Justifies answer with clear reasoning or evidence', rubric_selected: false , rubric_setting: 'negative'},
        { rubric_id: 8, rubric_point: 10.0, rubric_description: '$f(x) = 3x^3 - 5x^2 + 2x - 7$', rubric_selected: false , rubric_setting: 'negative'},
        { rubric_id: 9, rubric_point: 10.5, rubric_description: "$f'(x) = 9x^2 - 10x + 2$", rubric_selected: false , rubric_setting: 'positive'},
        { rubric_id: 10, rubric_point: 5.0, rubric_description: 'Minor calculation errors that do not affect overall logic', rubric_selected: false , rubric_setting: 'negative'},
        { rubric_id: 11, rubric_point: 5.55, rubric_description: 'Answer is incomplete or lacks explanation', rubric_selected: false , rubric_setting: 'negative'},
        { rubric_id: 12, rubric_point: 0.0, rubric_description: 'Incorrect method or misunderstanding of the concept', rubric_selected: false , rubric_setting: 'positive'},
    ]);

    const [graded, setGraded] = useState<Graded>({
        has_graded: 2,
        total_grade: 10,
    });
    const [editingRubricId, setEditingRubricId] = useState<number | null>(null);
    const [editingDescriptionId, setEditingDescriptionId] = useState<number | null>(null);

    const handleDragEnd = (result: DropResult) => {
        const { destination, source } = result;
        if (!destination || destination.index === source.index) return;
    
        const newItems = Array.from(rubrics);
        const [moved] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, moved);
        setRubrics(newItems);
    };

    const { isLoading, data } = useFetchRubric(assignment_id);

    const getSelectedQuestionPoint = (): number | null => {
        const target = selectedQuestion ?? defaultSelectedQuestion;
        if (!target) return null;

        const question = questions.find(q => q.question_id === target.question_id);
        if (!question) return null;

        if (target.sub_question_id) {
            const sub = question.sub_questions?.find(sq => sq.sub_question_id === target.sub_question_id);
            return sub?.sub_question_point ?? null;
        }
        return question.question_point;
    };

    if (questions === null) {
        return <NoQuestion/>
    }

    console.log("Rubric", data );
    
    return (
        <Flex direction="column" className="flex-1 min-h-0 p-4">
            {/* Header */}
            <Box className="flex-shrink-0">
                <Flex className="group items-center pb-1 gap-1">
                    <QuestionSelector/>
                </Flex>

                <Progress color="violet" value={100} />
                <Text size="xs" c="#495057">
                    {graded.has_graded} of {graded.total_grade} already assigned rubrics
                </Text>

                <Flex justify="space-between" align="flex-end" pt="md">
                    <Box>
                        <Text span fw={500} c="#495057">Total question points</Text>
                        <Text fw={500} size="xl" c="#495057" style={{ fontSize: '28px', lineHeight: '1.2' }}>
                            {/* {totalScore.toFixed(2)} */}
                            <Text span fw={500} c="#495057" style={{ fontSize: '28px', lineHeight: '1.2' }}>
                                {getSelectedQuestionPoint() !== null ? `${getSelectedQuestionPoint()?.toFixed(1)} pts` : '0.0 pts'}
                            </Text>
                        </Text>
                    </Box>
                    <RubricSettings/>
                </Flex>

                <Divider label="Collapse View" labelPosition="right" pb='xs' />
            </Box>

            {rubrics.length === 0 ? (
                <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%'>
                    <Image
                        src="/Image/table/no_data.svg"
                        alt="No rubrics found"
                        w="auto"
                        h={150}
                        fit="contain"
                        fallbackSrc="https://placehold.co/200x200?text=Placeholder"
                    />
                    <Text size="lg" fw={500} mt="md">
                        No rubrics found
                    </Text>
                    <Text size="sm" c="dimmed">
                        You haven’t created any rubrics yet.
                    </Text>

                    <Button
                        leftSection={<FaPlus size={12} />}
                        w={456}
                        variant="outline"
                        color="violet"
                        className="mt-2"
                    >
                        Add rubric item
                    </Button>
                </Flex>
            ) : (       
                <ScrollArea type="auto" scrollbarSize={4} scrollbars="y" h="calc(100vh - 340px)">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="rubric-list">
                            {(provided) => (
                            <Flex
                                direction="column"
                                className="space-y-1"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {rubrics.map((rubric, index) => (
                                <Draggable
                                    key={rubric.rubric_id.toString()}
                                    draggableId={rubric.rubric_id.toString()}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                    <Checkbox.Card
                                        checked={false}
                                        component="div"
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        p="sm"
                                        w="456px"
                                        bd={snapshot.isDragging ? '2px solid #827f7f' : '1px solid #827f7f'}
                                        bg={snapshot.isDragging ? '#f0f0f0' : '#f9f9f9'}
                                        radius={0}
                                        className="hover:shadow-sm group"
                                    >
                                        <Group wrap="nowrap" align="flex-start">
                                        <Checkbox.Indicator
                                            icon={() => <Text size="sm" fw={500}>{rubric.rubric_id}</Text>}
                                        />
                                        <div>
                                            {editingRubricId === rubric.rubric_id ? (
                                                <NumberInput
                                                    hideControls
                                                    autoFocus
                                                    decimalScale={2}
                                                    w={100}
                                                    value={rubric.rubric_point}
                                                    prefix={rubric.rubric_setting === 'positive' ? '+' : ''}
                                                    // min={0}
                                                    // max={question.question_points}
                                                    allowNegative={true}
                                                    onChange={(val) => {
                                                        setRubrics((prev) =>
                                                        prev.map((r) =>
                                                            r.rubric_id === rubric.rubric_id
                                                                ? { ...r, rubric_point: typeof val === 'number' ? val : 0, rubric_setting: typeof val === 'number' && val < 0 ? 'negative' : 'positive', }
                                                                : r
                                                            )
                                                        );
                                                    }}
                                                    onBlur={() => setEditingRubricId(null)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === 'Escape') {
                                                        e.preventDefault();
                                                        setEditingRubricId(null);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <Text fw={600} c={rubric.rubric_setting === 'positive' ? 'green' : 'red'} onClick={() => setEditingRubricId(rubric.rubric_id)}>
                                                    {rubric.rubric_setting === 'positive' ? '+' : '-'}{new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(Math.abs(rubric.rubric_point))}
                                                </Text>
                                            )}
                                            {editingDescriptionId === rubric.rubric_id ? (
                                                <Textarea
                                                    miw={360}
                                                    autoFocus
                                                    autosize
                                                    radius="none"
                                                    defaultValue={rubric.rubric_description}
                                                    onBlur={(e) => {
                                                        setRubrics((prev) =>
                                                            prev.map((r) =>
                                                                r.rubric_id === rubric.rubric_id
                                                                    ? { ...r, rubric_description: e.target.value }
                                                                    : r
                                                            )
                                                        );
                                                        setEditingDescriptionId(null);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            setRubrics((prev) =>
                                                                prev.map((r) =>
                                                                    r.rubric_id === rubric.rubric_id
                                                                        ? { ...r, rubric_description: (e.target as HTMLTextAreaElement).value }
                                                                        : r
                                                                )
                                                            );
                                                            setEditingDescriptionId(null);
                                                        } else if (e.key === 'Escape') {
                                                            setEditingDescriptionId(null);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <Text
                                                    size="sm"
                                                    c="#495057"
                                                    className="whitespace-pre-wrap"
                                                    onClick={() => setEditingDescriptionId(rubric.rubric_id)}
                                                    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(marked.parse(rubric.rubric_description) as string),
                                                }}/>
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
                                    )}
                                </Draggable>
                                ))}
                                {provided.placeholder}
                            </Flex>
                        )}
                    </Droppable>
                </DragDropContext>

                <Button
                    leftSection={<FaPlus size={12} />}
                    w={456}
                    variant="outline"
                    color="violet"
                    className="mt-2"
                >
                    Add Rubric Item
                </Button>
            </ScrollArea>
        )}
        </Flex>
    );
}