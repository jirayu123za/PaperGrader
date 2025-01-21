import React from 'react';
import AssignmentSetting from '../../Customize/AssignmentSetting';
import SecAssignment from './SecAssignment';
import { useInsAssignmentStore } from '../../../store/useAssignmentStore';
import { useFetchInsAssignments } from '../../../hooks/useFetchAssignments';
import { useRouter } from 'next/router';
import { Menu, Button, Paper, Table, Skeleton, Pagination, Collapse, Checkbox, Title, ScrollArea } from '@mantine/core';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useModalAssignmentSettingStore } from '../../../store/modal/useAssignmentSettingModal';
import { usePagination } from '@mantine/hooks';
import { useSelectSectionStore } from '../../../store/useSectionStore';
import { useAssignmentExpandStore, useSelectedAssignmentStore } from '../../../store/Table/useInsAssignmentTableStore';

const INTAssignment: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { openModal } = useModalAssignmentSettingStore();
  const { setSelectedSections } = useSelectSectionStore();
  const { expandedAssignments, toggleAssignment } = useAssignmentExpandStore();
  const { selectedAssignmentID, setSelectedAssignmentID, setSelectedAssignmentSections, resetAssignmentSelection } = useSelectedAssignmentStore();
  const { isLoading, error } = useFetchInsAssignments(course_id as string);
  const insAssignments = useInsAssignmentStore((state) => state.insAssignments);

  const handleCheckboxChange = (checked: boolean, assignmentSections: any[], assignment: any) => {
    const sectionIds = assignmentSections.map((section) => section.section_id);

    setSelectedSections((prev) =>
      checked
        ? [...prev, ...sectionIds]
        : prev.filter((id) => !sectionIds.includes(id))
    );

    if (selectedAssignmentID === assignment.assignment_id) {
      resetAssignmentSelection();
      toggleAssignment(assignment.assignment_id);
    } else {
      if (selectedAssignmentID && expandedAssignments[selectedAssignmentID]) {
        toggleAssignment(selectedAssignmentID);
      }
      setSelectedAssignmentID(assignment.assignment_id);
      setSelectedAssignmentSections(assignment.assignment_sections.map((section: any) => section.assignment_section_id));
      if (!expandedAssignments[assignment.assignment_id]) {
        toggleAssignment(assignment.assignment_id);
      }
    }

    console.log("Selected section names:", sectionIds);
  };

  const pageSize = 8;
  const totalPages = insAssignments ? Math.ceil(insAssignments.length / pageSize) : 1;

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
    siblings: 1,
    boundaries: 1,
  });

  const paginatedData = insAssignments
  ? insAssignments.slice(
      (pagination.active - 1) * pageSize,
      pagination.active * pageSize
    )
  : [];

  if (error) return <div>Error loading assignments: {error.message}</div>;
  if (!insAssignments || insAssignments.length === 0) {
    return <div className="p-6 bg-white shadow rounded-lg">No assignments available.</div>;
  }

  return (
    <Paper shadow="sm" radius="md" withBorder p="xl">
      <h2 className="text-2xl font-semibold mb-4">{insAssignments.length} Assignments</h2>
      <Table highlightOnHover verticalSpacing="md" className="min-w-full bg-white">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '10%' }}>SELECT</Table.Th>
            <Table.Th>NAME</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center' }}>PUBLISHED GRADE</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center' }}>REGRADES </Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center' }}>SUBMIT BY</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center' }}>ACTIONS</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
              <Table.Tr key={`skeleton-row-${index}`}>
                <Table.Td style={{ width: '3%' }}>
                  <Skeleton visible height={25} />
                </Table.Td>
                <Table.Td style={{ width: '20%' }}>
                  <Skeleton visible height={25} />
                </Table.Td>
                <Table.Td style={{ textAlign: 'center', width: '10%' }}>
                  <Skeleton visible height={25} />
                </Table.Td>
                <Table.Td style={{ textAlign: 'center', width: '10%' }}>
                  <Skeleton visible height={25} />
                </Table.Td>
                <Table.Td style={{ textAlign: 'center', width: '10%' }}>
                  <Skeleton visible height={25} />
                </Table.Td>
                <Table.Td style={{ textAlign: 'center', width: '5%' }}>
                  <Skeleton visible height={25} />
                </Table.Td>
              </Table.Tr>
            ))
            : paginatedData.map((assignment) => (
              <React.Fragment key={assignment.assignment_id}>
                <Table.Tr className="border-b">
                  <Table.Td>
                    <Checkbox
                      checked={selectedAssignmentID === assignment.assignment_id}
                      onChange={(event) =>
                        handleCheckboxChange(event.currentTarget.checked, assignment.assignment_sections, assignment)
                      }
                    />
                  </Table.Td>
                  <Table.Td className="py-2 px-4 flex items-center gap-2">
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() =>
                        router.push(
                          `/courses/${course_id}/process/${assignment.assignment_id}/CreateOutline`
                        )
                      }
                    >
                      {assignment.assignment_name}
                    </span>
                    <Button
                      variant="subtle"
                      onClick={() => toggleAssignment(assignment.assignment_id)}
                    >
                      {expandedAssignments[assignment.assignment_id] ? <FiChevronUp /> : <FiChevronDown />}
                    </Button>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {assignment.published ? 'Yes' : 'No'}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {assignment.regrades ? 'Yes' : 'No'}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {assignment.submiss_by}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
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
                  <Table.Td colSpan={8} p={0}>
                    <Collapse
                      in={expandedAssignments[assignment.assignment_id]}
                      transitionDuration={200}
                    >
                      <SecAssignment />
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
