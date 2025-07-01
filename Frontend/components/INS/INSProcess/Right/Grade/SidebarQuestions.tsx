"use client";
import React from "react";
import { Box, Text, ScrollArea, Title, Anchor, Group, Flex, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FaCircle } from "react-icons/fa";

const questionsData = [
  {
    number: 1,
    title: "what is number",
    points: 5,
  },
  {
    number: 2,
    title: "what is sql",
    points: 6,
    subQuestions: [
      { number: "2.1", title: "what is data", points: 5 },
      { number: "2.2", title: "what is question name at this area", points: 1 },
    ],
  },
  {
    number: 3,
    title: "what is question name at this area two",
    points: 1,
  },
  // ...more questions
];

export const SidebarQuestions = () => {
  const [opened, { toggle }] = useDisclosure(true);

  return (
    <Flex direction="column" bg="#F9F9F9" w={opened ? "100%" : 60} maw={460} className="border-l 1px solid #ddd">
      <Flex justify="flex-start" align="center" p="md" bg="#6665AC">
        <Burger lineSize={4} size="md" opened={opened} onClick={toggle} color="white" aria-label="Toggle navigation"/>
      </Flex>

    {opened && (
        <Flex direction="column" className="flex-1 p-4" bg={"#f8f9fa"} w="100%" maw={500} pl="lg" pr="lg">
            <Group justify="space-between" mb="md">
                <Title order={4} fw={500} c="#495057">
                    ExAssignment
                </Title>

                <Group gap={4}>
                    <FaCircle size={8} className="pt-[-9px]"/>
                    <Text size="xs" fw={500}>
                        Ungraded
                    </Text>
                </Group>
            </Group>

            <Text size="sm" fw={500}>
                Student
            </Text>
            <Text size="sm" fw={400} mb="md">
                jirayu
            </Text>

            <Text size="sm" c="dimmed">
                Total Points
            </Text>
            <Text fw={500} mb="md">
                - / 24 pts
            </Text>

            <ScrollArea type="never" scrollbarSize={4} scrollbars="y" h="calc(100vh - 90px)" mah={600}>
                {questionsData.map((q) => (
                    <Box key={q.number} mb="sm">
                        <Group justify="space-between">
                        <Text fw={500}>Question {q.number}</Text>
                        <Text size="sm">{q.points} pts</Text>
                        </Group>
                        {q.title && (
                        <Anchor c="blue" fz="sm">
                            {q.title}
                        </Anchor>
                        )}
                        {q.subQuestions?.map((sub) => (
                        <Box key={sub.number} pl="md" mt="xs">
                            <Group justify="space-between">
                            <Text size="sm" c="dimmed">
                                ↳ {sub.number}
                            </Text>
                            <Text size="sm">{sub.points} pts</Text>
                            </Group>
                            <Anchor c="blue" fz="sm">
                            {sub.title}
                            </Anchor>
                        </Box>
                        ))}
                    </Box>
                ))}
            </ScrollArea>
        </Flex>
    )}
    </Flex>
  );
};
