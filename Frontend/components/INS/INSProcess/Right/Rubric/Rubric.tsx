"use client";
import markedKatex from 'marked-katex-extension';
import DOMPurify from 'dompurify';
import 'katex/dist/katex.min.css';
import React, { useEffect, useState } from 'react'
import { Box, Button, Checkbox, Divider, Flex, Group, NumberInput, Progress, ScrollArea, Text, Textarea, ActionIcon } from '@mantine/core';
import { FaPlus } from "react-icons/fa";
import { AiTwotoneDelete } from "react-icons/ai"
import { RubricSettings } from './RubricSettings';
import { QuestionSelector } from './QuestionSelector';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { marked } from 'marked';
import { NoQuestion } from './NoQuestion';
import { NoRubric } from './NoRubric';
import { useFetchRubric } from '@/hooks/Rubric/useFetchRubric';
import { useParams } from 'next/navigation';
import { useQuestionStore } from '@/store/question/useQuestionStore';
import { useRubricStore } from '@/store/rubric/useRubricStore';
import { useFetchQuestion } from '@/hooks/Question/useFetchQuestion';
import { useCreateRubric } from '@/hooks/Rubric/useCreateRubric';
import { useDeleteRubric } from '@/hooks/Rubric/useDeleteRubric';
import { useUpdateRubric } from '@/hooks/Rubric/useUpdateRubric';
import { useUpdateRubricsIndexes } from '@/hooks/Rubric/useUpdateRubricsIndexes';
import type { RubricItem } from '@/store/rubric/useRubricStore'; 
marked.use(markedKatex({ throwOnError: false }));

interface Graded {
    has_graded: number;
    total_grade: number;
}

