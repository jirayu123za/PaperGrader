"use client";

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter , useParams } from 'next/navigation';
import { Progress, Table, Paper, Button, Pagination, Flex, Text, Accordion, Stack, Group, Divider, Title } from '@mantine/core';
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { useActiveAssignmentStore } from '@/store/useActiveAssignmentStore';
import { useFetchActiveAssignments } from '@/hooks/useFetchActiveAssignment';
import { useDisclosure, useMediaQuery, usePagination } from '@mantine/hooks';
import { IoMdCheckmark, IoMdClose } from 'react-icons/io';
import { CreateAssignmentModal } from '@/components/INS/INSDashBoard/CreateAssignment';
import { ErrorActiveAssignment } from '@/components/INS/INSDashBoard/ErrorActiveAssignment';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok"); 

export const ActiveAssignments: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const course_id = params?.course_id as string;
  const { isLoading, error } = useFetchActiveAssignments(course_id as string);
  const { activeAssignments } = useActiveAssignmentStore();
  const [opened, { open, close }] = useDisclosure(false);
  const iconAssignmentTurnedIn = <MdOutlineAssignmentTurnedIn size={24} />;
  const iconsRegrade = { true: <IoMdCheckmark size={20} color="green" />, false: <IoMdClose size={20} color="red" /> };
  const pageSize = 10;
  const totalPages = Math.ceil(activeAssignments.length / pageSize);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
    siblings: 1,
    boundaries: 1,
  });

  const paginatedData = activeAssignments.slice(
    (pagination.active - 1) * pageSize,
    pagination.active * pageSize
  );

  const calculateTimeRemaining = (releaseDate: string | null, dueDate: string | null): number => {
    const now = dayjs().tz('Asia/Bangkok');
    const release = dayjs(releaseDate).tz('Asia/Bangkok');
    const due = dayjs(dueDate).tz('Asia/Bangkok');
    const totalDuration = due.diff(release);
    const remainingDuration = due.diff(now);

    if (!releaseDate || !dueDate || releaseDate === 'N/A' || dueDate === 'N/A') return 0;
    if (now.isBefore(release)) return 100;
    if (now.isAfter(due)) return 0;

    return (remainingDuration / totalDuration) * 100;
  };

  const getProgressColor = (releaseDate: string | null, dueDate: string | null): string => {
    const remainingPercentage = calculateTimeRemaining(releaseDate, dueDate);
    if (remainingPercentage >70) return 'green';
    if (remainingPercentage > 40) return 'orange';
    return 'red';
  };

  const isMobile = useMediaQuery("(max-width: 48em)");
  
  if (error) {
    return <ErrorActiveAssignment />;
  }
  
 return (
    <>
      <Paper shadow="sm" radius="md" withBorder p={{ base: "md", sm: "xl" }}>
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          gap="sm"
          mb="md"
        >
          <Text fw={700} fz={{ base: 18, sm: 22 }}>
            Active Assignments
          </Text>

          <Button
            variant="filled"
            color="#4C6EF5"
            size="md"
            radius="sm"
            className="shadow-md"
            leftSection={iconAssignmentTurnedIn}
            onClick={open}
            fullWidth={isMobile}
          >
            Create Assignment
          </Button>
        </Flex>

        {activeAssignments.length === 0 ? (
          <Text c="dimmed">
            You currently have no active assignments. Create an assignment to get started.
          </Text>
        ) : isMobile ? (
          <Accordion variant="contained" chevronPosition="right">
            {isLoading
              ? null
              : paginatedData.map((a) => (
                  <Accordion.Item key={a.assignment_id} value={a.assignment_id}>
                    <Accordion.Control>
                      <Stack gap={2}>
                        <Text fw={600} lineClamp={1}>
                          {a.assignment_name.charAt(0).toUpperCase() + a.assignment_name.slice(1)}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          Section: {a.section_name}
                        </Text>
                      </Stack>
                    </Accordion.Control>

                    <Accordion.Panel>
                      <Stack gap="xs">
                        <Group justify="space-between" gap="sm" wrap="nowrap">
                          <Text size="sm" c="dimmed">Released</Text>
                          <Text size="sm" ta="right">
                            {a.assignment_release_date
                              ? dayjs(a.assignment_release_date).format("MMM D, YYYY HH:mm")
                              : "Not assigned"}
                          </Text>
                        </Group>

                        <Group justify="space-between" gap="sm" wrap="nowrap">
                          <Text size="sm" c="dimmed">Due</Text>
                          <Text size="sm" ta="right">
                            {a.assignment_due_date
                              ? dayjs(a.assignment_due_date).format("MMM D, YYYY HH:mm")
                              : "Not assigned"}
                          </Text>
                        </Group>

                        <Divider />

                        {a.assignment_release_date && a.assignment_due_date ? (
                          <Progress
                            value={calculateTimeRemaining(a.assignment_release_date, a.assignment_due_date)}
                            color={getProgressColor(a.assignment_release_date, a.assignment_due_date)}
                            size="md"
                            radius="lg"
                          />
                        ) : (
                          <Text size="sm" c="dimmed" fs="italic">
                            Not assigned time
                          </Text>
                        )}

                        <Group justify="space-between" align="center">
                          <Text size="sm" c="dimmed">Regrades</Text>
                          {iconsRegrade[String(a.regrades) as "true" | "false"]}
                        </Group>

                        <Button
                          variant="light"
                          color="#4C6EF5"
                          fullWidth
                          onClick={() =>
                            router.push(
                              `/instructor/course/${course_id}/process/${a.assignment_id}/create-outline`
                            )
                          }
                        >
                          Open
                        </Button>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
          </Accordion>
        ) : (
          <Table.ScrollContainer minWidth={1000}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Title order={6} lineClamp={1}>
                      Name
                    </Title>
                  </Table.Th>
                  <Table.Th ta="center">
                    <Title order={6} lineClamp={1}>
                      Released
                    </Title>
                  </Table.Th>
                  <Table.Th ta="center">
                    <Title order={6} lineClamp={1}>
                      Time remain
                    </Title>
                  </Table.Th>
                  <Table.Th ta="center">
                    <Title order={6} lineClamp={1}>
                      Due
                    </Title>
                  </Table.Th>
                  <Table.Th ta="center">
                    <Title order={6} lineClamp={1}>
                      Late
                    </Title>
                  </Table.Th>
                  <Table.Th ta="center">
                    <Title order={6} lineClamp={1}>
                      Section
                    </Title>
                  </Table.Th>
                  <Table.Th ta="center">
                    <Title order={6} lineClamp={1}>
                      % Submission
                    </Title>
                  </Table.Th>
                  <Table.Th ta="center">
                    <Title order={6} lineClamp={1}>
                      % Graded
                    </Title>
                  </Table.Th>
                  <Table.Th ta="center">
                    <Title order={6} lineClamp={1}>
                      Regrades
                    </Title>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {isLoading
                  ? null
                  : paginatedData.map((assignment) => (
                      <Table.Tr key={assignment.assignment_id}>
                        <Table.Td
                          className="cursor-pointer hover:underline"
                          onClick={() =>
                            router.push(
                              `/instructor/course/${course_id}/process/${assignment.assignment_id}/create-outline`
                            )
                          }
                        >
                          <Text size="sm" lineClamp={1}>
                            {assignment.assignment_name.charAt(0).toUpperCase() +
                              assignment.assignment_name.slice(1)}
                          </Text>
                        </Table.Td>

                        <Table.Td ta="center">
                          {assignment.assignment_release_date ? (
                            <Text size="sm" lineClamp={1}>
                              {dayjs(assignment.assignment_release_date).format("MMM D, YYYY h:mm A")}
                            </Text>
                          ) : (
                            <Text c="dimmed" fs="italic" lineClamp={1}>
                              Not assigned release date
                            </Text>
                          )}
                        </Table.Td>

                        <Table.Td ta="center">
                          {assignment.assignment_release_date && assignment.assignment_due_date ? (
                            <Progress
                              value={calculateTimeRemaining(
                                assignment.assignment_release_date,
                                assignment.assignment_due_date
                              )}
                              color={getProgressColor(
                                assignment.assignment_release_date,
                                assignment.assignment_due_date
                              )}
                              size="md"
                              radius="lg"
                            />
                          ) : (
                            <Text c="dimmed" fs="italic" lineClamp={1}>
                              Not assigned time
                            </Text>
                          )}
                        </Table.Td>

                        <Table.Td ta="center">
                          {assignment.assignment_due_date ? (
                            <Text size="sm" lineClamp={1}>
                              {dayjs(assignment.assignment_due_date).format("MMM D, YYYY h:mm A")}
                            </Text>
                          ) : (
                            <Text c="dimmed" fs="italic" lineClamp={1}>
                              Not assigned due date
                            </Text>
                          )}
                        </Table.Td>

                        <Table.Td ta="center">
                          {assignment.assignment_cut_off_date ? (
                            <Text size="sm" lineClamp={1}>
                              {dayjs(assignment.assignment_cut_off_date).format("MMM D, YYYY h:mm A")}
                            </Text>
                          ) : (
                            <Text c="dimmed" fs="italic" lineClamp={1}>
                              Not assigned cut-off date
                            </Text>
                          )}
                        </Table.Td>

                        <Table.Td ta="center">
                          <Text size='sm' lineClamp={1}>{assignment.section_name}</Text>
                        </Table.Td>

                        <Table.Td ta="center">0</Table.Td>
                        <Table.Td ta="center">0%</Table.Td>

                        <Table.Td>
                          <Flex justify="center" align="center">
                            {iconsRegrade[String(assignment.regrades) as "true" | "false"]}
                          </Flex>
                        </Table.Td>
                      </Table.Tr>
                    ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}

        {activeAssignments.length > 0 && (
          <Flex justify="center" mt="md">
            <Pagination
              color="#4C6EF5"
              total={totalPages}
              siblings={isMobile ? 0 : 1}
              boundaries={isMobile ? 0 : 1}
              value={pagination.active}
              onChange={pagination.setPage}
              size={isMobile ? "sm" : "md"}
            />
          </Flex>
        )}
      </Paper>

      <CreateAssignmentModal isOpen={opened} onClose={close} />
    </>
  );
};