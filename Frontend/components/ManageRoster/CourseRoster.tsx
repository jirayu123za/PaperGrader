import React from 'react';
import AddMember from '../AddStudent/AddMember';
import EditCourseMember from '../Customize/EditCourseMember';
import { Button, Table, Menu, Paper, Text, TextInput, Select, Skeleton } from '@mantine/core';
import { useFetchUsersRoster } from '../../hooks/Roster/useFetchUsersRoster';
import { useRouter } from 'next/router';
import { useRosterStore } from '../../store/useRosterStore';
import { useModalEditRosterMemberStore } from '../../store/modal/useRosterModalStore';

const CourseRoster: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { isLoading, error } = useFetchUsersRoster(course_id as string);
  const { usersList, searchTerm, setSearchTerm, roleFilter, setRoleFilter } = useRosterStore();
  const { openModal } = useModalEditRosterMemberStore();

  const handleEditClick = (personal_data_id: string) => {
    openModal(personal_data_id);
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
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
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
              : filteredUsers.map((member) => (
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
                        <Menu.Item onClick={() => handleEditClick(member.personal_data_id)}>
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
      </Paper>

      <div className="text-center mt-8">
        <AddMember />
      </div>

      <EditCourseMember />
    </div>
  );
};

export default CourseRoster;
