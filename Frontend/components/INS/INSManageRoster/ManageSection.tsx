"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { Table, Text, Button, Paper, Pagination, Skeleton, Flex, Image, Title, Tooltip } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useFetchSections } from '@/hooks/Roster/useFetchSections';
import { useSectionDetailsStore } from '@/store/useRosterStore';
import { useModalStore } from '@/store/modal/useRosterModalStore';
import { useDisclosure, usePagination, useViewportSize } from '@mantine/hooks';
import ViewStudentLists from '@/components/INS/INSManageRoster/ViewStudentList';
import CreateSection from '@/components/Create/CreateSection';
import DeleteRosterSecModal from '@/components/INS/INSManageRoster/DeleteRosterSecModal';

const ManageSection: React.FC = () => {
  const params = useParams();
  const course_id = params?.course_id as string;
  const [ opened, { open, close } ] = useDisclosure(false);
  const { height: viewportH } = useViewportSize();
  const { isLoading } = useFetchSections(course_id as string);
  const { sectionDetails } = useSectionDetailsStore();
  const [ selectedSectionID, setSelectedSectionID ] = useState<string | null>(null);
  const [ selectedSectionName, setSelectedSectionName ] = useState<string | null>(null);
  const [ totalStudents, setTotalStudents ] = useState<number | null>(null);
  const openModal = useModalStore((s) => s.openModal);

  const handleCloseModal = () => {
    close();
    setSelectedSectionID(null);
    setSelectedSectionName(null);
    setTotalStudents(null);
  };

  const rowsPerPage = useMemo(() => {
    if (viewportH < 700) return 4;
    if (viewportH < 900) return 6;
    return 10;
  }, [viewportH]);
 
  const totalPages = useMemo(() => {
    const pages = Math.ceil(sectionDetails.length / rowsPerPage);
    return Math.max(1, pages);
  }, [sectionDetails.length, rowsPerPage]);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
  });

  useEffect(() => {
    if (pagination.active > totalPages) {
      pagination.setPage(totalPages);
    }
  }, [totalPages, pagination.active]);

  const start = (pagination.active - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = sectionDetails.slice(start, end);

  return (
    <>
      {sectionDetails.length > 0 || isLoading ? (
        <Paper
          shadow="sm"
          radius="md"
          withBorder
          p="xl"
          mt="md"
          style={{ overflow: 'hidden' }}
        >
          <Flex justify="flex-end" mb="md">
            <CreateSection />
          </Flex>

          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Title order={6} lineClamp={1}>Sections</Title>
                </Table.Th>
                <Table.Th ta="center">
                  <Tooltip label="Number of students enrolled in the section" withArrow>
                    <Title order={6} lineClamp={1}>Students enrolled</Title>
                  </Tooltip>
                </Table.Th>
                <Table.Th ta="center">
                  <Title order={6} lineClamp={1}>View</Title>
                </Table.Th>
                <Table.Th ta="center">
                  <Title order={6} lineClamp={1}>Remove</Title>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {isLoading
                ? Array.from({ length: rowsPerPage }).map((_, i) => (
                    <Table.Tr key={`skeleton-${i}`}>
                      <Table.Td><Skeleton visible height={20} width="80%" /></Table.Td>
                      <Table.Td><Skeleton visible height={20} width="50%" /></Table.Td>
                      <Table.Td><Skeleton visible height={20} width="40%" /></Table.Td>
                      <Table.Td><Skeleton visible height={20} width="40%" /></Table.Td>
                    </Table.Tr>
                  ))
                : pageData.map((section) => (
                    <Table.Tr key={section.section_id}>
                      <Table.Td pl="lg">{section.section_name}</Table.Td>
                      <Table.Td ta="center">{section.total_students}</Table.Td>
                      <Table.Td ta="center">
                        <Button
                          color="#4C6EF5"
                          variant="subtle"
                          size="xs"
                          onClick={() =>
                            openModal({ sectionName: section.section_name, section_id: section.section_id })
                          }
                        >
                          View Student List
                        </Button>
                      </Table.Td>
                      <Table.Td ta="center">
                        <Button
                          variant="outline"
                          color="red"
                          size="xs"
                          onClick={() => {
                            setSelectedSectionID(section.section_id);
                            setSelectedSectionName(section.section_name);
                            setTotalStudents(section.total_students);
                            open();
                          }}
                        >
                          Remove
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
            </Table.Tbody>

            <Table.Tfoot>
              <Table.Tr>
                <Table.Td colSpan={4} className="border-t border-gray-300">
                  <Flex align="center" w="100%" justify="space-between">
                    <Text size="sm" c="dimmed">
                      {sectionDetails.length > 0 ? `(${sectionDetails.length} Sections)` : 'No sections'}
                    </Text>
                    <Pagination
                      color="#4C6EF5"
                      size="sm"
                      total={totalPages}
                      siblings={1}
                      boundaries={1}
                      value={pagination.active}
                      onChange={pagination.setPage}
                    />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Paper>
      ) : (
        <Flex justify="center" gap="md" direction="column" align="center">
          <Image alt="No sections" src="/Image/table/empty.svg" w={200} h={200} mt="lg" />
          <Text ta="center" c="dimmed">This course has no sections created yet.</Text>
          <CreateSection />
        </Flex>
      )}

      <ViewStudentLists />

      <DeleteRosterSecModal 
        opened={opened}
        onClose={handleCloseModal}
        sectionID={selectedSectionID}
        sectionName={selectedSectionName}
        totalStudents={totalStudents}
      />

    </>
  );
};

export default ManageSection;
