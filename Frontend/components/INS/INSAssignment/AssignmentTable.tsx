'use client';

import React from 'react';
import AssignmentSetting from '../../Customize/AssignmentSetting';
import AssignmentSecTable from './AssignmentSecTable';
import { useParams, useRouter } from 'next/navigation';
import { Button, Menu, Anchor, Text, Checkbox, Flex, Table, Paper, Pagination, ActionIcon } from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import { useFetchAssignmentsTable } from '@/hooks/useFetchAssignments';
import { useAssignmentsListTableStore } from '@/store/useAssignmentStore';
import { useModalAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { IconSettings, IconTrash } from '@tabler/icons-react';
import { useAssignmentSectionStore, useExpandedAssignmentStore } from '@/store/table/useAssignmentsListStore';

const AssignmentTable: React.FC = () => {
  const router = useRouter();
  const { course_id } = useParams() as { course_id: string };
  const { openModal } = useModalAssignmentSettingStore();
  const { isLoading: isLoadingAssignmentsList } = useFetchAssignmentsTable(course_id);
  const { assignmentList } = useAssignmentsListTableStore();

  const { expandedAssignmentIDs, toggleExpandedAssignmentID } = useExpandedAssignmentStore();
  const { addSectionIDs, removeSectionIDs, selectedAssignmentIDs, selectedSectionIDs, setAssignmentID, removeAssignmentID } = useAssignmentSectionStore();

  const pageSize = 8;
  const totalPages = assignmentList ? Math.ceil(assignmentList.length / pageSize) : 1;
  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
  });
  const startIndex = (pagination.active - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAssignmentsTable = assignmentList.slice(startIndex, endIndex);
  
  return (
    <Flex direction="column" gap="md">
      <Text fw={600} size="xl" mb="md">
        {assignmentList.length} Assignments
      </Text>

      <Paper withBorder mb="md">
        <Table.ScrollContainer minWidth="100%" maxHeight={905} className='no-scroll-padding'>
          <Table verticalSpacing="xs" horizontalSpacing="xs">
            <Table.Thead className='bg-gray-100 h-14'>
              <Table.Tr>
                <Table.Th w={50}></Table.Th>
                <Table.Th w={300}>NAME</Table.Th>
                <Table.Th w={160}>PUBLISHED GRADE</Table.Th>
                <Table.Th w={120}>REGRADES</Table.Th>
                <Table.Th w={150}>SUBMIT BY</Table.Th>
                <Table.Th w={120}>SECTIONS</Table.Th>
                <Table.Th w={100}>ACTIONS</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoadingAssignmentsList ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text ta="center">Loading...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedAssignmentsTable.map((assignment) => {
                  const sectionIDs = assignment.assignment_sections.map(s => s.assignment_section_id);
                  const selectedSectionIDsInThisAssignment = sectionIDs.filter(id => selectedSectionIDs.includes(id));
                  const isChecked = selectedSectionIDsInThisAssignment.length === sectionIDs.length;
                  const isIndeterminate = selectedSectionIDsInThisAssignment.length > 0 && !isChecked;

                  return (
                    <React.Fragment key={assignment.assignment_id}>
                      <Table.Tr bg={selectedAssignmentIDs.includes(assignment.assignment_id) ? 'var(--mantine-color-blue-light)' : 'white'}>
                        <Table.Td>
                          <Checkbox 
                            aria-label="Select assignment" 
                            checked={isChecked}
                            indeterminate={isIndeterminate}
                            onChange={(event) => {
                              const isNowChecked = event.currentTarget.checked;
                              if (isNowChecked) {
                                setAssignmentID(assignment.assignment_id);
                                addSectionIDs(sectionIDs);
                              } else {
                                removeAssignmentID(assignment.assignment_id);
                                removeSectionIDs(sectionIDs);
                              }
                            }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Flex align="center">
                            <Anchor lineClamp={1} c="black" size="sm" title={assignment.assignment_name} 
                              onClick={() => router.push(`/instructor/course/${course_id}/process/${assignment.assignment_id}/create-outline`)}>
                              {assignment.assignment_name}
                            </Anchor>
                            <ActionIcon
                              variant="transparent"
                              onClick={() => toggleExpandedAssignmentID(assignment.assignment_id)}
                            >
                              {expandedAssignmentIDs.includes(assignment.assignment_id) ? <FiChevronUp /> : <FiChevronDown />}
                            </ActionIcon>
                          </Flex>
                        </Table.Td>
                        <Table.Td>{assignment.published ? 'Yes' : 'No'}</Table.Td>
                        <Table.Td>{assignment.regrades ? 'Yes' : 'No'}</Table.Td>
                        <Table.Td>{assignment.submiss_by}</Table.Td>
                        <Table.Td>{assignment.assignment_sections.length}</Table.Td>                      
                        <Table.Td>
                          <Menu shadow="md">
                            <Menu.Target>
                              <Button variant="transparent">•••</Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => openModal(assignment.assignment_id)}>Settings</Menu.Item>
                              <Menu.Item color="red" leftSection={<IconTrash size={14} />}>Delete</Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>

                      {expandedAssignmentIDs.includes(assignment.assignment_id) && (
                        <Table.Tr>
                          <Table.Td colSpan={7} p={0} className='bg-gray-50'>
                            <AssignmentSecTable assignment={assignment} />
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </React.Fragment>
                  );
                }
              ))}
            </Table.Tbody>
          </Table> 
        </Table.ScrollContainer>       
      </Paper>
      <Pagination gap={0}
        total={totalPages}
        siblings={1}
        boundaries={1}
        value={pagination.active}
        onChange={pagination.setPage}
      />
      <AssignmentSetting />
    </Flex>
  );
};

export default AssignmentTable;