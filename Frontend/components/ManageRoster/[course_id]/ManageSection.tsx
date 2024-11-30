import React from 'react';
import { Table, Text, Button, Divider, Loader, Paper } from '@mantine/core';
import { useRouter } from 'next/router';
import { useFetchSections } from '../../../hooks/Roster/useFetchSections';
import { useSectionDetailsStore } from '../../../store/useRosterStore';
import ViewStudentLists from '../../ViewStudentList';
import { useModalStore } from '../../../store/modal/useRosterModalStore';

const ManageSection: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { isLoading, error } = useFetchSections(course_id as string);
  const { sectionDetails } = useSectionDetailsStore();
  const openModal = useModalStore((state) => state.openModal);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader size="md" />
      </div>
    );
  }

  if (error) {
    return <Text color="red">Error loading sections: {error.message}</Text>;
  }

  return (
    <div>
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Text size="xl" fw={700}>
          Sections
        </Text>
        <Text size="xl" color="dimmed">
          {sectionDetails.length > 0 
            ? `(${sectionDetails.length} Sections)` 
            : 'No sections available for this course.'}
        </Text>
      </div>
    </div>

      {sectionDetails.length > 0 ? (
      <Paper shadow="sm" radius="md" withBorder p="xl">
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Section Name</Table.Th>
              <Table.Th>No of Students</Table.Th>
              <Table.Th>View</Table.Th>
              <Table.Th>Remove</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sectionDetails.map((section) => (
              <Table.Tr key={section.section_id}>
                <Table.Td>{section.section_name}</Table.Td>
                <Table.Td>{section.total_students}</Table.Td>
                <Table.Td>
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => openModal({ sectionName: section.section_name, section_id: section.section_id })}
                  >
                    View Student List
                  </Button>
                </Table.Td>
                <Table.Td>
                  <Button
                    variant="outline"
                    color="red"
                    size="xs"
                    onClick={() => console.log(`Remove Section ${section.section_id}`)}
                  >
                    Remove
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        </Paper>
      ) : (
        <Text ta="center" color="dimmed">
          This course has no sections created yet.
        </Text>
      )}
      <ViewStudentLists />
    </div>
  );
};

export default ManageSection;
