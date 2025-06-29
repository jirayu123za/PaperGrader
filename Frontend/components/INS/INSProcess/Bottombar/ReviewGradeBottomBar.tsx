"use client";
import { Group, Button, Box } from "@mantine/core";
import { IconDownload, IconUpload } from "@tabler/icons-react";

export default function BottomBar() {
  return (
    <Box
      mt="md"
      p="sm"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "0.5rem",
      }}
    >
      <Button
        leftSection={<IconDownload size={16} />}
        variant="default"
        color="indigo"
      >
        Download Grades
      </Button>
      <Button
        leftSection={<IconDownload size={16} />}
        variant="default"
        color="indigo"
      >
        Export Evaluations
      </Button>
      <Button
        leftSection={<IconDownload size={16} />}
        variant="default"
        color="indigo"
      >
        Export Submissions
      </Button>
      <Button
        leftSection={<IconUpload size={16} />}
        variant="filled"
        color="indigo"
      >
        Publish Grades
      </Button>
    </Box>
  );
}
