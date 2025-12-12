"use client";

import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { ActionIcon, Box, Divider, Flex, Image, Stack, Text, Title, Tooltip, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AccountMenu from '@/components/Account';

export default function LeftOverview() {
  const [isCollapsed, { toggle }] = useDisclosure(false);

  return (
    <Box
      className={`relative flex flex-col justify-between border-r transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      h="100dvh"
    >
      <Flex
        justify="space-between"
        align="center"
        p={12}
        style={{ backgroundColor: "#6665AC" }}
      >
        <Transition mounted={!isCollapsed} transition="fade-left" duration={160}>
          {(styles) => (
            <Box style={styles}>
              <Image src="/Image/logo-ppgd2.png" alt="logo" w={200} h={60} p={2} />
            </Box>
          )}
        </Transition>

        <Tooltip label={isCollapsed ? "Expand" : "Collapse"} withArrow position="right">
          <ActionIcon
            onClick={toggle}
            variant="subtle"
            radius="md"
            size="lg"
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

      <Stack
        className={`grow p-4 ${isCollapsed ? "items-center" : ""}`}
        style={{ backgroundColor: "#6665AC" }}
      >
        <Transition mounted={!isCollapsed} transition="fade" duration={120}>
          {(styles) => <Divider style={styles} color="rgba(255,255,255,0.25)" />}
        </Transition>

        <Transition mounted={!isCollapsed} transition="fade" duration={180}>
          {(styles) => (
            <Box style={styles}>
              <Title order={2} c="#F9F9F9">
                Your Courses
              </Title>
              <Text size="sm" pt={4} c="#E9E9E9">
                Welcome to PaperGrader! Click on one of your courses to the right,
                or on the Account menu below.
              </Text>
            </Box>
          )}
        </Transition>
      </Stack>

      <Stack>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>
    </Box>
  );
}