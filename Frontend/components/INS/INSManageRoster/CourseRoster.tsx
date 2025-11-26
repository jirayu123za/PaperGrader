"use client";

import React, { useMemo, useState, useEffect } from "react";
import AddMember from "@/components/AddStudent/AddMember";
import EditCourseMember from "@/components/Customize/EditCourseMember";
import { Button, Table, Menu, Paper, Text, TextInput, Select, Skeleton, Pagination, Flex, Title, Tooltip} from "@mantine/core";
import { useFetchUsersRoster } from "@/hooks/Roster/useFetchUsersRoster";
import { useParams } from "next/navigation";
import { useRosterStore } from "@/store/useRosterStore";
import { useModalEditRosterMemberStore } from "@/store/modal/useRosterModalStore";
import { usePagination, useViewportSize, useDisclosure } from "@mantine/hooks";
import { IoSearch } from "react-icons/io5";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import ConfirmDeleteModal from "@/components/INS/INSManageRoster/ConfirmDeleteModal";

const CourseRoster: React.FC = () => {
  const params = useParams();
  const course_id = params?.course_id as string;
  const searchIcon = <IoSearch />;
  const { isLoading } = useFetchUsersRoster(course_id as string);
  const { usersList, searchTerm, setSearchTerm, roleFilter, setRoleFilter } =useRosterStore();
  const { openModal } = useModalEditRosterMemberStore();
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleRemoveClick = (personal_data_id: string) => {
    setSelectedId(personal_data_id);
    openConfirm();
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      setDeleting(true);
    } finally {
      setDeleting(false);
      closeConfirm();
      setSelectedId(null);
    }
  };

  const handleEditClick = (personal_data_id: string) => {
    openModal(personal_data_id);
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter((member) => {
      const q = searchTerm?.toLowerCase() ?? "";
      const matchesSearch = q
        ? member.full_name.toLowerCase().includes(q) ||
          member.email.toLowerCase().includes(q) ||
          member.student_code?.toLowerCase().includes(q) ||
          member.section_name?.toLowerCase().includes(q)
        : true;
      const matchesRole = roleFilter ? member.role_type === roleFilter : true;
      return matchesSearch && matchesRole;
    });
  }, [usersList, searchTerm, roleFilter]);


  const { height: viewportH } = useViewportSize();
  const rowsPerPage = useMemo(() => {
    if (viewportH < 700) return 4;
    if (viewportH < 900) return 6;
    return 10;
  }, [viewportH]);

  const totalPages = useMemo(() => {
    const pages = Math.ceil(filteredUsers.length / rowsPerPage);
    return Math.max(1, pages);
  }, [filteredUsers.length, rowsPerPage]);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1
  });

  useEffect(() => {
    if (pagination.active > totalPages) {
      pagination.setPage(totalPages);
    }
  }, [totalPages, pagination.active]);

  const startIndex = (pagination.active - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredUsers.slice(startIndex, endIndex);

  return (
    <>
      <Paper
        shadow="sm"
        radius="md"
        withBorder
        pl="xl"
        pr="xl"
        pt="xl"
        pb="lg"
        mt="xs"
        style={{ overflow: "hidden" }}
      >
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
              { value: "INSTRUCTOR", label: "Instructor" },
              { value: "STUDENT", label: "Student" },
              { value: "TA", label: "TA" },
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
              <Table.Th w="10%">
                <Title order={6} lineClamp={1}>Student ID</Title>
              </Table.Th>
              <Table.Th>
                <Title order={6} lineClamp={1}>Name</Title>
                </Table.Th>
              <Table.Th>
                <Title order={6} lineClamp={1}>Email</Title>
              </Table.Th>
              <Table.Th>
                <Title order={6} lineClamp={1}>Role</Title>
              </Table.Th>
              <Table.Th ta="center">
                <Title order={6} lineClamp={1}>Section</Title>
              </Table.Th>
              <Table.Th ta="center">
                <Title order={6} lineClamp={1}>Submissions</Title>
              </Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {isLoading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <Table.Tr
                  key={`skeleton-row-${index}`}
                >
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
            ) : filteredUsers.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                  <Text c="dimmed">No members available for this course.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              paginatedData.map((member) => (
                <Table.Tr
                  key={member.personal_data_id}
                >
                  <Table.Td>
                    <Text size="sm" lineClamp={1}>{member.student_code || "-"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={member.full_name} withArrow>
                      <Text size="sm" lineClamp={1}>{member.full_name}</Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={1}>{member.email}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={1}>{member.role_type.charAt(0).toUpperCase() + member.role_type.slice(1).toLowerCase()}</Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Text size="sm" lineClamp={1}>{member.section_name || "All"}</Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Text size="sm" lineClamp={1}>{member.role_type === "INSTRUCTOR" ? "-" : member.submissions_count || 0}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Menu>
                      <Menu.Target>
                        <Button variant="subtle" size="xs" color="#4C6EF5">
                          •••
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item 
                          color="#4C6EF5"
                          leftSection={<IconEdit size={14} />}
                          onClick={() => handleEditClick(member.personal_data_id)}
                        >
                          Update
                        </Menu.Item>
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => handleRemoveClick(member.personal_data_id)}
                        >
                          Remove
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>

          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={7} className="border-t border-gray-300">
                <Flex align="center" w="100%" justify="space-between">
                  <Text size="sm" c="dimmed">
                    {filteredUsers.length > 0
                      ? `Total members: ${filteredUsers.length}`
                      : "Total members: 0"}
                  </Text>
                  <Pagination
                    size="sm"
                    color="#4C6EF5"
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

      <EditCourseMember />

      <ConfirmDeleteModal
        opened={confirmOpened}
        onClose={closeConfirm}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Confirm Deletion"
      />
    </>
  );
};

export default CourseRoster;
