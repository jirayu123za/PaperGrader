'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AssignmentSetting from '../../Customize/AssignmentSetting';
import AssignmentSecTable from './AssignmentSecTable';
import { useParams, useRouter } from 'next/navigation';
import {Button,Menu,Anchor,Text,Flex,Table,Paper,Pagination,ActionIcon,Image,} from '@mantine/core';
import { usePagination, useViewportSize, useDisclosure } from '@mantine/hooks';
import { useFetchAssignmentsTable } from '@/hooks/useFetchAssignments';
import { useAssignmentsListTableStore } from '@/store/useAssignmentStore';
import { useModalAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { IconSettings, IconTrash } from '@tabler/icons-react';
import { useExpandedAssignmentStore } from '@/store/table/useAssignmentsListStore';
import ConfirmDeleteModal from './ConfirmDeleteModal';

type SelectedAssignment = {
  id: string;
  name: string;
} | null;

const AssignmentTable: React.FC = () => {
  const router = useRouter();
  const { course_id } = useParams() as { course_id: string };
  const { openModal } = useModalAssignmentSettingStore();
  const { isLoading: isLoadingAssignmentsList } = useFetchAssignmentsTable(course_id);
  const { assignmentList } = useAssignmentsListTableStore();
  const { expandedAssignmentIDs, toggleExpandedAssignmentID } = useExpandedAssignmentStore();
  const { height: viewportH } = useViewportSize();
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<SelectedAssignment>(null);

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
    
  const startIndex = (pagination.active - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedAssignmentsTable = assignmentList?.slice(startIndex, endIndex) ?? [];

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


  const handleAskDelete = (id: string, name: string) => {
    setSelectedAssignment({ id, name });
    openDelete();
  };


  const handleConfirmDelete = async () => {
    if (!selectedAssignment) return;
    setDeleteLoading(true);
    try {

    } finally {
      setDeleteLoading(false);
      closeDelete();
      setSelectedAssignment(null);
    }
  };

  const tableMaxHeight = useMemo(() => {
    if (viewportH < 700) return viewportH - 170;
    if (viewportH < 900) return viewportH - 210;
    return viewportH - 250;
  }, [viewportH]);

  return (
    <Flex direction="column" gap="md">
      <Paper withBorder mb="md">
        <Table.ScrollContainer minWidth="auto" maxHeight={tableMaxHeight} className="no-scroll-padding">
          <Table verticalSpacing="xs" horizontalSpacing="xl">
            <Table.Thead className="bg-gray-100 h-14" >
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
                            <Menu.Item
                              color="red"
                              leftSection={<IconTrash size={14} />}
                              onClick={() =>
                                handleAskDelete(
                                  assignment.assignment_id,
                                  assignment.assignment_name.charAt(0).toUpperCase() +
                                    assignment.assignment_name.slice(1)
                                )
                              }
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
                      gap={0}
                      size="sm"
                    />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table></Table.ScrollContainer>
      </Paper>


      <ConfirmDeleteModal
        opened={deleteOpened}
        onClose={() => {
          closeDelete();
          setSelectedAssignment(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={selectedAssignment?.name}
        loading={deleteLoading}
        size="sm"
        title="Delete confirmation"
      />

      <AssignmentSetting />
    </Flex>
  );
};

export default AssignmentTable;
