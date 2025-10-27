"use client";

import React, { useState } from "react";
import { Modal, Textarea, Button } from "@mantine/core";

interface Assignment {
  assignment_id: string;
  assignment_name: string;
}

interface Props {
  opened: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

const STD_RegradeModal: React.FC<Props> = ({
  opened,
  onClose,
  assignment,
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!assignment) return;
    console.log("Regrade submitted:", {
      assignment_id: assignment.assignment_id,
      reason,
    });
    setReason("");
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Request Regrade" centered>
      <p>
        Assignment: <strong>{assignment?.assignment_name}</strong>
      </p>
      <Textarea
        label="Reason for Regrade"
        placeholder="Explain why you want this assignment regraded..."
        value={reason}
        onChange={(e) => setReason(e.currentTarget.value)}
        autosize
        minRows={3}
      />
      <Button
        fullWidth
        mt="md"
        color="violet"
        onClick={handleSubmit}
        disabled={!reason.trim()}
      >
        Submit Request
      </Button>
    </Modal>
  );
};

export default STD_RegradeModal;
