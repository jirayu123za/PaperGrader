"use client";
import React from "react";
import { Box, Text, ScrollArea, Title, Group, Flex, Burger, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FaCircle } from "react-icons/fa";
import questionsData from "@/mock/questionsData.json";

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
            Example assignment
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
          Jirayu Sukprasert
        </Text>

        <Text size="sm" c="dimmed">
          Total Points
        </Text>
        <Text fw={500} mb="md">
          - / 24 pts
        </Text>

        <ScrollArea type="hover" scrollbarSize={8} scrollbars="y" mah={"calc(100vh - 300px)"}>
          {questionsData.map((q, idx) => (
            <Box key={q.question_id} mb="lg" pr="md">
              <Text size="sm" fw="500">Question {idx + 1}</Text>
              <Group justify="space-between" className="group">
                {q.question_title && (
                  <Title 
                    order={5} 
                    size="md"
                    fw={400}
                    lineClamp={1}
                    className={
                      !q.sub_questions
                        ? "text-[#495057] group-hover:text-[#3B5BDB] group-hover:underline transition-colors duration-200 cursor-pointer"
                        : "text-[#495057]"
                    }
                  >
                    {q.question_title}
                  </Title>
                )}                
                <Text size="sm">{q.question_point} pts</Text>
              </Group>

              {q.sub_questions?.map((sub, subIdx) => (
                <Box key={sub.sub_question_id} pl="md" mt="xs" className="group">
                  <Group justify="space-between" w="100%" wrap="nowrap">
                    <Flex gap="md">
                      <Text size="sm">
                        {`${idx + 1}.${subIdx + 1}`}
                      </Text>
                      <Title
                        order={6}
                        size="sm"
                        fw={400}
                        lineClamp={1}
                        className="text-[#495057] group-hover:text-[#3B5BDB] group-hover:underline transition-colors duration-200 cursor-pointer"
                      >
                        {sub.sub_question_title}
                      </Title>
                    </Flex>
                    <Text size="sm" w={60} ta="right">
                      {sub.sub_question_point} pts
                    </Text>
                  </Group>
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
