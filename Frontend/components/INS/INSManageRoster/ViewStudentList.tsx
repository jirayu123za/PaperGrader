import React from 'react';
import { Modal, Pagination, Skeleton, Table, Text, Title } from '@mantine/core';
import { useFetchSectionUsersRoster } from '@/hooks/Roster/useFetchUsersRoster';
import { useRosterStore } from '@/store/useRosterStore';
import { useModalStore } from '@/store/modal/useRosterModalStore';
import { useParams } from 'next/navigation';
import { usePagination } from '@mantine/hooks';

const ViewStudentLists: React.FC = () => {
    const params = useParams();
    const course_id = params?.course_id as string;
    const { isOpen, selectedSection, closeModal } = useModalStore();
    const { sectionUsersList } = useRosterStore();
    const { isLoading, error } = useFetchSectionUsersRoster(course_id ?? '', selectedSection?.section_id ?? '');

    const pageSize = 10;
    const totalPages = Math.ceil((sectionUsersList?.length || 0) / pageSize);
  
    const pagination = usePagination({
      total: totalPages,
      initialPage: 1,
      siblings: 1,
      boundaries: 1,
    });
    
    const paginatedData = sectionUsersList
    ? sectionUsersList.slice((pagination.active - 1) * pageSize, pagination.active * pageSize)
    : [];

    return (
        <Modal
            opened={isOpen}
            onClose={closeModal}
            title={`Students in ${selectedSection?.sectionName || 'N/A'}`}
            size="auto"
            overlayProps={{
                color: 'rgba(0, 0, 0, 0.5)',
                blur: 3,
            }}
            centered
        >
            <Text size="sm" c="dimmed" mb="md">
                Visit the <Text component="a" href="/roster" c="blue" inherit>roster page</Text> to make any edits to the students in this list.
            </Text>

            {sectionUsersList && sectionUsersList.length > 0 ? (
                <>
                    <Table striped highlightOnHover withRowBorders={false}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th ta="left" w="auto">
                                    <Title order={6} lineClamp={1}>Student No.</Title>
                                </Table.Th>
                                <Table.Th ta="left" w="auto">
                                    <Title order={6} lineClamp={1}>Name</Title>
                                </Table.Th>
                                <Table.Th ta="left" w="auto">
                                    <Title order={6} lineClamp={1}>Email</Title>
                                </Table.Th>
                                <Table.Th ta="center" w="auto">
                                    <Title order={6} lineClamp={1}>Submissions</Title>
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                {isLoading
                    ? Array.from({ length: 10 }).map((_, index) => (
                        <Table.Tr key={`skeleton-row-${index}`}>
                            <Table.Td>
                                <Skeleton visible h={20} w={80} />
                            </Table.Td>
                            <Table.Td>
                                <Skeleton visible h={20} w={80} />
                            </Table.Td>
                            <Table.Td>
                                <Skeleton visible h={20} w={80} />
                            </Table.Td>
                            <Table.Td>
                                <Skeleton visible h={20} w={80} />
                            </Table.Td>
                        </Table.Tr>
                    ))
                    : error ?
                        <Text ta="center" c="red">Error fetching student list</Text>
                    : paginatedData.map((student) => (
                        <Table.Tr key={student.personal_data_id}>
                            <Table.Td ta="left"><Text size='sm' lineClamp={1}>{student.student_code || 'N/A'}</Text></Table.Td>
                            <Table.Td ta="left"><Text size='sm' lineClamp={1}>{student.full_name || 'N/A'}</Text></Table.Td>
                            <Table.Td ta="left"><Text size='sm' lineClamp={1}>{student.email || 'N/A'}</Text></Table.Td>
                            <Table.Td ta="center"><Text size='sm' lineClamp={1}>{student.submissions_count ?? 0}</Text></Table.Td>
                        </Table.Tr>
                    ))}
                        </Table.Tbody>
                    </Table>
                    <div className="flex justify-center mt-4">
                        <Pagination
                            color="#4C6EF5"
                            total={totalPages}
                            siblings={1}
                            boundaries={1}
                            value={pagination.active}
                            onChange={pagination.setPage} 
                        />
                    </div>
                </>
                ) : (
                <Text ta="center" c="dimmed" size="sm">
                    No students found in this section.
                </Text>
            )}
        </Modal>
    );
};

export default ViewStudentLists;
