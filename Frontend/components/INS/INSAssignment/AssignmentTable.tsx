'use client';

import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import AssignmentSetting from '../../Customize/AssignmentSetting';
import AssignmentSecTable from './AssignmentSecTable';
import { useParams, useRouter } from 'next/navigation';
import {Button,Menu,Anchor,Text,Flex,Table,Paper,Pagination,ActionIcon,Image,} from '@mantine/core';
import { usePagination, useViewportSize } from '@mantine/hooks';
import { useFetchAssignmentsTable } from '@/hooks/useFetchAssignments';
import { useAssignmentsListTableStore } from '@/store/useAssignmentStore';
import { useModalAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { IconSettings, IconTrash } from '@tabler/icons-react';
import { useExpandedAssignmentStore } from '@/store/table/useAssignmentsListStore';

const AssignmentTable: React.FC = () => {
  const router = useRouter();
  const { course_id } = useParams() as { course_id: string };
  const { openModal } = useModalAssignmentSettingStore();
  const { isLoading: isLoadingAssignmentsList } = useFetchAssignmentsTable(course_id);
  const { assignmentList } = useAssignmentsListTableStore();
  const { expandedAssignmentIDs, toggleExpandedAssignmentID } = useExpandedAssignmentStore();
  const { height: viewportH } = useViewportSize();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const theadRef = useRef<HTMLTableSectionElement | null>(null);
  const tfootRef = useRef<HTMLTableSectionElement | null>(null);
  const sampleRowRef = useRef<HTMLTableRowElement | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(8);

  useLayoutEffect(() => {
    const sectionTop = sectionRef.current?.getBoundingClientRect().top ?? 0;
    const bottomPadding = 12;
    const availableViewport = Math.max(0, viewportH - sectionTop - bottomPadding);
    const theadH = theadRef.current?.getBoundingClientRect().height ?? 0;
    const tfootH = tfootRef.current?.getBoundingClientRect().height ?? 0;
    const rowH = sampleRowRef.current?.getBoundingClientRect().height ?? 48;
    const paperVerticalPadding = 50;
    const dividerH = 0; 
    const availableForRows = availableViewport - theadH - tfootH - paperVerticalPadding - dividerH;
    const fit = Math.max(1, Math.floor(availableForRows / rowH));
    setRowsPerPage(fit);
  }, [viewportH, assignmentList.length]);

  const totalPages = useMemo(() => {
    return assignmentList && rowsPerPage > 0
      ? Math.ceil(assignmentList.length / rowsPerPage)
      : 1;
  }, [assignmentList, rowsPerPage]);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
  });

  const startIndex = (pagination.active - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedAssignmentsTable =
    assignmentList?.slice(startIndex, endIndex) ?? [];

  if (!isLoadingAssignmentsList && assignmentList.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center" gap="sm" py="xl">
        <Image
          src="/Image/table/no_data.svg"
          alt="No assignments"
          w="auto"
          h={150}
          fit="contain"
          fallbackSrc="https://placehold.co/200x200?text=Placeholder"
        />
        <Text size="lg" fw={500} mt="md">
          No assignments found
        </Text>
        <Text size="sm" c="dimmed">
          You haven’t created any assignments yet.
        </Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="md">
      <div ref={sectionRef}>
        <Paper withBorder mb="md" style={{ overflow: 'hidden' }}>
          <Table verticalSpacing="xs" horizontalSpacing="xl">
            <Table.Thead className="bg-gray-100 h-14" ref={theadRef}>
              <Table.Tr>
                <Table.Th w={200}>Name</Table.Th>
                <Table.Th w={120}>Regrades</Table.Th>
                <Table.Th w={120}>Submitted by</Table.Th>
                <Table.Th w={120}>Sections</Table.Th>
                <Table.Th w={100}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {isLoadingAssignmentsList ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center">Loading.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedAssignmentsTable.map((assignment, idx) => (
                  <React.Fragment key={assignment.assignment_id}>
                    <Table.Tr ref={idx === 0 ? sampleRowRef : undefined}>
                      <Table.Td>
                        <Flex align="center">
                          <Anchor
                            lineClamp={1}
                            c="black"
                            size="sm"
                            title={
                              assignment.assignment_name.charAt(0).toUpperCase() +
                              assignment.assignment_name.slice(1)
                            }
                            onClick={() =>
                              router.push(
                                `/instructor/course/${course_id}/process/${assignment.assignment_id}/create-outline`
                              )
                            }
                          >
                            {assignment.assignment_name.charAt(0).toUpperCase() +
                              assignment.assignment_name.slice(1)}
                          </Anchor>
                          <ActionIcon
                            variant="transparent"
                            onClick={() =>
                              toggleExpandedAssignmentID(assignment.assignment_id)
                            }
                          >
                            {expandedAssignmentIDs.includes(assignment.assignment_id) ? (
                              <FiChevronUp />
                            ) : (
                              <FiChevronDown />
                            )}
                          </ActionIcon>
                        </Flex>
                      </Table.Td>
                      <Table.Td pl="50px">
                        {assignment.regrades ? 'Yes' : 'No'}
                      </Table.Td>
                      <Table.Td pl="50px">
                        {assignment.submitted_by.charAt(0).toUpperCase() +
                          assignment.submitted_by.slice(1)}
                      </Table.Td>
                      <Table.Td pl="50px">
                        {assignment.assignment_sections.length}
                      </Table.Td>
                      <Table.Td>
                        <Menu shadow="md">
                          <Menu.Target>
                            <Button variant="transparent">•••</Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconSettings size={14} />}
                              onClick={() => openModal(assignment.assignment_id)}
                            >
                              Settings
                            </Menu.Item>
                            <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>

                    {expandedAssignmentIDs.includes(assignment.assignment_id) && (
                      <Table.Tr>
                        <Table.Td colSpan={7} p={0} className="bg-gray-50">
                          <AssignmentSecTable assignment={assignment} />
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </Table.Tbody>

            <Table.Tfoot ref={tfootRef}>
              <Table.Tr>
                <Table.Td colSpan={7} className="border-t border-gray-300">
                  <Flex align="center" w="100%" justify="space-between">
                    <Text size="sm" c="dimmed">
                      Total assignments: {assignmentList.length}
                    </Text>
                    <Pagination
                      total={totalPages}
                      siblings={1}
                      boundaries={1}
                      value={pagination.active}
                      onChange={pagination.setPage}
                      gap={0}
                      size="sm"
                    />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Paper>
      </div>

      <AssignmentSetting />
    </Flex>
  );
};

export default AssignmentTable;
