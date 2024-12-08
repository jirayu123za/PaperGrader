import React from 'react';
import AssignmentSetting from '../../Customize/AssignmentSetting';
import { useAssignmentStore } from '../../../store/useAssignmentStore';
import { useFetchAssignments } from '../../../hooks/useFetchAssignments';
import { useRouter } from 'next/router';
import { Menu, Button, Paper, Table, Skeleton, Pagination, Collapse, Checkbox } from '@mantine/core';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useModalAssignmentSettingStore } from '../../../store/modal/useAssignmentSettingModal';
import { usePagination } from '@mantine/hooks';
import SecAssignment from './SecAssignment';
import { useForm } from '@mantine/form';
import { useSelectSectionStore } from '../../../store/useSectionStore';



interface INTAssignmentProps {
  courseId: string;
}

const INTAssignment: React.FC<INTAssignmentProps> = ({ courseId }) => {
  const router = useRouter();
  const assignments = useAssignmentStore((state) => state.assignments);
  const { isLoading, error } = useFetchAssignments(courseId, false);
  const { setSelectedSections } = useSelectSectionStore();
  const { openModal } = useModalAssignmentSettingStore();

  const form = useForm<Record<string, boolean | undefined>>({
    initialValues: {},
  });

  const pageSize = 10;
  const totalPages = Math.ceil(assignments.length / pageSize);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
    siblings: 1,
    boundaries: 1,
  });

  const paginatedData = assignments.slice(
    (pagination.active - 1) * pageSize,
    pagination.active * pageSize
  );

  if (error) return <div>Error loading assignments: {error.message}</div>;
  if (!assignments || assignments.length === 0) {
    return <div className="p-6 bg-white shadow rounded-lg">No assignments available.</div>;
  }

  const handleCheckboxChange = (assignmentId: string, checked: boolean) => {
    setSelectedSections((prev: string[]) => {
      const updatedSections = checked
        ? [...prev, assignmentId]
        : prev.filter((id) => id !== assignmentId);
      return updatedSections;
    });
    form.setFieldValue(assignmentId, checked);
  };


  return (
    <Paper shadow="sm" radius="md" withBorder p="xl">
      <h2 className="text-2xl font-semibold mb-4">{assignments.length} Assignments</h2>
      <Table highlightOnHover verticalSpacing="sm" className="min-w-full bg-white">
        <Table.Thead>
          <Table.Tr className="border-b">
            <Table.Th className="py-2 px-4 text-left">SELECT</Table.Th>
            <Table.Th className="py-2 px-4 text-left">NAME</Table.Th>
            <Table.Th className="py-2 px-4 text-left">RELEASED</Table.Th>
            <Table.Th className="py-2 px-4 text-left">DUE</Table.Th>
            <Table.Th className="py-2 px-4 text-center">PUBLISHED</Table.Th>
            <Table.Th className="py-2 px-4 text-center">REGRADES</Table.Th>
            <Table.Th className="py-2 px-4 text-center">SUBMISS BY</Table.Th>
            <Table.Th className="py-2 px-4 text-center">ACTIONS</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
              <Table.Tr key={`skeleton-row-${index}`}>
                <Table.Td>
                  <Skeleton visible height={20} width="100%" />
                </Table.Td>
                <Table.Td>
                  <Skeleton visible height={20} width="50%" />
                </Table.Td>
                <Table.Td>
                  <Skeleton visible height={20} width="50%" />
                </Table.Td>
                <Table.Td>
                  <Skeleton visible height={20} width="30%" />
                </Table.Td>
                <Table.Td>
                  <Skeleton visible height={20} width="30%" />
                </Table.Td>
                <Table.Td>
                  <Skeleton visible height={20} width="50%" />
                </Table.Td>
              </Table.Tr>
            ))
            : paginatedData.map((assignment) => (
              <React.Fragment key={assignment.assignment_id}>
                <Table.Tr className="border-b">
                  <Table.Td>
                    <Checkbox
                      checked={!!form.values[assignment.assignment_id]}
                      onChange={(e) =>
                        handleCheckboxChange(assignment.assignment_id, e.currentTarget.checked)
                      }
                    />
                  </Table.Td>
                  <Table.Td className="py-2 px-4 flex items-center gap-2">
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() =>
                        router.push(
                          `/courses/${courseId}/process/${assignment.assignment_id}/CreateOutline`
                        )
                      }
                    >
                      {assignment.assignment_name}
                    </span>
                    <Button
                      variant="subtle"
                      onClick={() => {
                        const isExpanded = form.values[`${assignment.assignment_id}_expanded`];
                        form.setFieldValue(`${assignment.assignment_id}_expanded`, !isExpanded);

                        if (isExpanded) {
                          form.setFieldValue(`${assignment.assignment_id}`, false);
                          setSelectedSections([]);
                        }
                      }}
                    >
                      {form.values[`${assignment.assignment_id}_expanded`] ? <FiChevronUp /> : <FiChevronDown />}
                    </Button>
                  </Table.Td>
                  <Table.Td className="py-2 px-4">
                    {assignment.assignment_release_date || '-'}
                  </Table.Td>
                  <Table.Td className="py-2 px-4">{assignment.assignment_due_date || '-'}</Table.Td>
                  <Table.Td className="py-2 px-4 text-center">
                    {assignment.published ? 'Yes' : 'No'}
                  </Table.Td>
                  <Table.Td className="py-2 px-4 text-center">
                    {assignment.regrades ? 'Yes' : 'No'}
                  </Table.Td>
                  <Table.Td className="py-2 px-4">{assignment.submiss_by}</Table.Td>
                  <Table.Td className="py-2 px-4 text-center">
                    <Menu>
                      <Menu.Target>
                        <Button variant="subtle">•••</Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          onClick={() => {
                            openModal(assignment.assignment_id);
                          }}
                        >
                          Assignment Setting
                        </Menu.Item>
                        <Menu.Item color="red">Delete Assignment</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Collapse in={!!form.values[`${assignment.assignment_id}_expanded`]}>
                      <SecAssignment
                        assignmentId={assignment.assignment_id}
                        courseId={courseId}
                        parentChecked={form.values[assignment.assignment_id]}
                        expanded={form.values[`${assignment.assignment_id}_expanded`]}
                      />
                    </Collapse>

                  </Table.Td>
                </Table.Tr>
              </React.Fragment>
            ))}
        </Table.Tbody>
      </Table>

      <div className="flex justify-center mt-4">
        <Pagination
          total={totalPages}
          siblings={1}
          boundaries={1}
          value={pagination.active}
          onChange={pagination.setPage}
        />
      </div>

      {/* Assignment Setting Modal */}
      <AssignmentSetting />
    </Paper>
  );
};

export default INTAssignment;
