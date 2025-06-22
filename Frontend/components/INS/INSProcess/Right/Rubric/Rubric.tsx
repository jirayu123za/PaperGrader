"use client";
import markedKatex from 'marked-katex-extension';
import DOMPurify from 'dompurify';
import 'katex/dist/katex.min.css';
import { Box, Button, Checkbox, Divider, Flex, Group, NumberInput, Progress, ScrollArea, Text, Textarea, Image } from '@mantine/core';
import React, { useEffect, useState } from 'react'
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
import { useRubricStore } from '@/store/rubric/useRubricStore';
import { useFetchQuestion } from '@/hooks/Question/useFetchQuestion';
marked.use(markedKatex({ throwOnError: false }));

interface Graded {
    has_graded: number;
    total_grade: number;
}

export const Rubric = () => {
    const params = useParams();
    const assignment_id = params.assignment_id as string;
    const { questions, selectedQuestion, defaultSelectedQuestion } = useQuestionStore();
    const { isLoading: isLoadingQuestions, data: questionsData } = useFetchQuestion(assignment_id);
    const { isLoading: isLoadingRubric, data: data } = useFetchRubric(assignment_id);
    const { rubricData, setRubricData, rubrics, setRubrics, editingRubricID, setEditingRubricID, editingDescriptionID, setEditingDescriptionID } = useRubricStore();

    const [graded, setGraded] = useState<Graded>({
        has_graded: 2,
        total_grade: 10,
    });
    const handleDragEnd = (result: DropResult) => {
        const { destination, source } = result;
        if (!destination || destination.index === source.index) return;
    
        const newItems = Array.from(rubrics);
        const [moved] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, moved);
        setRubrics(newItems);
    };

    useEffect(() => {
        if (rubricData?.rubric_details) {
            const setting: 'Positive scoring' | 'Negative scoring' | null = rubricData.rubric_setting === 'Negative scoring' ? 'Negative scoring' : 'Positive scoring';
            const mapped = rubricData.rubric_details.map((r) => ({
                rubric_id: r.rubric_detail_id,
                rubric_point: r.rubric_point,
                rubric_description: r.rubric_description,
                rubric_setting: setting,
            }));
            setRubrics(mapped);
        } else {
            setRubrics([]);
        }     
    }, [rubricData]);

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

    if (questions.length === 0) {
        return <NoQuestion/>
    }
    
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
                                                icon={() => <Text size="sm" fw={500}>{index + 1}</Text>}
                                            />
                                            <div>
                                                {editingRubricID === rubric.rubric_id ? (
                                                    <NumberInput
                                                        hideControls
                                                        autoFocus
                                                        decimalScale={2}
                                                        w={100}
                                                        value={rubric.rubric_point}
                                                        prefix={rubric.rubric_setting === 'Positive scoring' ? '+' : ''}
                                                        // min={0}
                                                        // max={question.question_points}
                                                        allowNegative={true}
                                                        onChange={(val) => {
                                                            const numberVal = typeof val === 'number' ? val : 0;
                                                            const setting: 'Positive scoring' | 'Negative scoring' = numberVal < 0 ? 'Negative scoring' : 'Positive scoring';
                                                            const updated = rubrics.map((r) =>
                                                                r.rubric_id === rubric.rubric_id
                                                                ? {
                                                                    ...r,
                                                                    rubric_point: numberVal,
                                                                    rubric_setting: setting,
                                                                    }
                                                                : r
                                                            );
                                                            setRubrics(updated);
                                                        }}
                                                        onBlur={() => setEditingRubricID(null)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === 'Escape') {
                                                            e.preventDefault();
                                                            setEditingRubricID(null);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Text 
                                                        fw={600} c={rubric.rubric_setting === 'Positive scoring' ? 'green' : 'red'} 
                                                        onClick={() => setEditingRubricID(rubric.rubric_id)}
                                                    >
                                                        {rubric.rubric_setting === 'Positive scoring' ? '+' : '-'}{new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(Math.abs(rubric.rubric_point))}
                                                    </Text>
                                                )}
                                                {editingDescriptionID === rubric.rubric_id ? (
                                                    <Textarea
                                                        miw={360}
                                                        autoFocus
                                                        autosize
                                                        radius="none"
                                                        defaultValue={rubric.rubric_description}
                                                        onBlur={(e) => {
                                                            const updated = rubrics.map((r) =>
                                                                r.rubric_id === rubric.rubric_id
                                                                ? { ...r, rubric_description: e.target.value }
                                                                : r
                                                            );
                                                            setRubrics(updated);
                                                            setEditingDescriptionID(null);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();

                                                                const value = (e.target as HTMLTextAreaElement).value;

                                                                const updatedRubrics = rubrics.map((r) =>
                                                                r.rubric_id === rubric.rubric_id
                                                                    ? { ...r, rubric_description: value }
                                                                    : r
                                                                );

                                                                setRubrics(updatedRubrics);
                                                                setEditingDescriptionID(null);

                                                            } else if (e.key === 'Escape') {
                                                                setEditingDescriptionID(null);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Text
                                                        size="sm"
                                                        c={rubric.rubric_description ? "#495057" : "dimmed"}
                                                        fs={rubric.rubric_description ? undefined : "italic"}
                                                        className="whitespace-pre-wrap"
                                                        onClick={() => setEditingDescriptionID(rubric.rubric_id)}
                                                        dangerouslySetInnerHTML={
                                                        {
                                                            __html: DOMPurify.sanitize(
                                                                marked.parse(
                                                                    rubric.rubric_description && rubric.rubric_description.trim() !== ""
                                                                    ? rubric.rubric_description
                                                                    : "Click here to replace this description."
                                                            ) as string),
                                                        }}
                                                    />
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