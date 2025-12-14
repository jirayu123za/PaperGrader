"use client"

import React from 'react';
import AccountMenu from '@/components/Account';
import { useFetchInstructorList } from '@/hooks/useFetchInstructorList';
import { useInsCourseStore } from '@/store/useCourseStore';
import { useInstructorListStore } from '@/store/useInstructorListStore';
import { ActionIcon, Avatar, Badge, Box, Collapse, Divider, Flex, Group, Image, NavLink, Paper, Skeleton, Stack, Text, Title, Tooltip, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { FaCog, FaFileAlt, FaFileExport, FaHome, FaInfo, FaUser, FaUsers } from 'react-icons/fa';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { IoStatsChart } from 'react-icons/io5';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface InstructorList {
  personalData_id: string;
  instructor_name: string;
}

export const LeftMain = () => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const course_id = params?.course_id as string;
  const { course } = useInsCourseStore();
  const { isLoading: isLoadingInstructor, isError: isErrorInstructor } = useFetchInstructorList(course_id as string);
  const { instructorList } = useInstructorListStore();
  const [isCollapsed, { toggle: toggleCollapse }] = useDisclosure(false);
  const [expandedName, { toggle: toggleExpandName }] = useDisclosure(true);
  
  const icons = {
    home: <FaHome />,
    fileAlt: <FaFileAlt />,
    users: <FaUsers />,
    user: <FaUser />,
    stats: <IoStatsChart />,
    export: <FaFileExport />,
    cog: <FaCog />,
  };
  
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: icons.home, href: `/instructor/course/${course?.course_id}/dashboard` },
    { key: 'assignment', label: 'Assignments', icon: icons.fileAlt, href: `/instructor/course/${course?.course_id}/assignment` },
    { key: 'manageroster', label: 'Roster', icon: icons.users, href: `/instructor/course/${course?.course_id}/manageroster` },
    { key: 'statistics', label: 'Statistics', icon: icons.stats, href: `/instructor/course/${course?.course_id}/statistics` },
    { key: 'dataexports', label: 'Data Exports', icon: icons.export, href: `/instructor/course/${course?.course_id}/dataexport` },
    { key: 'coursesettings', label: 'Course Settings', icon: icons.cog, href: '#' },
  ];

  return (
    <Box
      className={`relative flex flex-col justify-between border-r transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
      h="100dvh"
    >
      <Flex justify={isCollapsed ? "center" : "space-between"} align="center" p={12} bg="#6665AC" mih={84}>
        <Transition mounted={!isCollapsed} transition="fade-left" duration={160}>
          {(styles) => (
            <Box style={styles}>
              <Image src="/Image/logo-ppgd2.png" alt="logo" w={200} h={60} p={2} />
            </Box>
          )}
        </Transition>

        <Tooltip label={isCollapsed ? "Expand" : "Collapse"} withArrow position="right">
          <ActionIcon
            onClick={toggleCollapse}
            variant="subtle"
            radius="md"
            aria-label="Toggle sidebar"
            color="white"
          >
            <Transition mounted={isCollapsed} transition="fade-left" duration={140}>
              {(styles) => (
                <Box style={{ ...styles, display: "inline-flex" }}>
                  <GoSidebarExpand size={24} />
                </Box>
              )}
            </Transition>

            <Transition mounted={!isCollapsed} transition="fade-left" duration={140}>
              {(styles) => (
                <Box style={{ ...styles, display: "inline-flex" }}>
                  <GoSidebarCollapse size={24} />
                </Box>
              )}
            </Transition>
          </ActionIcon>
        </Tooltip>
      </Flex>

      <Flex direction="column" bg="#6665AC" className="flex-grow">
        <Divider color="rgba(255,255,255,0.18)" mx="md"/>
          <Box p="md">
            <Collapse in={!isCollapsed} transitionDuration={160}>
              <Paper
                radius="md"
                py="md"
                px="sm"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap">
                    <Title order={4} c="#fff" style={{ letterSpacing: 0.2 }} lineClamp={1}>
                      {course?.course_code}
                    </Title>

                    <Badge
                      variant="light"
                      color="gray"
                      styles={{
                        root: {
                          background: "rgba(255,255,255,0.16)",
                          color: "rgba(255,255,255,0.92)",
                        },
                      }}
                    >
                      {course ? `${course.semester}/${Number(course.academic_year) + 543}` : ""}
                    </Badge>
                  </Group>

                  <ActionIcon
                    variant="subtle"
                    onClick={toggleExpandName}
                    styles={{ root: { color: "rgba(255,255,255,0.9)" } }}
                  >
                    {expandedName ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                  </ActionIcon>
                </Group>

                <Collapse in={expandedName} transitionDuration={160}>
                  <Text mt={6} size="sm" style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.35 }}>
                    {course?.course_name}
                  </Text>
                </Collapse>
              </Paper>
            </Collapse>

            <Collapse in={isCollapsed} transitionDuration={160}>
              <Flex align="center" justify="center" mt="xs">
                <Tooltip
                  withArrow
                  position="right"
                  label={
                    <Box>
                      <Box>{course?.course_code}</Box>
                      <Box style={{ opacity: 0.85 }}>{course?.course_name}</Box>
                    </Box>
                  }
                >
                  <ActionIcon
                    variant="light"
                    radius="md"
                    size="lg"
                    style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
                  >
                    <FaInfo size={18} />
                  </ActionIcon>
                </Tooltip>
              </Flex>
            </Collapse>
          </Box>
        
        <Divider color="rgba(255,255,255,0.18)" mx="md" />   
        <Stack gap={6} px="md" py="md">
          {menuItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Tooltip
                key={item.key}
                label={isCollapsed ? item.label : undefined}
                withArrow
                position='right'
                disabled={!isCollapsed}
              >
                <NavLink
                  unstyled
                  active={active}
                  onClick={() => item.href !== "#" && router.push(item.href)}
                  leftSection={<span className="text-white/90 text-lg flex items-center">{item.icon}</span>}
                  label={
                    isCollapsed ? null : (
                      <span className="text-white/90 font-semibold text-sm">{item.label}</span>
                    )
                  }
                  className={[
                    "w-full rounded-xl border transition-all duration-150",
                    "cursor-pointer",
                    active
                      ? "bg-white/25 border-white/25"
                      : "bg-transparent border-transparent hover:bg-white/15 hover:border-white/15 hover:-translate-y-0.5",
                    isCollapsed ? "px-0 py-3 flex justify-center" : "px-3 py-3 flex items-center",
                  ].join(" ")}
                  styles={{
                    section: {
                      marginRight: isCollapsed ? 0 : 10,
                      width: isCollapsed ? "100%" : undefined,
                      display: "flex",
                      justifyContent: isCollapsed ? "center" : undefined,
                    },
                  }}
                />
              </Tooltip>
            );
          })}
        </Stack>

        <Divider color="rgba(255,255,255,0.18)" mx="md" />

        <Box px="md" py="md">
          {!isCollapsed ? (
            <Stack gap={8}>
              <Title order={4} c="rgba(255,255,255,0.85)">
                Instructors
              </Title>
              {isLoadingInstructor ? (
                <Stack gap={8}>
                  <Skeleton height={22} radius="sm" visible />
                  <Skeleton height={22} radius="sm" visible />
                  <Skeleton height={22} radius="sm" visible />
                </Stack>
              ) : isErrorInstructor ? (
                <Text size="xs" c="rgba(255,255,255,0.75)">
                  Failed to load instructors
                </Text>
              ) : (
                <Stack gap={6}>
                  {(instructorList ?? []).slice(0, 4).map((ins: InstructorList) => (
                    <Group key={ins.personalData_id} gap="xs" wrap="nowrap" px="sm">
                      <Avatar radius="xl" size={22} variant='white' color="#6665AC">
                        {ins.instructor_name?.trim()?.[0]?.toUpperCase() ?? "I"}
                      </Avatar>
                      <Text
                        size="sm"
                        lineClamp={1}
                        c="rgba(255,255,255,0.92)"
                      >
                        {ins.instructor_name}
                      </Text>
                    </Group>
                  ))}
                  {(instructorList?.length ?? 0) > 4 && (
                    <Text size="xs" c="rgba(255,255,255,0.65)">
                      +{(instructorList?.length ?? 0) - 4} more
                    </Text>
                  )}
                </Stack>
              )}
            </Stack>
          ) : (
            <Tooltip
              withArrow
              position="right"
              label={
                <Box>
                  <Text fw={700} size="sm">Instructors</Text>
                  <Box mt={6}>
                    {(instructorList ?? []).slice(0, 10).map((ins: InstructorList) => (
                      <Text key={ins.personalData_id} size="xs" style={{ opacity: 0.9 }}>
                        • {ins.instructor_name}
                      </Text>
                    ))}
                  </Box>
                </Box>
              }
            >
              <Group justify="center" gap={-6}>
                {(instructorList ?? []).slice(0, 3).map((ins: InstructorList) => (
                  <Avatar key={ins.personalData_id} radius="xl" size={26} variant='white' color="#6665AC">
                    {ins.instructor_name?.trim()?.[0]?.toUpperCase() ?? "I"}
                  </Avatar>
                ))}
              </Group>
            </Tooltip>
          )}
        </Box>
      </Flex>

      <Stack>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>
    </Box>
  )
}
