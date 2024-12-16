import React from 'react';
import AddMember from '../AddStudent/AddMember';
import EditCourseMember from '../Customize/EditCourseMember';
import { Button, Table, Menu, Paper, Text, TextInput, Select, Skeleton, Pagination } from '@mantine/core';
import { useFetchUsersRoster } from '../../hooks/Roster/useFetchUsersRoster';
import { useRouter } from 'next/router';
import { useRosterStore } from '../../store/useRosterStore';
import { useModalEditRosterMemberStore } from '../../store/modal/useRosterModalStore';
import { usePagination } from '@mantine/hooks';
import { useForm } from '@mantine/form';



const CourseRoster: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { isLoading, error } = useFetchUsersRoster(course_id as string);
  const { usersList, searchTerm, setSearchTerm, roleFilter, setRoleFilter } = useRosterStore();
  const { openModal } = useModalEditRosterMemberStore();


  const form = useForm({
    initialValues: {
      searchTerm: '',
      roleFilter: '',
      sectionFilter: '',
    },
  });


  const handleEditClick = (personal_data_id: string) => {
    openModal(personal_data_id);
  };


  const filteredUsers = usersList.filter((member) => {
    const matchesSearch = form.values.searchTerm
      ? member.full_name.toLowerCase().includes(form.values.searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(form.values.searchTerm.toLowerCase()) ||
      member.student_code?.toLowerCase().includes(form.values.searchTerm.toLowerCase())
      : true;

    const matchesRole = form.values.roleFilter
      ? member.role_type === form.values.roleFilter
      : true;

    const matchesSection = form.values.sectionFilter
      ? member.section_name?.toLowerCase().includes(form.values.sectionFilter.toLowerCase())
      : true;

    return matchesSearch && matchesRole && matchesSection;
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Skeleton visible={isLoading} height={28} width="40%">
          <Text size="xl" fw={700}>
            Course Roster {usersList.length > 0
              ? `(${usersList.length} Members)`
              : 'No members available for this course.'}
          </Text>
        </Skeleton>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-4">
        <Skeleton visible={isLoading} height={40} width="60%">
          <TextInput
            placeholder="Search by name, email, or student ID"
            value={form.values.searchTerm}
            onChange={(e) => form.setFieldValue('searchTerm', e.currentTarget.value)}
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
        <Skeleton visible={isLoading} height={40} width="20%">
        <TextInput
          placeholder="Filter by section"
          value={form.values.sectionFilter}
          onChange={(e) => form.setFieldValue('sectionFilter', e.currentTarget.value)}
          disabled={isLoading}
        />
        </Skeleton>
      </div>

      {/* Table */}
      <Paper shadow="sm" radius="md" withBorder p="xl">
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

      <div className="text-center mt-8">
        <AddMember />
      </div>

      <EditCourseMember />
    </div>
  );
};

export default CourseRoster;
