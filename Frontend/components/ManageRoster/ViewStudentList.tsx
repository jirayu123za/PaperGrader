"use client";

import React from 'react';
import { Modal, Pagination, Skeleton, Table, Text } from '@mantine/core';
import { useFetchSectionUsersRoster } from '../../hooks/Roster/useFetchUsersRoster';
import { useRosterStore } from '../../store/useRosterStore';
import { useModalStore } from '../../store/modal/useRosterModalStore';
import { useRouter , useParams } from 'next/navigation';
import { usePagination } from '@mantine/hooks';

const ViewStudentLists: React.FC = () => {
    const router = useRouter();
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
            size="lg"
            overlayProps={{
                color: 'rgba(0, 0, 0, 0.5)',
                blur: 3,
            }}
            centered
        >
            <Text size="sm" color="dimmed" mb="md">
                Visit the <Text component="a" href="/roster" color="blue" inherit>roster page</Text> to make any edits to the students in this list.
            </Text>

            {sectionUsersList && sectionUsersList.length > 0 ? (
                <>
                <Table striped highlightOnHover withRowBorders={false}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th style={{ textAlign: 'left' }}>Student No.</Table.Th>
                            <Table.Th style={{ textAlign: 'left' }}>Name</Table.Th>
                            <Table.Th style={{ textAlign: 'left' }}>Email</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>Submissions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {isLoading
                            ? Array.from({ length: 10 }).map((_, index) => (
                                <Table.Tr key={`skeleton-row-${index}`}>
                                    <Table.Td>
                                        <Skeleton visible height={20} width="60%" />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton visible height={20} width="80%" />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton visible height={20} width="40%" />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton visible height={20} width="40%" />
                                    </Table.Td>
                                </Table.Tr>
                            ))
                            : error ?
                                <Text ta="center" color="red">Error fetching student list</Text>
                                : paginatedData.map((student, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td style={{ textAlign: 'left' }}>{student.student_code || 'N/A'}</Table.Td>
                                        <Table.Td style={{ textAlign: 'left' }}>{student.full_name || 'N/A'}</Table.Td>
                                        <Table.Td style={{ textAlign: 'left' }}>{student.email || 'N/A'}</Table.Td>
                                        <Table.Td style={{ textAlign: 'center' }}>{student.submissions_count ?? 0}</Table.Td>
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
                </>
            ) : (
                <Text ta="center" color="dimmed">
                    No students found in this section.
                </Text>
            )}
        </Modal>
    );
};

export default ViewStudentLists;
