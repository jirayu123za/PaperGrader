'use client';

import { Flex, Title } from "@mantine/core";
import { NoSubmissionsList } from "@/components/INS/INSProcess/ManageSubmissions/NoSubmissionsList";

export default function SubQuestionsListClient({ course_id, question_id, sub_question_id }: { course_id: string; question_id: string; sub_question_id: string; }) {
  const submissionsList = [];

  if (submissionsList.length === 0) {
    return <NoSubmissionsList />
  }

  return (
    <Flex direction="column" gap="xs" p="36px">
      <h1>Sub Questions for Course {course_id}, Question {question_id}, Sub-Question {sub_question_id}</h1>
      <Title order={3} fw="500">Sub-Question 1: Mock sub-question title</Title>
    </Flex>
  );
}