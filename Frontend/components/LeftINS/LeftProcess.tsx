"use client";

import AccountMenu from '@/components/Account';
import { useEffect, useMemo } from 'react';
import { useFetchAssignmentLeft } from '@/hooks/SideBar/useFetchAssignmentLeft';
import { useLeftProcessSidebarStore } from '@/store/process-outline/leftProcessSidebarStore';
import { useAssignmentLeftProcessStore, useLeftProcessStore } from '@/store/useLeftProcessStore';
import { ActionIcon, Badge, Box, Collapse, Divider, Flex, Group, Image, NavLink, Paper, Skeleton, Stack, Text, Title, Tooltip, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { FaInfo } from 'react-icons/fa';
import { GiClockwiseRotation } from 'react-icons/gi';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { IoIosArrowBack, IoIosListBox, IoMdSettings } from 'react-icons/io';
import { IoStatsChart } from 'react-icons/io5';
import { MdEditSquare, MdRateReview } from "react-icons/md";
import { RiFolderUploadFill } from "react-icons/ri";

type MenuItem = {
  key: string;
  label: string;
  href: string;
  icon: JSX.Element;
};

export default function LeftProcess() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const course_id = params?.course_id as string;
  const assignment_id = params?.assignment_id as string;
  const { isCollapsed, toggle } = useLeftProcessSidebarStore((s) => ({isCollapsed: s.isCollapsed, toggle: s.toggle }));
  const { setActiveOption } = useLeftProcessStore();
  const [ expandedInfo, { toggle: toggleExpandedInfo }] = useDisclosure(true);
  const { isLoading: isLoadingAssignment, isError: isErrorAssignment } = useFetchAssignmentLeft(course_id as string, assignment_id as string);
  const { assignmentLeftProcess } = useAssignmentLeftProcessStore();

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        key: "editOutline",
        label: "Edit Outline and Rubric",
        href: `/instructor/course/${course_id}/process/${assignment_id}/create-outline`,
        icon: <MdEditSquare />,
      },
      {
        key: "manageSubmissions",
        label: "Manage Submissions",
        href: `/instructor/course/${course_id}/process/${assignment_id}/manage-submissions`,
        icon: <RiFolderUploadFill />,
      },
      {
        key: "gradeSubmissions",
        label: "Grade Submissions",
        href: `/instructor/course/${course_id}/process/${assignment_id}/grade-submissions`,
        icon: <IoIosListBox />,
      },
      {
        key: "reviewGrade",
        label: "Review Grade",
        href: `/instructor/course/${course_id}/process/${assignment_id}/review-grade`,
        icon: <MdRateReview />,
      },
    ],
    [course_id, assignment_id]
  );

  const footerItems: MenuItem[] = useMemo(
    () => [
      {
        key: "regrade",
        label: "Regrade Requests",
        href: "#",
        icon: <GiClockwiseRotation />,
      },
      {
        key: "statistics",
        label: "Statistics",
        href: `/instructor/course/${course_id}/process/${assignment_id}/statistics`,
        icon: <IoStatsChart />,
      },
      {
        key: "settings",
        label: "Settings",
        href: "#",
        icon: <IoMdSettings />,
      },
    ],
    [course_id, assignment_id]
  );

  useEffect(() => {
    const all = [...menuItems, ...footerItems].filter((x) => x.href !== "#");
    const activeKey = all.find((opt) => pathname?.startsWith(opt.href))?.key ?? "";
    setActiveOption(activeKey);
  }, [pathname, menuItems, footerItems, setActiveOption]);

  
  const renderNavItem = (item: MenuItem) => {
    const active = item.href !== "#" && pathname?.startsWith(item.href);
    return (
      <Tooltip
        key={item.key}
        label={isCollapsed ? item.label : undefined}
        withArrow
        position="right"
        disabled={!isCollapsed}
      >
        <NavLink
          unstyled
          active={!!active}
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
  };

  return (
    <Box
      className={`relative flex flex-col justify-between border-r transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      h="100dvh"
    >
      {/* Header */}
      <Flex
        justify={isCollapsed ? "center" : "space-between"}
        align="center"
        p={12}
        bg="#6665AC"
        mih={84}
      >
        <Transition mounted={!isCollapsed} transition="fade-left" duration={160}>
          {(styles) => (
            <Box style={styles}>
              <Image
                src="/Image/logo-ppgd2.png"
                alt="logo"
                w={200}
                h={60}
                p={2}
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/INSCourseOverview")}
              />
            </Box>
          )}
        </Transition>

        <Tooltip label={isCollapsed ? "Expand" : "Collapse"} withArrow position="right">
          <ActionIcon
            onClick={toggle}
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

      {/* Body */}
      <Flex direction="column" bg="#6665AC" className="flex-grow">
        <Divider color="rgba(255,255,255,0.18)" mx="md" />

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
              {isLoadingAssignment ? (
                <Stack gap={8}>
                  <Group justify="space-between" wrap="nowrap">
                    <Skeleton height={18} width="55%" radius="sm" />
                    <Skeleton height={18} width={64} radius="sm" />
                  </Group>
                  <Skeleton height={14} width="85%" radius="sm" />
                </Stack>
              ) : isErrorAssignment ? (
                <Stack gap={6}>
                  <Text size="sm" c="rgba(255,255,255,0.9)" fw={700}>
                    Failed to load assignment
                  </Text>
                  <Text size="xs" c="rgba(255,255,255,0.75)">
                    Please refresh or try again.
                  </Text>
                </Stack>
              ) : (
                <>
                  <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
                    <Group gap="xs" wrap="nowrap">
                      <Title order={5} c="#fff" lineClamp={1}>
                        {assignmentLeftProcess?.course_code ?? "Course"}
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
                        {assignmentLeftProcess?.semester
                          ? `${assignmentLeftProcess.semester}/${Number(assignmentLeftProcess.academic_year) + 543}`
                          : ""}
                      </Badge>
                    </Group>

                    <ActionIcon
                      variant="subtle"
                      onClick={toggleExpandedInfo}
                      styles={{ root: { color: "rgba(255,255,255,0.9)" } }}
                    >
                      {expandedInfo ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                    </ActionIcon>
                  </Group>

                  <Collapse in={expandedInfo} transitionDuration={160}>
                    <Text mt={6} size="sm" style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.35 }}>
                      {assignmentLeftProcess?.assignment_name ?? ""}
                    </Text>
                  </Collapse>
                </>
              )}
            </Paper>
          </Collapse>

          {/* collapsed tooltip */}
          <Collapse in={isCollapsed} transitionDuration={160}>
            <Flex align="center" justify="center" mt="xs">
              <Tooltip
                withArrow
                position="right"
                label={
                  isLoadingAssignment ? (
                    <Text size="sm">Loading...</Text>
                  ) : isErrorAssignment ? (
                    <Text size="sm">Failed to load</Text>
                  ) : (
                    <Box>
                      <Box>{assignmentLeftProcess?.course_code}</Box>
                      <Box style={{ opacity: 0.85 }}>{assignmentLeftProcess?.assignment_name}</Box>
                    </Box>
                  )
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
        {/* Back to course */}
        <Stack gap={6} px="md" py="md">
          <Tooltip
            withArrow
            position="right"
            disabled={!isCollapsed}
            label="Course › Assignments"
          >
            <Box
              onClick={() => router.push(`/instructor/course/${course_id}/assignment`)}
              className={[
                "w-full rounded-xl border transition-all duration-150 cursor-pointer",
                "bg-white/12 border-white/18 hover:bg-white/18 hover:border-white/25",
                isCollapsed ? "px-0 py-3 flex justify-center" : "px-3 py-3",
              ].join(" ")}
            >
              <Group gap={10} wrap="nowrap" justify={isCollapsed ? "center" : "flex-start"}>
                <span className="text-white/90 text-lg flex items-center">
                  <IoIosArrowBack />
                </span>

                {!isCollapsed && (
                  <>
                    {isLoadingAssignment ? (
                      <Skeleton height={14} width="70%" radius="sm" />
                    ) : isErrorAssignment ? (
                      <Text size="sm" c="rgba(255,255,255,0.85)">
                        Course <Text style={{ opacity: 0.7 }}>›</Text> Assignments
                      </Text>
                    ) : (
                      <Group gap={6} wrap="nowrap">
                        <Text size="sm" fw={600} c="rgba(255,255,255,0.75)" lineClamp={1}>
                          {assignmentLeftProcess?.course_code ?? "Course"}
                        </Text>
                        <Text size="sm" c="rgba(255,255,255,0.55)">
                          ›
                        </Text>
                        <Text size="sm" fw={700} c="rgba(255,255,255,0.95)" lineClamp={1}>
                          Assignments
                        </Text>
                      </Group>
                    )}
                  </>
                )}
              </Group>
            </Box>
          </Tooltip>
        </Stack>

        <Divider color="rgba(255,255,255,0.18)" mx="md" />

        {/* Main menu */}
        <Stack gap={6} px="md" py="md">
          {menuItems.map(renderNavItem)}
        </Stack>

        <Divider color="rgba(255,255,255,0.18)" mx="md" />

        {/* Footer menu */}
        <Stack gap={6} px="md" py="md">
          {footerItems.map(renderNavItem)}
        </Stack>
      </Flex>

      <Stack>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>
    </Box>
  );
}