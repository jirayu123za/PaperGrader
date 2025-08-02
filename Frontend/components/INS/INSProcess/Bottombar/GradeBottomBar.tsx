"use client";

import React, { useEffect } from 'react';
import { Group, Button, Text } from '@mantine/core';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useQuestionStore } from '@/store/question/useQuestionStore';
import { useGradeboxStore } from '@/store/BoundingBox/useGradeboxStore';
import { useSubmissionsStore } from '@/store/Submissions/useSubmissionsStore';

interface NavItem {
  question_id: string;
  sub_question_id?: string;
}

const GradeBottomBar: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  // Route params
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;
  const submission_id = params.submission_id as string;
  const question_id = params.question_id as string;
  const sub_question_id = params.sub_question_id as string | undefined;

  // Mode
  const isListMode = pathname.includes('/lists/');
  const mode = isListMode ? 'lists' : 'submissions';

  // Stores
  const { questions } = useQuestionStore();
  const { bounding_boxes_data } = useGradeboxStore();
  const { submissions: submissionsData } = useSubmissionsStore();
  const submissionsList = submissionsData?.submissions ?? [];

  // Build navigation items
  const navItems: NavItem[] = questions.reduce<NavItem[]>((acc, q) => {
    if (q.sub_questions && q.sub_questions.length > 0) {
      q.sub_questions.forEach(sq => {
        if (
          isListMode ||
          bounding_boxes_data.some(
            bb => bb.question_id === q.question_id && bb.sub_question_id === sq.sub_question_id
          )
        ) {
          acc.push({ question_id: q.question_id, sub_question_id: sq.sub_question_id });
        }
      });
    } else {
      if (
        isListMode ||
        bounding_boxes_data.some(bb => bb.question_id === q.question_id && bb.sub_question_id === undefined)
      ) {
        acc.push({ question_id: q.question_id });
      }
    }
    return acc;
  }, []);

  // Current question index
  const currentIndex = navItems.findIndex(
    item => item.question_id === question_id && item.sub_question_id === sub_question_id
  );
  const prevItem = currentIndex > 0 ? navItems[currentIndex - 1] : undefined;
  const nextItem = currentIndex >= 0 && currentIndex < navItems.length - 1 ? navItems[currentIndex + 1] : undefined;

  // Build question URL
  const buildQHref = (qId: string, sId?: string) => {
    const base = `/instructor/course/${course_id}/process/${assignment_id}/grade-submissions/questions/${qId}`;
    return sId
      ? `${base}/sub-questions/${sId}/${mode}/${submission_id}`
      : `${base}/${mode}/${submission_id}`;
  };

  // Ungraded navigation
  const ungradedSubs = submissionsList.filter(s => !s.grade_status);
  const subIndex = ungradedSubs.findIndex(s => s.submission_id === submission_id);
  const prevUng = subIndex > 0 ? ungradedSubs[subIndex - 1] : undefined;
  const nextUng = subIndex >= 0 && subIndex < ungradedSubs.length - 1 ? ungradedSubs[subIndex + 1] : undefined;

  // Build submission URL
  const buildSHref = (subId: string) => {
    const base = `/instructor/course/${course_id}/process/${assignment_id}/grade-submissions/questions/${question_id}`;
    return sub_question_id
      ? `${base}/sub-questions/${sub_question_id}/${mode}/${subId}`
      : `${base}/${mode}/${subId}`;
  };

  // Handlers
  const handlePrevUng = () => prevUng && router.push(buildSHref(prevUng.submission_id));
  const handlePrev = () => prevItem && router.push(buildQHref(prevItem.question_id, prevItem.sub_question_id));
  const handleNext = () => nextItem && router.push(buildQHref(nextItem.question_id, nextItem.sub_question_id));
  const handleNextUng = () => nextUng && router.push(buildSHref(nextUng.submission_id));

  // Keyboard shortcuts via event listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm') handlePrevUng();
      if (e.key === ',') handlePrev();
      if (e.key === '.') handleNext();
      if (e.key === '/') handleNextUng();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrevUng, handlePrev, handleNext, handleNextUng]);

  // Display count
  const display = currentIndex >= 0 ? currentIndex + 1 : 0;
  const total = navItems.length;

  return (
    <Group
      justify="space-between"
      align="center"
      style={{ width: '100%', height: 45, padding: '0 16px', backgroundColor: '#f5f5f5' }}
    >
      <Text size="sm">
        Question: <Text component="span" fw={700}>{display}</Text> of {total}
      </Text>
      <Group gap="xs">
        <Button variant="outline" disabled={!prevUng} onClick={handlePrevUng}>
          ‹‹ Prev Ungraded
        </Button>
        <Button variant="outline" disabled={!prevItem} onClick={handlePrev}>
          ‹ Prev
        </Button>
        <Button variant="outline" disabled={!nextItem} onClick={handleNext}>
          Next ›
        </Button>
        <Button variant="outline" disabled={!nextUng} onClick={handleNextUng}>
          Next Ungraded ››
        </Button>
      </Group>
    </Group>
  );
};

export default GradeBottomBar;
