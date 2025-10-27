"use client";

import React, { useMemo, useRef, useState, useLayoutEffect, useEffect } from "react";
import AddMember from "../../AddStudent/AddMember";
import EditCourseMember from "../../Customize/EditCourseMember";
import {
  Button,
  Table,
  Menu,
  Paper,
  Text,
  TextInput,
  Select,
  Skeleton,
  Pagination,
  Flex,
} from "@mantine/core";
import { useFetchUsersRoster } from "../../../hooks/Roster/useFetchUsersRoster";
import { useParams } from "next/navigation";
import { useRosterStore } from "../../../store/useRosterStore";
import { useModalEditRosterMemberStore } from "../../../store/modal/useRosterModalStore";
import { usePagination, useViewportSize, useDisclosure } from "@mantine/hooks";
import { IoSearch } from "react-icons/io5";
import ConfirmDeleteModal from "./ConfirmDeleteModal"; 

const FALLBACK_ROW_H = 48;
const FALLBACK_THEAD_H = 40;
const FALLBACK_TFOOT_H = 56;
const BOTTOM_PADDING = 12;
const SAFETY_GAP = 20;
const MIN_ROWS = 1;
const MAX_ROWS = 100;

const CourseRoster: React.FC = () => {
  const params = useParams();
  const course_id = params?.course_id as string;
  const { isLoading } = useFetchUsersRoster(course_id as string);
  const { usersList, searchTerm, setSearchTerm, roleFilter, setRoleFilter } =useRosterStore();
  const { openModal } = useModalEditRosterMemberStore();
  const searchIcon = <IoSearch />;
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
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const theadRef = useRef<HTMLTableSectionElement | null>(null);
  const tfootRef = useRef<HTMLTableSectionElement | null>(null);
  const sampleRowRef = useRef<HTMLTableRowElement | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState<number>(8);

  const getPaperVerticalPadding = () => {
    if (!paperRef.current || typeof window === "undefined") return 50;
    const cs = window.getComputedStyle(paperRef.current);
    const pt = parseFloat(cs.paddingTop || "0");
    const pb = parseFloat(cs.paddingBottom || "0");
    const bt = parseFloat(cs.borderTopWidth || "0");
    const bb = parseFloat(cs.borderBottomWidth || "0");
    return pt + pb + bt + bb;
  };

  const measure = () => {
    const sectionTop = sectionRef.current?.getBoundingClientRect().top ?? 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : viewportH;
    const availableViewport = Math.max(0, vh - sectionTop - BOTTOM_PADDING);

    const headerH = headerRef.current?.getBoundingClientRect().height ?? 0;

    let theadH = theadRef.current?.getBoundingClientRect().height ?? FALLBACK_THEAD_H;
    if (!Number.isFinite(theadH) || theadH <= 0) theadH = FALLBACK_THEAD_H;

    let tfootH = tfootRef.current?.getBoundingClientRect().height ?? FALLBACK_TFOOT_H;
    if (!Number.isFinite(tfootH) || tfootH <= 0) tfootH = FALLBACK_TFOOT_H;

    const measuredRowH = sampleRowRef.current?.getBoundingClientRect().height;
    const rowH =
      Number.isFinite(measuredRowH as number) && (measuredRowH as number) > 0
        ? (measuredRowH as number)
        : FALLBACK_ROW_H;

    const paperPadding = getPaperVerticalPadding();

    const availableForRows =
      availableViewport - headerH - theadH - tfootH - paperPadding - SAFETY_GAP;

    const rawFit = availableForRows / rowH;
    let fit = Number.isFinite(rawFit) ? Math.floor(rawFit) : 8;

    const remainder = availableForRows - fit * rowH;
    if (remainder < 10) fit = fit - 1;

    const clamped = Math.max(MIN_ROWS, Math.min(MAX_ROWS, fit));
    if (clamped !== rowsPerPage) setRowsPerPage(clamped);
  };

  useLayoutEffect(() => {
    measure();
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        measure();
        setTimeout(measure, 0);
      });
    }
  }, [viewportH, filteredUsers.length, isLoading]);

  useEffect(() => {
    if (!sectionRef.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(sectionRef.current);
    return () => ro.disconnect();
  }, []);

  const safeRows =
    Number.isFinite(rowsPerPage) && rowsPerPage > 0 ? Math.floor(rowsPerPage) : 8;

  const totalPages = useMemo(() => {
    const pages = Math.ceil(filteredUsers.length / (safeRows || 1));
    return Math.max(1, pages);
  }, [filteredUsers.length, safeRows]);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
    siblings: 1,
    boundaries: 1,
  });

  useEffect(() => {
    pagination.setPage(1);
  }, [safeRows, filteredUsers.length]);

  const startIndex = (pagination.active - 1) * safeRows;
  const endIndex = startIndex + safeRows;
  const paginatedData = filteredUsers.slice(startIndex, endIndex);

  return (
    <>
      <div ref={sectionRef}>
        <Paper
          ref={paperRef}
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
          <Flex ref={headerRef} align="center" gap="xs" mb="md" justify="space-between">
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
            <Table.Thead ref={theadRef}>
              <Table.Tr>
                <Table.Th style={{ width: "10%" }}>Student ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Section</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Submissions</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {isLoading ? (
                Array.from({ length: safeRows }).map((_, index) => (
                  <Table.Tr
                    key={`skeleton-row-${index}`}
                    ref={index === 0 ? sampleRowRef : undefined}
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
                paginatedData.map((member, idx) => (
                  <Table.Tr
                    key={member.personal_data_id}
                    ref={idx === 0 ? sampleRowRef : undefined}
                  >
                    <Table.Td>{member.student_code || "-"}</Table.Td>
                    <Table.Td>{member.full_name}</Table.Td>
                    <Table.Td>{member.email}</Table.Td>
                    <Table.Td>{member.role_type}</Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      {member.section_name || "All"}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      {member.role_type === "INSTRUCTOR" ? "-" : member.submissions_count || 0}
                    </Table.Td>
                    <Table.Td>
                      <Menu>
                        <Menu.Target>
                          <Button variant="subtle" size="xs">
                            •••
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item onClick={() => handleEditClick(member.personal_data_id)}>
                            Update Information
                          </Menu.Item>
                          <Menu.Item
                            color="red"
                            onClick={() => handleRemoveClick(member.personal_data_id)}
                          >
                            Remove User
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>

            <Table.Tfoot ref={tfootRef}>
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
      </div>
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
