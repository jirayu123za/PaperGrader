"use client";

import React, { useState } from "react";
import { Modal, Textarea, Button, Text } from "@mantine/core";

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
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!assignment || !reason.trim()) return;
    setSubmitting(true);

    try {
      // 👇 ส่งคำขอไปยัง API (ตัวอย่าง)
      const response = await fetch(`/api/regrade/${assignment.assignment_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit regrade request");
      }

      console.log("✅ Regrade request sent:", {
        assignment_id: assignment.assignment_id,
        reason,
      });
      alert("Your regrade request has been submitted successfully.");
      setReason("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Request Regrade" centered>
      <Text mb="xs">
        Assignment: <strong>{assignment?.assignment_name}</strong>
      </Text>

      <Textarea
        label="Reason for Regrade"
        placeholder="Please provide a clear and concise reason for your regrade request..."
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
        loading={submitting}
        disabled={!reason.trim()}
      >
        Submit Request
      </Button>
    </Modal>
  );
};

export default STD_RegradeModal;
