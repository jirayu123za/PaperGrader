"use client";

import React, { useState } from "react";
import { Table, Button, Badge } from "@mantine/core";
import STD_RegradeModal from "./STD_RegradeModal";

interface Assignment {
  assignment_id: string;
  assignment_name: string;
  score?: number;
  published_grade?: boolean;
}

interface Props {
  assignments?: {
     assignment_id: string;
    assignment_name: string;
    score?: number;
    published_grade?: boolean;
  }[]; // 👈 optional เพราะตอนโหลดอาจยังไม่มีค่า
}

const STD_RegradeList: React.FC<Props> = ({ assignments = [] }) => {
     if (assignments.length === 0) {
    return <p style={{ color: "#888" }}>No assignments to display.</p>;
  }
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [opened, setOpened] = useState(false);

  const handleRegradeClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setOpened(true);
  };

  return (
    <>
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
          {(!assignments || assignments.length === 0) ? ( // 👈 safe check
            <Table.Tr>
              <Table.Td colSpan={4} style={{ textAlign: "center" }}>
                No assignments found.
              </Table.Td>
            </Table.Tr>
          ) : (
            assignments.map((a) => (
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
                    disabled={!a.published_grade}
                    onClick={() => handleRegradeClick(a)}
                  >
                    Request Regrade
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      <STD_RegradeModal
        opened={opened}
        onClose={() => setOpened(false)}
        assignment={selectedAssignment}
      />
    </>
  );
};

export default STD_RegradeList;
