"use client";
import { ActionIcon, Box, Button, Checkbox, Divider, Flex, Group, NumberInput, Progress, ScrollArea, Text, TextInput, Title,  } from '@mantine/core';
import React, { useState } from 'react'
import { MdExpandMore } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import { FaPlus } from "react-icons/fa";

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
        { rubric_id: 1, rubric_point: 1.5, rubric_description: 'rubric description one', rubric_selected: false },
        { rubric_id: 2, rubric_point: 1.0, rubric_description: 'rubric description two', rubric_selected: false },
        { rubric_id: 3, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 4, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 5, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
        { rubric_id: 6, rubric_point: 0.0, rubric_description: 'rubric description three', rubric_selected: false },
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

    return (
        <Box className="flex flex-col flex-1 min-h-0 p-4">
            <Box>
                <Flex className="group items-center pb-2">
                <Title
                    order={5}
                    className="text-[#495057] group-hover:text-[#3B5BDB] group-hover:underline transition-colors duration-200 cursor-pointer"
                >
                    {question.question_number}: {question.question_title}
                </Title>
                <ActionIcon c="#495057" variant="transparent" aria-label="Questions">
                    <MdExpandMore size={20}/>
                </ActionIcon>
                </Flex>

                <Progress color="violet" value={(totalScore / question.question_points) * 100} />
                <Text size="xs" c="#495057">
                {graded.has_graded} of {graded.total_grade} questions graded
                </Text>

                <Flex justify="space-between" align="flex-end" pt="md">
                <Box>
                    <Text span fw={500} c="#495057">Total Points</Text>
                    <Text fw={500} size="xl" c="#495057" style={{ fontSize: '28px', lineHeight: '1.2' }}>
                    {totalScore.toFixed(1)}{' '}
                    <Text span fw={500} c="#495057" style={{ fontSize: '28px', lineHeight: '1.2' }}>
                        / {question.question_points} pts
                    </Text>
                    </Text>
                </Box>
                <Button leftSection={<IoIosSettings size={20}/>} variant="transparent" color="#495057" p={0}>
                    Rubric Settings
                </Button>  
                </Flex>

                <Divider label="Collapse View" labelPosition="right" mb="xs"/>
            </Box>

            <ScrollArea type="auto" scrollbars="y" h={800} scrollbarSize={4} pb="sm">
                {rubrics.map((rubric, index) => (
                    <Box key={rubric.rubric_id} mb="xs" p="sm" w="456px" style={{ border: '1px solid #ddd' }}>
                        <Group align="center" mb="xs">
                        <Text w={500}>#{index + 1}</Text>
                        <NumberInput
                            hideControls
                            step={0.5}
                            min={0}
                            max={5}
                            styles={{ input: { width: 80 } }}
                        />
                        </Group>
                        <TextInput
                        placeholder="Click here to replace this description."
                        value={rubric.rubric_description}
                        />
                    </Box>
                ))}
                <Button leftSection={<FaPlus size={12}/>} w={456} variant="outline" color="violet">Add Rubric Item</Button>
            </ScrollArea>
        </Box>
    );
}