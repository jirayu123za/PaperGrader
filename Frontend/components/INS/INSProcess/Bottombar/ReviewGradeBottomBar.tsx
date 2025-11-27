"use client";
import { Button, Box } from "@mantine/core";
import { IconDownload, IconUpload } from "@tabler/icons-react";

export default function ReviewGradeBottomBar() {
  return (
    <Box className="flex justify-end gap-2 w-full">
      <Button
        leftSection={<IconDownload size={12} />}
        variant="default"
        color="indigo"
        size="xs"
        radius="sm"
        className="h-7 px-2"
      >
        Download Grades
      </Button>
      <Button
        leftSection={<IconDownload size={12} />}
        variant="default"
        color="indigo"
        size="xs"
        radius="sm"
        className="h-7 px-2"
      >
        Export Evaluations
      </Button>
      <Button
        leftSection={<IconDownload size={12} />}
        variant="default"
        color="indigo"
        size="xs"
        radius="sm"
        className="h-7 px-2"
      >
        Export Submissions
      </Button>
      <Button
        leftSection={<IconUpload size={12} />}
        variant="filled"
        color="indigo"
        size="xs"
        radius="sm"
        className="h-7 px-2"
      >
        Publish Grades
      </Button>
    </Box>
  );
}
