"use client";

import React from 'react';
import { Table, Text, Button, Paper, Pagination, Skeleton, Flex } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useFetchSections } from '../../hooks/Roster/useFetchSections';
import { useSectionDetailsStore } from '../../store/useRosterStore';
import { useModalStore } from '../../store/modal/useRosterModalStore';
import { usePagination } from '@mantine/hooks';
import ViewStudentLists from './ViewStudentList';
import CreateSection from '../Create/CreateSection';

const ManageSection: React.FC = () => {
  const params = useParams();
  const course_id = params?.course_id as string;
  const { isLoading, error } = useFetchSections(course_id as string);
  const { sectionDetails } = useSectionDetailsStore();
  const openModal = useModalStore((state) => state.openModal);
  
  const pageSize = 9;
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
    <>
      {sectionDetails.length > 0 ? (
      <Paper shadow="sm" radius="md" withBorder p="xl" mt="md">
        <Flex justify="flex-end">
          <CreateSection />
        </Flex>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Section name</Table.Th>
              <Table.Th ta='center'>Students enrolled</Table.Th>
              <Table.Th ta='center'>View</Table.Th>
              <Table.Th ta='center'>Remove</Table.Th>
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
                <Table.Td pl="xl">{section.section_name}</Table.Td>
                <Table.Td ta='center'>{section.total_students}</Table.Td>
                <Table.Td ta='center'>
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => openModal({ sectionName: section.section_name, section_id: section.section_id })}
                  >
                    View Student List
                  </Button>
                </Table.Td>
                <Table.Td ta='center'>
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

        <Flex justify="space-between" align="center" mt="lg">
          <Flex justify="center" style={{ flex: 1 }}>
            <Pagination
              total={totalPages}
              siblings={1}
              boundaries={1}
              value={pagination.active}
              onChange={pagination.setPage}
            />
          </Flex>
          <Text size="lg" c="dimmed">
            {sectionDetails.length > 0 
              ? `(${sectionDetails.length} Sections)` 
              : 'No sections available for this course.'}
          </Text>
        </Flex>
      </Paper>
      ) : (
        <Text ta="center" color="dimmed">
          This course has no sections created yet.
        </Text>
      )}
      <ViewStudentLists />
    </>
  );
};

export default ManageSection;
