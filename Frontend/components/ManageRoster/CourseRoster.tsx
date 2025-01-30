import React from 'react';
import AddMember from '../AddStudent/AddMember';
import EditCourseMember from '../Customize/EditCourseMember';
import { Button, Table, Menu, Paper, Text, TextInput, Select, Skeleton, Pagination, Flex } from '@mantine/core';
import { useFetchUsersRoster } from '../../hooks/Roster/useFetchUsersRoster';
import { useRouter } from 'next/router';
import { useRosterStore } from '../../store/useRosterStore';
import { useModalEditRosterMemberStore } from '../../store/modal/useRosterModalStore';
import { usePagination } from '@mantine/hooks';
import { IoSearch } from 'react-icons/io5';

const CourseRoster: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { isLoading, error } = useFetchUsersRoster(course_id as string);
  const { usersList, searchTerm, setSearchTerm, roleFilter, setRoleFilter } = useRosterStore();
  const { openModal } = useModalEditRosterMemberStore();
  const searchIcon = <IoSearch />;

  const handleEditClick = (personal_data_id: string) => {
    openModal(personal_data_id);
  };

  const filteredUsers = usersList.filter((member) => {
    const matchesSearch = searchTerm
      ? member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.student_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.section_name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesRole = roleFilter ? member.role_type === roleFilter : true;

    return matchesSearch && matchesRole;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
    siblings: 1,
    boundaries: 1,
  });

  const paginatedData = filteredUsers.slice(
    (pagination.active - 1) * pageSize,
    pagination.active * pageSize
  );

  return (
    <>
      <Paper shadow="sm" radius="md" withBorder p="xl" mt="md">
        <Flex align="center" gap="xs" mb="md" justify="space-between">
          <TextInput
            placeholder="Search by name, email, or student ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            disabled={isLoading}
            rightSection={searchIcon}
            w="30%"
          />
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
          <Flex ml="auto">
            <AddMember />
          </Flex>
        </Flex>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '10%' }}>Student ID</Table.Th>
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
              ? Array.from({ length: 10 }).map((_, index) => (
                <Table.Tr key={`skeleton-row-${index}`}>
                  <Table.Td>
                    <Skeleton visible height={20} width="60%" />
                  </Table.Td>
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
              : paginatedData.map((member) => (
                <Table.Tr key={member.personal_data_id}>
                  <Table.Td>{member.student_code || '-'}</Table.Td>
                  <Table.Td>{member.full_name}</Table.Td>
                  <Table.Td>{member.email}</Table.Td>
                  <Table.Td>{member.role_type}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {member.section_name || 'All'}
                  </Table.Td>
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
            {usersList.length > 0
              ? `(${usersList.length} Members)`
              : 'No members available for this course.'}
          </Text>
        </Flex>
      </Paper>

      <EditCourseMember />
    </>
  );
};

export default CourseRoster;
