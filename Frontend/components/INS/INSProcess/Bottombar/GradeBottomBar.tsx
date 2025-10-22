"use client";

import React, { useEffect } from 'react';
import {Group, Button, Text, Tooltip, Kbd, Popover, ActionIcon, Table,} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useFetchTotalSubmissionIDs } from '@/hooks/useFetchGradeBottom';
import { useTotalSubmissionsStore } from '@/store/useGradeBottomStore';
import { useRubricGradeStore } from '@/store/rubric/useRubricGradeStore';


const GradeBottomBar: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;
  const submission_id = params.submission_id as string;
  const question_id = params.question_id as string;
  const sub_question_id = params.sub_question_id as string | undefined;

  const { isLoading } = useFetchTotalSubmissionIDs(assignment_id);
  const totalSubs = useTotalSubmissionsStore((s) => s.total);

  const isListMode = pathname.includes('/lists/');
  const mode = isListMode ? 'lists' : 'submissions';

  const currentIndex = totalSubs.findIndex((s) => s.submission_id === submission_id);
  const prevSub = currentIndex > 0 ? totalSubs[currentIndex - 1] : undefined;
  const nextSub = currentIndex >= 0 && currentIndex < totalSubs.length - 1 ? totalSubs[currentIndex + 1] : undefined;

  const editingRubricID = useRubricGradeStore((s) => s.editingRubricID);
  const editingDescriptionID = useRubricGradeStore((s) => s.editingDescriptionID);


const isTypingInEditable = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if ((t as HTMLElement).isContentEditable) return true;
  if (t.closest('[contenteditable="true"]')) return true;
  if (t.closest('[role="textbox"]')) return true;
  return false;
};

  const findPrevUngraded = () => {
    if (currentIndex <= 0) return undefined;
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!totalSubs[i].has_grade) return totalSubs[i];
    }
    return undefined;
  };

  const findNextUngraded = () => {
    if (currentIndex < 0) return undefined;
    for (let i = currentIndex + 1; i < totalSubs.length; i++) {
      if (!totalSubs[i].has_grade) return totalSubs[i];
    }
    return undefined;
  };

  const prevUng = findPrevUngraded();
  const nextUng = findNextUngraded();

  const buildSHref = (subId: string) => {
    const base = `/instructor/course/${course_id}/process/${assignment_id}/grade-submissions/questions/${question_id}`;
    return sub_question_id ? `${base}/sub-questions/${sub_question_id}/${mode}/${subId}` : `${base}/${mode}/${subId}`;
  };

  // Handlers
  const handlePrev = () => prevSub && router.push(buildSHref(prevSub.submission_id));
  const handleNext = () => nextSub && router.push(buildSHref(nextSub.submission_id));
  const handlePrevUng = () => prevUng && router.push(buildSHref(prevUng.submission_id));
  const handleNextUng = () => nextUng && router.push(buildSHref(nextUng.submission_id));

  useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (isTypingInEditable(e)) return;
    if (editingRubricID || editingDescriptionID) return;

    const key = e.key;
    if (key === 'm' || key === 'M') handlePrevUng();
    if (key === ',' || key === '<') handlePrev();
    if (key === '.' || key === '>') handleNext();
    if (key === '/' || key === '?') handleNextUng();
  };
  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}, [prevSub, nextSub, prevUng, nextUng, editingRubricID, editingDescriptionID]);
  const display = currentIndex >= 0 ? currentIndex + 1 : 0;
  const total = totalSubs.length;

  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <span style={{ display: 'inline-block' }}>{children}</span>
  );

  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <Group
      justify="space-between"
      align="center"
      style={{ width: '100%', height: '40px', padding: '0 16px', backgroundColor: '#f5f5f5' }}
    >
      <Text size="sm">
        Submission: <Text component="span" fw={700}>{display}</Text> of {total}
      </Text>

      <Group gap="xs">
        <Tooltip label="Shortcut: M" withArrow>
          <Wrap>
            <Button
              variant="outline"
              color="violet"
              size="xs"
              disabled={!prevUng}
              onClick={handlePrevUng}
              aria-label="Prev Ungraded (Shortcut: M)"
              rightSection={<Kbd size="xs">M</Kbd>}
            >
              ‹‹ Prev Ungraded
            </Button>
          </Wrap>
        </Tooltip>

        <Tooltip label="Shortcut: <  or  ," withArrow>
          <Wrap>
            <Button
              variant="outline"
              color="violet"
              size="xs"
              disabled={!prevSub}
              onClick={handlePrev}
              aria-label="Prev (Shortcut: < or ,)"
              rightSection={
                <Group gap={4}>
                  <Kbd size="xs">{'<'}</Kbd>

                </Group>
              }
            >
              ‹ Prev
            </Button>
          </Wrap>
        </Tooltip>

        <Tooltip label="Shortcut: >  or  ." withArrow>
          <Wrap>
            <Button
              variant="outline"
              color="violet"
              size="xs"
              disabled={!nextSub}
              onClick={handleNext}
              aria-label="Next (Shortcut: > or .)"
              rightSection={
                <Group gap={4}>
                  <Kbd size="xs">{'>'}</Kbd>
                </Group>
              }
            >
              Next ›
            </Button>
          </Wrap>
        </Tooltip>

        <Tooltip label="Shortcut: ?  or  /" withArrow>
          <Wrap>
            <Button
              variant="outline"
              color="violet"
              size="xs"
              disabled={!nextUng}
              onClick={handleNextUng}
              aria-label="Next Ungraded (Shortcut: ? or /)"
              rightSection={
                <Group gap={4}>
                  <Kbd size="xs">/</Kbd>
                </Group>
              }
            >
              Next Ungraded ››
            </Button>
          </Wrap>
        </Tooltip>


        <Popover
          opened={opened}
          onChange={close}
          position="top-end"
          withArrow
          shadow="md"
          trapFocus={false}
          closeOnEscape
          closeOnClickOutside
        >
          <Popover.Target>
            <ActionIcon
              variant="light"
              color="gray"
              onClick={toggle}
              aria-label="Show keyboard shortcuts"
              size="md"
            >
              <Text fw={700}>?</Text>
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Text fw={700} mb="xs">Keyboard Shortcuts</Text>
            <Table withRowBorders={false} highlightOnHover={false} striped={false}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Shortcut</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>Prev Ungraded</Table.Td>
                  <Table.Td><Kbd>M</Kbd></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Prev</Table.Td>
                  <Table.Td>
                    <Group gap={6}>
                      <Kbd>{'<'}</Kbd>
                      <Text size="xs">or</Text>
                      <Kbd>,</Kbd>
                    </Group>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Next</Table.Td>
                  <Table.Td>
                    <Group gap={6}>
                      <Kbd>{'>'}</Kbd>
                      <Text size="xs">or</Text>
                      <Kbd>.</Kbd>
                    </Group>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Next Ungraded</Table.Td>
                  <Table.Td>
                    <Group gap={6}>
                      <Kbd>?</Kbd>
                      <Text size="xs">or</Text>
                      <Kbd>/</Kbd>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Group>
  );
};

export default GradeBottomBar;
