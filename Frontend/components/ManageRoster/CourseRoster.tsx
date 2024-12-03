import React from 'react';
import { Button, Table, Menu, Paper, Text, TextInput, Select, Skeleton } from '@mantine/core';
import AddMember from '../AddStudent/AddMember';
import { useFetchUsersRoster } from '../../hooks/Roster/useFetchUsersRoster';
import { useRouter } from 'next/router';
import { useRosterStore } from '../../store/useRosterStore';
import EditCourseMember from '../Customize/EditCourseMember';

const CourseRoster: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { isLoading, error } = useFetchUsersRoster(course_id as string);
  const { usersList } = useRosterStore();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedPersonalDataId, setSelectedPersonalDataId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [roleFilter, setRoleFilter] = React.useState<string | null>(null);

  const openEditModal = (personal_data_id: string) => {
    setSelectedPersonalDataId(personal_data_id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedPersonalDataId(null);
    setIsEditModalOpen(false);
  };

  const filteredUsers = usersList.filter((member) => {
    const matchesSearch = searchTerm
      ? member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesRole = roleFilter ? member.role_type === roleFilter : true;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Skeleton visible={isLoading} height={28} width="40%">
          <Text size="xl" fw={700}>
            Course Roster
          </Text>
        </Skeleton>
        <Skeleton visible={isLoading} height={28} width="20%">
          <Text size="xl" color="dimmed">
            {usersList.length > 0
              ? `(${usersList.length} Members)`
              : 'No members available for this course.'}
          </Text>
        </Skeleton>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-4">
        <Skeleton visible={isLoading} height={40} width="60%">
          <TextInput
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            style={{ flex: 1 }}
            disabled={isLoading}
          />
        </Skeleton>
        <Skeleton visible={isLoading} height={40} width="20%">
          <Select
            placeholder="Filter by role"
            data={[
              { value: 'INSTRUCTOR', label: 'Instructor' },
              { value: 'STUDENT', label: 'Student' },
              { value: 'TA', label: 'TA' },
            ]}
            value={roleFilter}
            onChange={setRoleFilter}
            clearable
            disabled={isLoading}
          />
        </Skeleton>
      </div>

      {/* Table */}
      <Paper shadow="sm" radius="md" withBorder p="xl">
        {isLoading ? (
          <Skeleton visible={isLoading} height={400} radius="md" />
        ) : (
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Section</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Submissions</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredUsers.map((member) => (
                <Table.Tr key={member.personal_data_id}>
                  <Table.Td>{member.full_name}</Table.Td>
                  <Table.Td>{member.email}</Table.Td>
                  <Table.Td>{member.role_type}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>{member.section_name || 'All'}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {member.role_type === 'INSTRUCTOR' ? '-' : member.submissions_count || 0}
                  </Table.Td>
                  <Table.Td>
                    <Menu>
                      <Menu.Target>
                        <Button variant="subtle" size="xs">•••</Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item onClick={() => openEditModal(member.personal_data_id)}>
                          Update Information
                        </Menu.Item>
                        <Menu.Item color="red">Remove User</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <div className="text-center mt-8">
        <AddMember />
      </div>

      <EditCourseMember
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        personal_data_id={selectedPersonalDataId || ''}
        course_id={course_id as string}
      />
    </div>
  );
};

export default CourseRoster;
