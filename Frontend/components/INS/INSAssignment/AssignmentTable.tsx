'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AssignmentSetting from '@/components/Customize/AssignmentSetting';
import AssignmentSecTable from '@/components/INS/INSAssignment/AssignmentSecTable';
import { useParams, useRouter } from 'next/navigation';
import { Button, Menu, Anchor, Text, Flex, Table, Paper, Pagination, ActionIcon, Image, Title, Tooltip } from '@mantine/core';
import { usePagination, useViewportSize, useDisclosure } from '@mantine/hooks';
import { useFetchAssignmentsTable } from '@/hooks/useFetchAssignments';
import { useAssignmentsListTableStore } from '@/store/useAssignmentStore';
import { useModalAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { IconSettings, IconTrash } from '@tabler/icons-react';
import { useExpandedAssignmentStore } from '@/store/table/useAssignmentsListStore';
import DeleteAssignmentModal from '@/components/INS/INSAssignment/DeleteAssignmentModal';

const AssignmentTable: React.FC = () => {
  const router = useRouter();
  const { course_id } = useParams() as { course_id: string };
  const [ opened, { open, close } ] = useDisclosure(false); 
  const { openModal } = useModalAssignmentSettingStore();
  const { isLoading: isLoadingAssignmentsList } = useFetchAssignmentsTable(course_id);
  const { assignmentList } = useAssignmentsListTableStore();
  const { expandedAssignmentIDs, toggleExpandedAssignmentID } = useExpandedAssignmentStore();
  const { height: viewportH } = useViewportSize();
  const [ selectedAssignment, setSelectedAssignment ] = useState<{ id: string; name: string } | null>(null);

  const rowsPerPage = useMemo(() => {
    if (viewportH < 700) return 4;
    if (viewportH < 900) return 6;
    return 10;
  }, [viewportH]);

  const totalPages = useMemo(() => {
    return assignmentList.length > 0 ? Math.ceil(assignmentList.length / rowsPerPage) : 1;
  }, [assignmentList, rowsPerPage]);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
  });

  useEffect(() => {
    if (pagination.active > totalPages) {
      pagination.setPage(totalPages);
    }
  }, [totalPages, pagination.active]);
  
  const tableMaxHeight = useMemo(() => {
    if (viewportH < 700) return viewportH - 170;
    if (viewportH < 900) return viewportH - 210;
    return viewportH - 250;
  }, [viewportH]);

  const startIndex = (pagination.active - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedAssignmentsTable = assignmentList?.slice(startIndex, endIndex) ?? [];

  const handleCloseModal = () => {
    close();
    setSelectedAssignment(null);
  };
  
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
      <Paper withBorder mb="md">
        <Table.ScrollContainer minWidth="auto" maxHeight={tableMaxHeight} className="no-scroll-padding">
          <Table verticalSpacing="xs" horizontalSpacing="xl">
            <Table.Thead className="bg-gray-100 h-14" >
              <Table.Tr>
                <Table.Th w={200}>
                  <Title order={6} lineClamp={1}>Name</Title>
                </Table.Th>
                <Table.Th w={120}>
                  <Title order={6} lineClamp={1}>Regrades</Title>
                </Table.Th>
                <Table.Th w={120}>
                  <Tooltip label="User who submitted the assignment" withArrow>
                    <Title order={6} lineClamp={1}>Submitted by</Title>
                  </Tooltip>
                </Table.Th>
                <Table.Th w={120}>
                  <Title order={6} lineClamp={1}>Sections</Title>
                </Table.Th>
                <Table.Th w={100}>
                  <Title order={6} lineClamp={1}>Actions</Title>
                </Table.Th>
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
                paginatedAssignmentsTable.map((assignment) => (
                  <React.Fragment key={assignment.assignment_id}>
                    <Table.Tr>
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
                            color='#4C6EF5'
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
                            <Button variant="subtle" color="#4C6EF5">•••</Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              color="#4C6EF5"
                              leftSection={<IconSettings size={14} />}
                              onClick={() => openModal(assignment.assignment_id)}
                            >
                              Settings
                            </Menu.Item>
                            <Menu.Item
                              color="red"
                              leftSection={<IconTrash size={14} />}
                              onClick={() => {
                                setSelectedAssignment({ id: assignment.assignment_id, name: assignment.assignment_name });
                                open();
                              }}
                            >
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

            <Table.Tfoot>
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
                      size="sm"
                      color="#4C6EF5"
                    />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      <DeleteAssignmentModal
        opened={opened}
        onClose={handleCloseModal}
        assignmentID={selectedAssignment?.id || null}
        assignmentName={selectedAssignment?.name || undefined}
      />

      <AssignmentSetting />
    </Flex>
  );
};

export default AssignmentTable;
