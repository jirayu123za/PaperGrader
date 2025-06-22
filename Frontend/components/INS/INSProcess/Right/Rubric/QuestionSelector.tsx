"use client";

import { useFetchQuestion } from "@/hooks/Question/useFetchQuestion";
import { useQuestionStore } from "@/store/question/useQuestionStore";
import { Popover, Box, Title, Flex, ScrollArea, Anchor } from "@mantine/core";
import { useParams } from "next/navigation";
import { MdExpandMore } from "react-icons/md";

export function QuestionSelector() {
  const params = useParams();
  const assignment_id = params.assignment_id as string;
  const { isLoading, data } = useFetchQuestion(assignment_id);
  const { questions, selectedQuestion, defaultSelectedQuestion, selectQuestion } = useQuestionStore();

  const getSelectedLabel = () => {
    const target = selectedQuestion ?? defaultSelectedQuestion;
    if (!target) return "No questions available";

    const questionIndex = questions.findIndex(q => q.question_id === target.question_id);
    const question = questions[questionIndex];
    if (!question) return "Invalid question";

    if (target.sub_question_id) {
      const subIndex = question.sub_questions?.findIndex(sq => sq.sub_question_id === target.sub_question_id) ?? -1;
      const sub = question.sub_questions?.[subIndex];
      return `${questionIndex + 1}.${subIndex + 1}: ${sub?.sub_question_title}`;
    }
    return `${questionIndex + 1}: ${question.question_title}`;
  };

  console.log("Selected Question:", selectedQuestion);
  
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
              {getSelectedLabel()}
            </Title>
            <MdExpandMore size={20} className='group-hover:text-[#3B5BDB] mt-2'/>
        </Flex>

      </Popover.Target>

      <Popover.Dropdown p={0}>
        <ScrollArea scrollbarSize={4} scrollbars='y'>
          {questions.map((q, index) => (
            <Box key={q.question_id} p="xs" className="border-b last:border-b-0">
              <Anchor 
                component="button"
                fw={500} fz='sm' pl='xs' pr='xs' underline="hover" lineClamp={1}
                onClick={() => { 
                  if (q.sub_questions && q.sub_questions.length > 0) return;
                  selectQuestion({ question_id: q.question_id });
                }}
                c={ selectedQuestion?.question_id === q.question_id && !selectedQuestion?.sub_question_id
                  ? "blue": "dark"
                }
              >
                {index + 1}: {q.question_title}
              </Anchor>

              {q.sub_questions?.map((sub, subIndex) => (
                <Flex key={sub.sub_question_id}>
                  <span className="w-4 h-4 border-l border-b border-gray-400 ml-4"></span>
                  <Anchor 
                    component="button"
                    pl='2px' fz='xs' pt='2px' key={sub.sub_question_id} underline="hover" lineClamp={1}
                    onClick={() => selectQuestion({ question_id: q.question_id, sub_question_id: sub.sub_question_id })}
                    c={ selectedQuestion?.question_id === q.question_id && selectedQuestion?.sub_question_id === sub.sub_question_id
                      ? "blue": "dark"
                    }
                  >
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
