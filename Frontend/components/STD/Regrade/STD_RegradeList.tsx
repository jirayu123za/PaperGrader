"use client";

import React, { useState } from "react";
import { Table, Button, Badge, Modal, Text } from "@mantine/core";
import STD_RegradeModal from "./STD_RegradeModal";

interface Assignment {
  assignment_id: string;
  assignment_name: string;
  score?: number;
  published_grade?: boolean;
}

interface Props {
  assignments?: Assignment[];
}

const STD_RegradeList: React.FC<Props> = ({ assignments = [] }) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [opened, setOpened] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRegradeClick = (assignment: Assignment) => {
    // เปิด popup ยืนยันก่อน
    setSelectedAssignment(assignment);
    setConfirmOpen(true);
  };

  const handleConfirmYes = () => {
    // ปิด popup ยืนยัน -> เปิดหน้ากรอกเหตุผล
    setConfirmOpen(false);
    setOpened(true);
  };

  const handleConfirmNo = () => {
    // ปิด popup ยืนยันเฉย ๆ
    setConfirmOpen(false);
  };

  return (
    <>
      {/* ✅ ถ้าไม่มี assignment */}
      {!assignments || assignments.length === 0 ? (
        <div className="text-center text-gray-500 mt-6">
          This course has no assignments assigned yet.
        </div>
      ) : (
        <Table highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Score</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Status</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {assignments.map((a) => (
              <Table.Tr key={a.assignment_id}>
                <Table.Td>{a.assignment_name}</Table.Td>

                <Table.Td style={{ textAlign: "center" }}>
                  {a.published_grade ? a.score ?? "0" : "-"}
                </Table.Td>

                <Table.Td style={{ textAlign: "center" }}>
                  {a.published_grade ? (
                    <Badge color="green">Published</Badge>
                  ) : (
                    <Badge color="gray">Not Published</Badge>
                  )}
                </Table.Td>

                <Table.Td style={{ textAlign: "center" }}>
                  <Button
                    variant="light"
                    color="violet"
                    disabled={!a.published_grade} // ❗เฉพาะเมื่อคะแนนประกาศแล้วเท่านั้น
                    onClick={() => handleRegradeClick(a)}
                  >
                    Request Regrade
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {/* 🟣 Popup ยืนยันก่อนทำการร้องขอ */}
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Regrade Request"
        centered
      >
        <Text mb="md">
          Are you sure you want to submit a regrade request for{" "}
          <strong>{selectedAssignment?.assignment_name}</strong>?
        </Text>
        <div className="flex justify-end gap-3">
          <Button color="red" onClick={handleConfirmNo}>
            No
          </Button>
          <Button color="green" onClick={handleConfirmYes}>
            Yes
          </Button>
        </div>
      </Modal>

      {/* 🟣 Modal สำหรับกรอกเหตุผล */}
      <STD_RegradeModal
        opened={opened}
        onClose={() => setOpened(false)}
        assignment={selectedAssignment}
      />
    </>
  );
};

export default STD_RegradeList;
