import React from 'react';
import { Table, Text, Button, Loader, Paper, Pagination, Skeleton, Group } from '@mantine/core';
import { useRouter } from 'next/router';
import { useFetchSections } from '../../hooks/Roster/useFetchSections';
import { useSectionDetailsStore } from '../../store/useRosterStore';
import ViewStudentLists from './ViewStudentList';
import { useModalStore } from '../../store/modal/useRosterModalStore';
import { usePagination } from '@mantine/hooks';
import CreateSection from '../Create/CreateSection';

const ManageSection: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { isLoading, error } = useFetchSections(course_id as string);
  const { sectionDetails } = useSectionDetailsStore();
  const openModal = useModalStore((state) => state.openModal);
  
  const pageSize = 10;
  const totalPages = Math.ceil(sectionDetails.length / pageSize);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
    siblings: 1,
    boundaries: 1,
  });
  
  const paginatedData = sectionDetails.slice(
    (pagination.active - 1) * pageSize,
    pagination.active * pageSize
  );

  return (
    <div>
      <Group justify="space-between" align="center" mb="md" mt='md' ml={1}>
        <Group gap="xs">
          <Text size="xl" fw={700}>Sections</Text>
          <Text size="xl" c="dimmed">
            {sectionDetails.length > 0 
              ? `(${sectionDetails.length} Sections)` 
              : 'No sections available for this course.'}
          </Text>
        </Group>

        {/* ใช้ ml="auto" เพื่อดันปุ่มไปขวาสุด */}
        <CreateSection />
      </Group>

      {sectionDetails.length > 0 ? (
      <Paper shadow="sm" radius="md" withBorder p="xl">
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Section Name</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Students Enrolled</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>View</Table.Th>
              <Table.Th>Remove</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading
                ? Array.from({ length: 10 }).map((_, index) => (
                  <Table.Tr key={`skeleton-row-${index}`}>
                    <Table.Td>
                      <Skeleton visible height={20} width="80%" />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton visible height={20} width="60%" />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton visible height={20} width="40%" />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton visible height={20} width="50%" />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton visible height={20} width="30%" />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton visible height={20} width="20%" />
                    </Table.Td>
                  </Table.Tr>
                ))
            :paginatedData.map((section) => (
              <Table.Tr key={section.section_id}>
                <Table.Td>{section.section_name}</Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>{section.total_students}</Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
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

        <div className="flex justify-center mt-4">
          <Pagination
            total={totalPages}
            siblings={1}
            boundaries={1}
            value={pagination.active}
            onChange={pagination.setPage}
          />
        </div>
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
