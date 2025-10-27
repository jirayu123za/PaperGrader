"use client";

import React from "react";
import { Modal, Text, Group, Button, Stack, Box } from "@mantine/core";
import { FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";

type ConfirmDeleteModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  loading?: boolean;
  size?: string | number;
};

export default function ConfirmDeleteModal({
  opened,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  loading = false,
  size = 440,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={size}
      centered
      withCloseButton
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      title={
        <Text fw={700} c="#fff">
          {title}
        </Text>
      }
      styles={{
        header: {
          background: "#ff6b6b",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          padding: "12px 16px",
          marginBottom: 0,
        },
        title: { color: "#fff" },
        close: { color: "#fff" },
        content: {
          borderRadius: 12,
          paddingTop: 0,
          backgroundColor: "#fff",
        },
        body: { paddingTop: 20, paddingBottom: 16 },
      }}
    >
      <Stack align="center" gap="md">
        <Box
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: "rgba(255, 107, 107, 0.15)",
          }}
        >
          <FiAlertTriangle size={32} color="#ff6b6b" />
        </Box>

        <Stack gap={0} align="center">
          <Text ta="center" fz="sm" c="dimmed">
            Are you sure you want to delete?
          </Text>
          <Text ta="center" fz="sm" c="dimmed">
            This action cannot be undone.
          </Text>
        </Stack>

        {/* Actions */}
        <Group justify="center" mt="xs" gap="sm">
          <Button
            variant="default"
            leftSection={<FiX size={16} />}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="red"
            leftSection={<FiTrash2 size={16} />}
            loading={loading}
            onClick={async () => {
              await onConfirm();
            }}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
