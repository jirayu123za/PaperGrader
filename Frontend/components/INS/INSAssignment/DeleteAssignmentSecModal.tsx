import React from "react";
import { Modal, Text, Group, Button, Stack, Box, Highlight } from "@mantine/core";
import { FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";

type DeleteAssignmentModalProps = {
  opened: boolean;
  onClose: () => void;
  assignmentID: string | null;
  assignmentSectionIDs?: string[];
  sectionIDs?: string[];
  sectionNames?: string[];
};

export default function DeleteAssignmentSecModal({ opened, onClose, assignmentID, assignmentSectionIDs, sectionIDs, sectionNames }: DeleteAssignmentModalProps) {
  const targetSectionsText = sectionNames && sectionNames.length > 0 ? sectionNames.join(", ") : "all its sections";
  const confirmMessage = `Are you sure you want to delete "this assignment"? This action will delete ${targetSectionsText} and cannot be undone.`;
  const highlights = ["this assignment", ...(sectionNames && sectionNames.length > 0 ? sectionNames : ["all its sections"]),  "cannot be undone."];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      radius="md"
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Stack align="center" gap="md">
        <Box
          w="64px"
          h="64px"
          mt="md"
          bdrs="999px"
          display="grid"
          style={{
            placeItems: "center",
            background: "rgba(255, 107, 107, 0.15)",
          }}
        >
          <FiAlertTriangle size={32} color="#ff6b6b" />
        </Box>

        <Stack align="center" gap={4}>
          <Text fw={600} fz="lg">
            Delete assignment?
          </Text>

          <Highlight
            ta="center"
            fz="sm"
            c="dimmed"
            highlight={highlights}
            highlightStyles={(theme) => ({
              backgroundColor: theme.colors.red[0],
              color: theme.colors.red[7],
              borderRadius: theme.radius.sm,
              padding: "0 4px",
              fontWeight: 600,
            })}
          >
            {confirmMessage}
          </Highlight>
        </Stack>

        <Group justify="center" mt="xs" gap="sm">
          <Button
            variant="outline"
            color="gray"
            leftSection={<FiX size={16} />}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            color="red"
            variant="filled"
            leftSection={<FiTrash2 size={16} />}
            onClick={() => {
              // TODO: Add delete assignment logic here (use assignmentID)
            }}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
