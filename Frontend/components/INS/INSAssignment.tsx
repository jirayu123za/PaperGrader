import React from 'react';
import AssignmentSetting from '../Customize/AssignmentSetting';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useFetchAssignments } from '../../hooks/useFetchAssignments';
import { useRouter } from 'next/router';
import { Menu, Button, Paper, Table } from '@mantine/core';
import { useModalAssignmentSettingStore } from '../../store/modal/useAssignmentSettingModal';

interface INTAssignmentProps {
  courseId: string;
}

const INTAssignment: React.FC<INTAssignmentProps> = ({ courseId }) => {
  const { isLoading, error } = useFetchAssignments(courseId, false);
  const router = useRouter();

  const assignments = useAssignmentStore((state) => state.assignments);
  const { openModal } = useModalAssignmentSettingStore();

  const handleEditClick = (assignment_id: string) => {
    openModal(assignment_id);
  };

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments: {error.message}</div>;
  if (!assignments || assignments.length === 0) {
    return <div className="p-6 bg-white shadow rounded-lg">No assignments available.</div>;
  }

  return (
    <Paper shadow="sm" radius="md" withBorder p="xl">
      <h2 className="text-2xl font-semibold mb-4">{assignments.length} Assignments</h2>
      <Table highlightOnHover verticalSpacing="sm" className="min-w-full bg-white">
        <Table.Thead>
          <Table.Tr className="border-b">
            <Table.Th className="py-2 px-4 text-left">NAME</Table.Th>
            <Table.Th className="py-2 px-4 text-left">RELEASED</Table.Th>
            <Table.Th className="py-2 px-4 text-left">DUE</Table.Th>
            <Table.Th className="py-2 px-4 text-center">PUBLISHED</Table.Th>
            <Table.Th className="py-2 px-4 text-center">REGRADES</Table.Th>
            <Table.Th className="py-2 px-4 text-center">SUBMISS BY</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {assignments.map((assignment) => (
            <Table.Tr key={assignment.assignment_id} className="border-b">
              <Table.Td
                className="py-2 px-4 cursor-pointer hover:underline"
                onClick={() => router.push(`/courses/${courseId}/process/${assignment.assignment_id}/CreateOutline`)}
              >
                {assignment.assignment_name}
              </Table.Td>
              <Table.Td className="py-2 px-4">{assignment.assignment_release_date || '-'}</Table.Td>
              <Table.Td className="py-2 px-4">{assignment.assignment_due_date || '-'}</Table.Td>
              <Table.Td className="py-2 px-4">{assignment.published ? 'Yes' : 'No'}</Table.Td>
              <Table.Td className="py-2 px-4">{assignment.regrades ? 'Yes' : 'No'}</Table.Td>
              <Table.Td className="py-2 px-4">{assignment.submiss_by}</Table.Td>
              <Table.Td className="py-2 px-4 text-center">
                <Menu>
                  <Menu.Target>
                    <Button variant="subtle">•••</Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      onClick={() => {
                        handleEditClick(assignment.assignment_id)}}>
                        Assignment Setting
                    </Menu.Item>
                    <Menu.Item color="red">Delete Assignment</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Assignment Setting Modal */}
      <AssignmentSetting/>
    </Paper>
  );
};

export default INTAssignment;
