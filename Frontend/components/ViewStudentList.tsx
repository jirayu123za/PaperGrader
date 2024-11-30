import React, { useEffect } from 'react';
import { Modal, Table, Text } from '@mantine/core';
import { useFetchSectionUsersRoster } from '../hooks/Roster/useFetchUsersRoster';
import { useRosterStore } from '../store/useRosterStore';
import { useModalStore } from '../store/modal/useRosterModalStore';
import { useRouter } from 'next/router';

const ViewStudentLists: React.FC = () => {
    const router = useRouter();
    const course_id = Array.isArray(router.query.course_id) ? router.query.course_id[0] : router.query.course_id;
    const { isOpen, selectedSection, closeModal } = useModalStore();
    const { sectionUsersList } = useRosterStore();
    const { refetch, isFetching, error } = useFetchSectionUsersRoster(course_id ?? '', selectedSection?.section_id ?? '');

    useEffect(() => {
        if (isOpen) {
          refetch();
        }
      }, [isOpen, refetch]);

    return (
        <Modal
            opened={isOpen}
            onClose={closeModal}
            title={`Students in ${selectedSection?.sectionName}`}
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

            {isFetching ? (
                <Text ta="center">Loading...</Text>
            ) : error ? (
                <Text ta="center" color="red">Error fetching student list</Text>
            ) : sectionUsersList.length > 0 ? (
                <Table striped highlightOnHover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Submissions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sectionUsersList.map((student, index) => (
                            <tr key={index}>
                                <td>{student.full_name}</td>
                                <td>{student.email}</td>
                                <td>{student.submissions_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <Text ta="center" color="dimmed">
                    No students found in this section.
                </Text>
            )}
        </Modal>
    );
};

export default ViewStudentLists;
