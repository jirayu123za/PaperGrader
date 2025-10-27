"use client";
import React, { useState } from "react";
import { Box, Text, ScrollArea, Title, Group, Flex, Burger, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FaCircle } from "react-icons/fa";
import { RubricDetails } from "@/components/STD/RubricDetails";
import questionsData from "@/mock/questionsData.json";

export const SidebarQuestions_STD = () => {
  const [opened, { toggle }] = useDisclosure(true);
  const [selectedRubricID, setSelectedRubricID] = useState<string | null>(null);

  const handleRubricSelect = (id: string) => {
    setSelectedRubricID((prev) => (prev === id ? null : id));
  };

  return (
    <Flex
      direction="column"
      bg="#F9F9F9"
      w={opened ? "100%" : 60}
      maw={460}
      className="border-l border-gray-300 shadow-inner"
    >
      {/* 🟣 Header Bar */}
      <Flex
        justify="flex-start"
        align="center"
        p="md"
        bg="#6665AC"
        style={{ borderBottom: "1px solid #5555A2" }}
      >
        <Burger
          lineSize={4}
          size="md"
          opened={opened}
          onClick={toggle}
          color="white"
          aria-label="Toggle sidebar"
        />
        {opened && (
          <Text fw={600} ml="md" c="white" size="sm">
            Assignment Overview
          </Text>
        )}
      </Flex>

      {/* 🟣 Content Section */}
      {opened && (
        <Flex direction="column" className="flex-1 p-4" bg="#f8f9fa" w="100%" maw={500}>
          {/* 🔹 Assignment Info */}
          <Group justify="space-between" mb="xs">
            <Title order={4} fw={500} c="#343A40">
              Example Assignment
            </Title>
            <Group gap={4}>
              <FaCircle size={8} color="#868E96" />
              <Text size="xs" fw={500} c="#868E96">
                Ungraded
              </Text>
            </Group>
          </Group>

          <Text size="sm" fw={500} mt="sm">
            Student
          </Text>
          <Text size="sm" fw={400}>
            Jirayu Sukprasert
          </Text>

          <Text size="sm" fw={500} mt="sm">
            Total Points
          </Text>
          <Text size="sm" fw={400} mb="sm">
            - / 24 pts
          </Text>

          <Divider my="sm" />

          {/* 🔹 Scrollable Question List */}
          <ScrollArea
            type="hover"
            scrollbarSize={8}
            offsetScrollbars
            mah={"calc(100vh - 280px)"}
          >
            {questionsData.map((q, idx) => (
              <Box key={q.question_id} mb="lg" pr="md">
                {/* ✅ Main question */}
                <Title
                  order={5}
                  fw={500}
                  size="sm"
                  className={`cursor-pointer transition-all duration-150 ${
                    selectedRubricID === q.question_id
                      ? "text-[#3B5BDB]"
                      : "text-[#495057] hover:text-[#3B5BDB]"
                  }`}
                  onClick={() => handleRubricSelect(q.question_id)}
                >
                  {`Question ${idx + 1}: ${q.question_title}`}
                </Title>

                {/* ✅ Sub-questions */}
                {q.sub_questions?.map((sub, subIdx) => (
                  <Box key={sub.sub_question_id} pl="md" mt="xs">
                    <Text
                      size="sm"
                      className={`cursor-pointer transition-all duration-150 ${
                        selectedRubricID === sub.sub_question_id
                          ? "text-[#3B5BDB]"
                          : "text-[#495057] hover:text-[#3B5BDB]"
                      }`}
                      onClick={() => handleRubricSelect(sub.sub_question_id)}
                    >
                      {`${idx + 1}.${subIdx + 1} ${sub.sub_question_title}`}
                    </Text>

                    {/* ✅ Rubric แสดงเมื่อคลิก sub-question */}
                    {selectedRubricID === sub.sub_question_id && (
                      <Box pl="md" mt="sm">
                        <RubricDetails rubric={sub.rubric} />
                      </Box>
                    )}
                  </Box>
                ))}

                {/* ✅ Rubric แสดงเมื่อคลิก main question */}
                {selectedRubricID === q.question_id && (
                  <Box pl="md" mt="sm">
                    <RubricDetails rubric={q.rubric} />
                  </Box>
                )}
              </Box>
            ))}
          </ScrollArea>
        </Flex>
      )}
    </Flex>
  );
};
