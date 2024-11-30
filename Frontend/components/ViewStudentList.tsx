import React, { useEffect } from 'react';
import { Modal, Table, Text } from '@mantine/core';
import { useFetchSectionUsersRoster } from '../hooks/Roster/useFetchUsersRoster'; // Import ที่แก้ไข
import { useRosterStore } from '../store/useRosterStore'; // Import Store

interface ViewStudentListsProps {
    sectionName: string;
    course_id: string;
    section_id: string;
    opened: boolean;
    onClose: () => void;
}

const ViewStudentLists: React.FC<ViewStudentListsProps> = ({
    sectionName,
    course_id,
    section_id,
    opened,
    onClose,
}) => {
    const { sectionUsersList } = useRosterStore(); // ใช้ Store ใหม่
    const { refetch, isFetching, error } = useFetchSectionUsersRoster(course_id, section_id);

    useEffect(() => {
        if (opened) {
            refetch(); // Fetch data when modal opens
        }
    }, [opened, refetch]);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Students in ${sectionName}`}
            size="lg"
            overlayProps={{
                color: 'rgba(0, 0, 0, 0.5)',
                blur: 3,
            }}
            centered
        >
            <Text size="sm" color="dimmed" mb="md">
                Visit the <Text component="a" href="/roster" color="blue" inherit underline>roster page</Text> to make any edits to the students in this list.
            </Text>

            {isFetching ? (
                <Text ta="center">Loading...</Text>
            ) : error ? (
                <Text ta="center" color="red">Error fetching student list</Text>
            ) : sectionUsersList.length > 0 ? ( // ใช้ `sectionUsersList` จาก Store
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
