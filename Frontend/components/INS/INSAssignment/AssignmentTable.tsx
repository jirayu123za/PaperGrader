'use client';

import React from 'react';
import AssignmentSetting from '../../Customize/AssignmentSetting';
import AssignmentSecTable from './AssignmentSecTable';
import { useParams, useRouter } from 'next/navigation';
import { Button, Menu, Anchor, Text, Checkbox, Flex, Table, Paper, Pagination, ActionIcon, Loader } from '@mantine/core';
import { useFetchAssignmentsTable } from '@/hooks/useFetchAssignments';
import { useAssignmentsListTableStore } from '@/store/useAssignmentStore';
import { useModalAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { usePagination } from '@mantine/hooks';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { IconSettings, IconTrash } from '@tabler/icons-react';

interface AssignmentsList {
  assignment_id: string;
  assignment_name: string;
  assignment_sections: AssignmentsSectionList[];
  published: boolean;
  regrades: boolean;
  submiss_by: string;
}

interface AssignmentsSectionList {
  assignment_id: string;
  assignment_section_id: string;
  release_date: string | null;
  due_date: string | null;
  cut_off_date: string | null;
  section_id: string;
  section_name: string;
}

const AssignmentTable: React.FC = () => {
  const router = useRouter();
  const { course_id } = useParams() as { course_id: string };
  const { openModal } = useModalAssignmentSettingStore();
  const { isLoading: isLoadingAssignmentsList } = useFetchAssignmentsTable(course_id);
  const { assignmentList } = useAssignmentsListTableStore();

  const [expandedAssignmentIds, setExpandedAssignmentIds] = React.useState<string[]>([]);
  const [selectedAssignments, setSelectedAssignments] = React.useState<AssignmentsList[]>([]);

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
                paginatedAssignmentsTable.map((assignment) => (
                  <React.Fragment key={assignment.assignment_id}>
                    <Table.Tr bg={selectedAssignments.includes(assignment) ? 'var(--mantine-color-blue-light)' : 'white'}>
                      <Table.Td>
                        <Checkbox 
                          aria-label="Select assignment" 
                          checked={selectedAssignments.includes(assignment)}
                          onChange={(event) => {
                            if (event.currentTarget.checked) {
                              setSelectedAssignments((prev) => [...prev, assignment]);
                            } else {
                              setSelectedAssignments((prev) => prev.filter(a => a !== assignment));
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
                            onClick={() =>
                              setExpandedAssignmentIds((prev) =>
                                prev.includes(assignment.assignment_id)
                                  ? prev.filter((id) => id !== assignment.assignment_id)
                                  : [...prev, assignment.assignment_id]
                              )
                            }
                          >
                            {expandedAssignmentIds.includes(assignment.assignment_id) ? <FiChevronUp /> : <FiChevronDown />}
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

                    {expandedAssignmentIds.includes(assignment.assignment_id) && (
                      <Table.Tr>
                        <Table.Td colSpan={7} p={0} className='bg-gray-50'>
                          <AssignmentSecTable assignment={assignment} />
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </React.Fragment>
                ))
              )}
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