export const Rubric = () => {
    const params = useParams();
    const assignment_id = params.assignment_id as string;
    const { questions, selectedQuestion, defaultSelectedQuestion } = useQuestionStore();
    // const { questions, selectedQuestion, defaultSelectedQuestion, resetSelectedQuestion } = useQuestionStore();
    const { isLoading: isLoadingQuestions, data: questionsData } = useFetchQuestion(assignment_id);
    const { isLoading: isLoadingRubric, data: data } = useFetchRubric(assignment_id);
    const { mutate: createRubric, isPending: isPendingCreate } = useCreateRubric(assignment_id);
    const { mutate: deleteRubric, isPending: isPendingDelete } = useDeleteRubric(assignment_id);
    const { mutate: updateRubric, isPending: isPendingUpdate } = useUpdateRubric(assignment_id);
    const { mutate: updateRubricsIndexes, isPending: isPendingUpdateIndexes } = useUpdateRubricsIndexes(assignment_id);
    const { rubricData, setRubricData, rubrics, setRubrics, editingRubricID, setEditingRubricID, editingDescriptionID, setEditingDescriptionID } = useRubricStore();

    const target = selectedQuestion ?? defaultSelectedQuestion;

    const handleCreateRubric = () => {
        createRubric({ 
            assignment_id, 
            question_id: target?.question_id,
            sub_question_id: target?.sub_question_id,
            rubric: {
                rubric_setting: rubricData?.rubric_setting ?? "Negative scoring",
                rubric_details: [{
                    rubric_point: 0,
                    rubric_description: "",
                }],
            },
        });
    };

    const handleUpdateRubric = (rubric_id: string, rubric_detail_id: string,  rubric_point: number, rubric_description: string) => {
        updateRubric({
            assignment_id,
            question_id: target?.question_id,
            sub_question_id: target?.sub_question_id,
            rubric: {
                rubric_id: rubric_id,
                rubric_details: [{
                    rubric_detail_id: rubric_detail_id,
                    rubric_point: rubric_point,
                    rubric_description: rubric_description,
                }],
            },
        });
        console.log("Updating rubric with ID:", rubric_id);
        console.log("Updating rubric detail ID:", rubric_detail_id);
        console.log("Rubric point:", rubric_point);
        console.log("Rubric description:", rubric_description);
    }

    const handleUpdateRubricsIndexes = (rubricItems: RubricItem[], rubric_id: string) => {
        updateRubricsIndexes({
            assignment_id,
            question_id: target?.question_id,
            sub_question_id: target?.sub_question_id,
            rubric: {
                rubric_id: rubric_id,
                rubric_details: rubricItems.map((r) => ({
                    rubric_detail_id: r.rubric_detail_id,
                    rubric_point: r.rubric_point,
                    rubric_description: r.rubric_description,
                    has_selected: r.has_selected,
                })),
            },
        });
        console.log("Updating rubric indexes with ID:", rubric_id);
        console.log("New rubric items after drag:", rubricItems);
    }

    const handleDeleteRubric = (rubric_id: string, rubric_detail_id: string) => {
        deleteRubric({
            assignment_id,
            question_id: target?.question_id,
            sub_question_id: target?.sub_question_id,
            rubric_id: rubric_id,
            rubric_detail_id: rubric_detail_id,
        });
    };

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
        setTimeout(() => {
            console.log("newItems after drag:", newItems);
            console.log("rubric id:", moved.rubric_id);
            handleUpdateRubricsIndexes(newItems, moved.rubric_id);
        }, 0);  
    };

    useEffect(() => {
        if (rubricData?.rubric_details) {
            const setting: 'Positive scoring' | 'Negative scoring' | null = rubricData.rubric_setting === 'Negative scoring' ? 'Negative scoring' : 'Positive scoring';
            const mapped = rubricData.rubric_details.map((r) => ({
                rubric_id: rubricData.rubric_id ?? "",
                rubric_detail_id: r.rubric_detail_id,
                rubric_point: r.rubric_point,
                rubric_description: r.rubric_description,
                has_selected: r.has_selected,
                rubric_setting: setting,
                has_ceiling: rubricData.has_ceiling,
                has_floor: rubricData.has_floor,
            }));
            setRubrics(mapped);
        } else {
            setRubrics([]);
        }     
    }, [rubricData]);

    // useEffect(() => {
    //     if (!questionsData || questionsData.length === 0) {
    //         resetSelectedQuestion();
    //         console.log("resetSelectedQuestion called due to empty questionsData");
    //     }
    //     console.log("call useEffect for questionsData", questionsData, "assignment_id:", assignment_id);
        
    // }, [assignment_id]);

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
                <NoRubric assignment_id={assignment_id} />
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
                                        key={rubric.rubric_detail_id.toString()}
                                        draggableId={rubric.rubric_detail_id.toString()}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                        <Checkbox.Card
                                            checked={false}
                                            component="div"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            pt="sm"
                                            pr="sm"
                                            pl="sm"
                                            w="456px"
                                            bd={snapshot.isDragging ? '2px solid #827f7f' : '1px solid #827f7f'}
                                            bg={snapshot.isDragging ? '#f0f0f0' : '#f9f9f9'}
                                            radius={0}
                                            className="hover:shadow-sm group"
                                        >
                                            <Group wrap="nowrap" align="flex-start">
                                                <Checkbox.Indicator radius="0"
                                                    icon={() => <Text size="sm" fw={500} >{index + 1}</Text>}
                                                />
                                                <Flex direction="column" className="flex-1">
                                                    {editingRubricID === rubric.rubric_detail_id ? (
                                                        <NumberInput
                                                            hideControls
                                                            autoFocus
                                                            decimalScale={2}
                                                            w={100}
                                                            value={rubric.rubric_point}
                                                            onChange={(val) => {
                                                                const numberVal = typeof val === 'number' ? val : rubric.rubric_point;
                                                                const setting: 'Positive scoring' | 'Negative scoring' = numberVal < 0 ? 'Negative scoring' : 'Positive scoring';
                                                                const updated = rubrics.map((r) =>
                                                                    r.rubric_detail_id === rubric.rubric_detail_id
                                                                    ? {
                                                                        ...r,
                                                                        rubric_point: numberVal,
                                                                        rubric_setting: setting,
                                                                        }
                                                                    : r
                                                                );
                                                                setRubrics(updated);
                                                            }}
                                                            onBlur={() => {
                                                                setEditingRubricID(null);
                                                                handleUpdateRubric(
                                                                    rubric.rubric_id,
                                                                    rubric.rubric_detail_id,
                                                                    rubric.rubric_point,
                                                                    rubric.rubric_description
                                                                );
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === 'Escape') {
                                                                e.preventDefault();
                                                                setEditingRubricID(null);
                                                                handleUpdateRubric(
                                                                    rubric.rubric_id,
                                                                    rubric.rubric_detail_id,
                                                                    rubric.rubric_point,
                                                                    rubric.rubric_description
                                                                );
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <Text 
                                                            fw={600} 
                                                            c={
                                                                rubric.rubric_point > 0 ? 'green'
                                                                : rubric.rubric_point < 0 ? 'red'
                                                                : 'green'
                                                            }
                                                            onClick={() => setEditingRubricID(rubric.rubric_detail_id)}
                                                        >
                                                            {   
                                                                rubric.rubric_point > 0 ? '+' :
                                                                rubric.rubric_point < 0 ? '-' :
                                                                '+'
                                                            }
                                                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(Math.abs(rubric.rubric_point))}
                                                        </Text>
                                                    )}
                                                    {editingDescriptionID === rubric.rubric_detail_id ? (
                                                        <Textarea
                                                            miw={360}
                                                            autoFocus
                                                            pb="md"
                                                            pt="xs"
                                                            autosize
                                                            radius="none"
                                                            defaultValue={rubric.rubric_description}
                                                            onBlur={(e) => {
                                                                const updated = rubrics.map((r) =>
                                                                    r.rubric_detail_id === rubric.rubric_detail_id
                                                                    ? { ...r, rubric_description: e.target.value }
                                                                    : r
                                                                );
                                                                handleUpdateRubric(
                                                                    rubric.rubric_id,
                                                                    rubric.rubric_detail_id,
                                                                    rubric.rubric_point,
                                                                    e.target.value
                                                                );
                                                                setRubrics(updated);
                                                                setEditingDescriptionID(null);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Escape' && !e.shiftKey)) {
                                                                    e.preventDefault();
                                                                    const value = (e.target as HTMLTextAreaElement).value;
                                                                    const updatedRubrics = rubrics.map((r) =>
                                                                    r.rubric_detail_id === rubric.rubric_detail_id
                                                                        ? { ...r, rubric_description: value }
                                                                        : r
                                                                    );
                                                                    handleUpdateRubric(
                                                                        rubric.rubric_id,
                                                                        rubric.rubric_detail_id,
                                                                        rubric.rubric_point,
                                                                        value
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
                                                            onClick={() => setEditingDescriptionID(rubric.rubric_detail_id)}
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
                                                </Flex>
                                                <ActionIcon
                                                    variant="transparent" 
                                                    aria-label="Delete rubric"
                                                    c="red"
                                                    className="ml-auto hover:text-red-600 hover:scale-105 transition-transform duration-200 opacity-0 group-hover:opacity-100"
                                                    onClick={() => handleDeleteRubric(rubric.rubric_id, rubric.rubric_detail_id)}
                                                >
                                                    <AiTwotoneDelete size={20} />
                                                </ActionIcon>
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
                    onClick={handleCreateRubric}
                    loading={isPendingCreate}
                >
                    Add Rubric Item
                </Button>
            </ScrollArea>
        )}
        </Flex>
    );
}