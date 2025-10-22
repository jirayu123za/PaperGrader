"use client";

import React, { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Anchor, Box, Flex, Popover, ScrollArea, Title } from "@mantine/core";
import { MdExpandMore } from "react-icons/md";
import { useQuestionStore } from "@/store/question/useQuestionStore";

type Mode = "submissions" | "lists";

export const QuestionSelectorParams = () => {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;
  const submission_id = params.submission_id as string;
  const question_id = params.question_id as string;
  const sub_question_id = params.sub_question_id as string | undefined;
  const { questions } = useQuestionStore();

  const getSelectedLabel = () => {
    if (!question_id || !submission_id) return "No questions available";

    const question = questions.find(q => q.question_id === question_id);
    if (!question) return "Invalid question";

    const questionIndex = questions.indexOf(question);

    if (sub_question_id) {
        const sub = question.sub_questions?.find(sq => sq.sub_question_id === sub_question_id);
        if (!sub) return `${questionIndex + 1}: Invalid sub-question`;
        const subIndex = (question.sub_questions ?? []).indexOf(sub);
        return `${questionIndex + 1}.${subIndex + 1}: ${sub.sub_question_title}`;
    }
    return `${questionIndex + 1}: ${question.question_title}`;
  };

  const mode: Mode = pathname.includes("/lists/") ? "lists" : "submissions";

  const generateHref = (question_id: string, sub_question_id?: string): string => {
    const base = `/instructor/course/${course_id}/process/${assignment_id}/grade-submissions/questions/${question_id}`;
    const tail = mode === "lists" ? "lists" : "submissions";

    return sub_question_id
      ? `${base}/sub-questions/${sub_question_id}/${tail}/${submission_id}`
      : `${base}/${tail}/${submission_id}`;
  };

  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();

    const flatList: { qid: string; sid?: string }[] = [];
    questions.forEach((q) => {
      if (q.sub_questions && q.sub_questions.length > 0) {
        q.sub_questions.forEach((sub) =>
          flatList.push({ qid: q.question_id, sid: sub.sub_question_id })
        );
      } else {
        flatList.push({ qid: q.question_id });
      }
    });

    const currentIndex = flatList.findIndex(
      (it) => it.qid === question_id && it.sid === sub_question_id
    );
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowRight" && currentIndex < flatList.length - 1) nextIndex++;
    else if (e.key === "ArrowLeft" && currentIndex > 0) nextIndex--;

    if (nextIndex !== currentIndex) {
      const next = flatList[nextIndex];
      router.push(generateHref(next.qid, next.sid));
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [questions, question_id, sub_question_id, router]);

  return (
    <Popover
      width={260}
      position="bottom-start"
      withArrow
      arrowSize={10}
      offset={-1}
      shadow="xs"
    >
      <Popover.Target>
        <Flex>
          <Title
            order={3}
            className="text-[#495057] group-hover:text-[#3B5BDB] group-hover:underline transition-colors duration-200 cursor-pointer"
          >
            {getSelectedLabel()}
          </Title>
          <MdExpandMore size={20} className="group-hover:text-[#3B5BDB] mt-2" />
        </Flex>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <ScrollArea scrollbarSize={4} scrollbars="y">
          {questions.map((q, index) => (
            <Box key={q.question_id} p="xs" className="border-b last:border-b-0">
              <Anchor
                component="button"
                fw={500} fz="sm" pl="xs" pr="xs" underline="hover" lineClamp={1}
                onClick={() => {
                  if (q.sub_questions && q.sub_questions.length > 0) return;
                  router.push(generateHref(q.question_id))
                  }}
                c={
                    question_id === q.question_id && !sub_question_id
                    ? "blue" : "dark"
                }
              >
                {index + 1}: {q.question_title}
              </Anchor>

              {q.sub_questions?.map((sub, subIndex) => (
                <Flex key={sub.sub_question_id}>
                  <span className="w-4 h-4 border-l border-b border-gray-400 ml-4"></span>
                  <Anchor
                    component="button"
                    pl="2px"
                    fz="xs"
                    pt="2px"
                    key={sub.sub_question_id}
                    underline="hover"
                    lineClamp={1}
                    onClick={() => router.push(generateHref(q.question_id, sub.sub_question_id))}
                    c={
                        question_id === q.question_id && sub_question_id === sub.sub_question_id
                        ? "blue" : "dark"
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
};
