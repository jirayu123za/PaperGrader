"use client";

import { Card, Table, Text, Title, Input, Group, Loader, Center } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export type StudentRow = {
  personal_data_id: string;
  student_name: string;
  email: string;
  sections: string | null;
  score: number | null;
  graded: boolean;
  has_submission: boolean;
  submitted_at: string | null;
};

export default function StudentTable({
  rows = [],
  loading,
  errorMessage,
}: {
  rows?: StudentRow[];
  loading?: boolean;
  errorMessage?: string;
}) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mt="lg" style={{ height: "100%" }}>
      <Group justify="space-between" mb="sm">
        <Title order={4}>👥 {rows.length} Students</Title>
        <Input leftSection={<IconSearch size="1rem" />} placeholder="Search" w={220} />
      </Group>

      {loading ? (
        <Center py="xl"><Loader /></Center>
      ) : errorMessage ? (
        <Center py="xl"><Text c="red">Failed to load: {errorMessage}</Text></Center>
      ) : rows.length === 0 ? (
        <Center py="xl"><Text c="dimmed">No data</Text></Center>
      ) : (
        <Table.ScrollContainer minWidth={800} style={{ height: "100%" }}>
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Sections</Table.Th>
                <Table.Th>Score</Table.Th>
                <Table.Th>Graded</Table.Th>
                <Table.Th>Submitted</Table.Th>
                <Table.Th>Time</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((r) => (
                <Table.Tr key={r.personal_data_id ?? r.email}>
                  <Table.Td>{r.student_name}</Table.Td>
                  <Table.Td>{r.email}</Table.Td>
                  <Table.Td>{r.sections ?? "-"}</Table.Td>
                  <Table.Td>{r.score ?? "-"}</Table.Td>
                  <Table.Td>{r.graded ? "✓" : "✘"}</Table.Td>
                  <Table.Td>{r.has_submission ? "Yes" : "No submission"}</Table.Td>
                  <Table.Td>{r.submitted_at ?? "-"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Card>
  );
}
