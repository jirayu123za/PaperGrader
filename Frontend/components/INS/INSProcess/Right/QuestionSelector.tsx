"use client";
import { Popover, Button, Text, Box, UnstyledButton, Title, Flex, Divider, ScrollArea, Anchor } from "@mantine/core";
import { useState } from "react";
import { MdExpandMore } from "react-icons/md";

interface Question {
  question_id: number;
  question_number: number;
  question_title: string;
  question_points: number;
  sub_questions?: SubQuestion[];
}

interface SubQuestion {
  sub_question_id: number;
  sub_question_number: number;
  sub_question_title: string;
  sub_question_points: number;
}

export function QuestionSelector() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_id: 1,
      question_number: 1,
      question_title: "What is the capital of France?",
      question_points: 10.0,
      sub_questions: [
        {
          sub_question_id: 1,
          sub_question_number: 1.1,
          sub_question_title: "Which river runs through Paris?",
          sub_question_points: 5.0,
        },
        {
          sub_question_id: 2,
          sub_question_number: 1.2,
          sub_question_title: "Name a famous landmark in Paris.",
          sub_question_points: 5.0,
        },
      ],
    },
    {
      question_id: 2,
      question_number: 2,
      question_title: "Solve 5 + 7.",
      question_points: 5.0,
    },
    {
      question_id: 3,
      question_number: 3,
      question_title: "Name the process of water cycle.",
      question_points: 8.0,
      sub_questions: [
        {
          sub_question_id: 1,
          sub_question_number: 3.1,
          sub_question_title: "What is evaporation?",
          sub_question_points: 4.0,
        },
        {
          sub_question_id: 2,
          sub_question_number: 3.2,
          sub_question_title: "What is condensation?",
          sub_question_points: 4.0,
        },
      ],
    },
    {
      question_id: 4,
      question_number: 4,
      question_title: 'Who wrote "Romeo and Juliet"?',
      question_points: 7.0,
    },
    {
      question_id: 5,
      question_number: 5,
      question_title: "What is H2O commonly known as?",
      question_points: 6.0,
    },
    {
      question_id: 6,
      question_number: 6,
      question_title: "Define Newton's Second Law of Motion.",
      question_points: 9.0,
      sub_questions: [
        {
          sub_question_id: 1,
          sub_question_number: 6.1,
          sub_question_title: "State the formula of the second law.",
          sub_question_points: 5.0,
        },
      ],
    },
    {
      question_id: 7,
      question_number: 7,
      question_title: "What is the largest planet in our Solar System?",
      question_points: 5.0,
    },
    {
      question_id: 8,
      question_number: 8,
      question_title: 'Translate "Hello" to Spanish.',
      question_points: 3.0,
    },
    {
      question_id: 9,
      question_number: 9,
      question_title: "What is the freezing point of water in Celsius?",
      question_points: 4.0,
    },
    {
      question_id: 10,
      question_number: 10,
      question_title: "Name the three states of matter.",
      question_points: 6.0,
    },
  ]);

  return (
    <Popover
      width={260}
      position="bottom-start"
      withArrow
      arrowSize={10}
      arrowOffset={100}
      offset={-1}
      shadow="xs"
    >
      <Popover.Target>
        <Flex>
            <Title order={3} className="text-[#495057] group-hover:text-[#3B5BDB] group-hover:underline transition-colors duration-200 cursor-pointer">
                {/* {question.question_number}: {question.question_title} test */} Mock question: 1
            </Title>
            <MdExpandMore size={20} className='group-hover:text-[#3B5BDB] mt-2'/>
        </Flex>

      </Popover.Target>

      <Popover.Dropdown p={0}>
        <ScrollArea h='400px' scrollbarSize={4} scrollbars='y'>
            {questions.map((q) => (
                <Box key={q.question_id} p="xs" className="border-b last:border-b-0">
                    <Anchor href="https://mantine.dev/" target="_blank" fw={500} fz='sm' pl='xs' pr='xs' c='dark' underline="hover" lineClamp={1}>
                        {q.question_number}: {q.question_title}
                    </Anchor>

                    {q.sub_questions?.map((sub) => (
                    <Flex key={sub.sub_question_id}>
                        <span className="w-4 h-4 border-l border-b border-gray-400 ml-4"></span>
                        <Anchor href="https://mantine.dev/" target="_blank" pl='2px' fz='xs' pt='2px' c='dark' key={sub.sub_question_id} underline="hover" lineClamp={1}>
                            {q.question_number}.{sub.sub_question_id}: {sub.sub_question_title}
                        </Anchor>  
                    </Flex>
                    ))}
                </Box>
            ))}
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>
  );
}
