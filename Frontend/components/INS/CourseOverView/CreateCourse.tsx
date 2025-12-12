import React from "react";
import { Box, Card, Text } from "@mantine/core";
import { CreateCourseModal } from "@/components/Create/CreateCourseModal";
import { useDisclosure } from "@mantine/hooks";

export const CreateCourse = () => {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <Card
        withBorder
        radius="md"
        shadow="sm"
        mih="180px"
        className="flex items-center justify-center cursor-pointer"
        onClick={open}
        style={{
          borderColor: "#5C3C92",
          borderStyle: "dashed",
        }}
      >
        <Box ta="center" style={{ color: "#5C3C92" }}>
          <Text size="xl" fw={700} className="mb-1">
            +
          </Text>
          <Text size="md">Create a new course</Text>
        </Box>
      </Card>
      <CreateCourseModal
        opened={opened} 
        close={close}
      />
    </>
  );
};
