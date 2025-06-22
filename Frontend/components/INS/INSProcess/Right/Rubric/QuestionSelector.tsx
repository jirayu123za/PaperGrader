"use client";

import { Popover, Box, Title, Flex, ScrollArea, Anchor } from "@mantine/core";
import { useParams } from "next/navigation";
import { MdExpandMore } from "react-icons/md";
import { useFetchQuestion } from "@/hooks/Question/useFetchQuestion";
import { useQuestionStore } from "@/store/question/useQuestionStore";

export function QuestionSelector() {
  const params = useParams();
  const assignment_id = params.assignment_id as string;
  const { isLoading } = useFetchQuestion(assignment_id);
  const { questions } = useQuestionStore();

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
              {questions.length > 0 ? (
                questions[0].sub_questions && questions[0].sub_questions.length > 0
                  ? `1.1: ${questions[0].sub_questions[0].sub_question_title}`
                  : `1: ${questions[0].question_title}`
              ) : (
                "No questions available"
              )}
            </Title>
            <MdExpandMore size={20} className='group-hover:text-[#3B5BDB] mt-2'/>
        </Flex>

      </Popover.Target>

      <Popover.Dropdown p={0}>
        <ScrollArea scrollbarSize={4} scrollbars='y'>
            {questions.map((q, index) => (
                <Box key={q.question_id} p="xs" className="border-b last:border-b-0">
                    <Anchor href="https://mantine.dev/" target="_blank" fw={500} fz='sm' pl='xs' pr='xs' c='dark' underline="hover" lineClamp={1}>
                        {index + 1}: {q.question_title}
                    </Anchor>

                    {q.sub_questions?.map((sub, subIndex) => (
                    <Flex key={sub.sub_question_id}>
                        <span className="w-4 h-4 border-l border-b border-gray-400 ml-4"></span>
                        <Anchor href="https://mantine.dev/" target="_blank" pl='2px' fz='xs' pt='2px' c='dark' key={sub.sub_question_id} underline="hover" lineClamp={1}>
                          {index + 1}.{subIndex + 1}: {sub.sub_question_title}
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
