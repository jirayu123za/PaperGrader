"use client";

import dayjs from "dayjs";
import {Card,Table,Text,Title,Input,Group,Loader,Center,} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { IoMdCheckmark, IoMdClose ,IoMdPeople  } from "react-icons/io";

const fmt = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(2));

const formatDate = (date?: string | Date | null) => {
  if (!date) return "";
  return dayjs(date).format("MMM DD, YYYY [at] hh:mm A");
};

const scoreText = (r: StudentRow, totalScore?: number) =>
  typeof totalScore === "number"
    ? `${r.score !== null ? fmt(r.score) : "-"} / ${fmt(totalScore)}`
    : r.score !== null
    ? fmt(r.score)
    : "-";

export type StudentRow = {
  personal_data_id: string;
  student_name: string;
  email: string;
  sections: string | null;
  score: number | null;
  graded: boolean;
  has_submission: boolean;
  submitted_at: Date | null;
};

export default function StudentTable({
  rows = [],
  loading,
  errorMessage,
  totalScore,
}: {
  rows?: StudentRow[];
  loading?: boolean;
  errorMessage?: string;
  totalScore?: number;
}) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      mt="lg"
      style={{ height: "100%" }}
    >
      <Group justify="space-between" mb="sm">
       <Title order={4} className="flex items-center gap-2">
          <IoMdPeople size={22} color="#6665AC" />
          <span >{rows.length} Students</span>
        </Title>
        <Input
          leftSection={<IconSearch size="1rem" />}
          placeholder="Search"
          w={220}
        />
      </Group>

      {loading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : errorMessage ? (
        <Center py="xl">
          <Text c="red">Failed to load: {errorMessage}</Text>
        </Center>
      ) : rows.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed">No data</Text>
        </Center>
      ) : (
        <Table.ScrollContainer minWidth={800} style={{ height: "100%" }}>
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w="15%">Name</Table.Th>
                <Table.Th w="15%">Email</Table.Th>
                <Table.Th w="10%">Sections</Table.Th>
                <Table.Th w="10%">Score</Table.Th>
                <Table.Th w="10%">Graded</Table.Th>
                <Table.Th w="10%">Submitted</Table.Th>
                <Table.Th w="15%">Time</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((r) => (
                <Table.Tr key={r.personal_data_id ?? r.email}>
                  <Table.Td w="15%">
                    <Text size="sm" title={r.student_name} lineClamp={1} >{r.student_name}</Text>
                  </Table.Td>
                  <Table.Td w="15%">
                    <Text size="sm" title={r.email} lineClamp={1} >{r.email}</Text>
                  </Table.Td>
                  <Table.Td w="10%" pl="24px">
                    <Text size="sm" title={r.sections ?? "-"} lineClamp={1} >{r.sections ?? "-"}</Text>
                  </Table.Td>
                  <Table.Td w="10%">
                    <Text
                      size="sm"
                      truncate
                      title={scoreText(r, totalScore)}
                    >
                      {scoreText(r, totalScore)}
                    </Text>
                  </Table.Td>
                  <Table.Td w="10%" pl="24px">
                    {r.graded ? (
                      <IoMdCheckmark
                        size={18}
                        color="#2f9e44"
                        aria-label="graded"
                      />
                    ) : (
                      <IoMdClose
                        size={18}
                        color="#fa5252"
                        aria-label="not graded"
                      />
                    )}
                  </Table.Td>
                  <Table.Td w="10%" pl="34px">
                    {r.has_submission ? (
                      <IoMdCheckmark
                        size={18}
                          color="#2f9e44"
                          aria-label="submitted"
                        />
                      ) : (
                        <IoMdClose
                          size={18}
                          color="#fa5252"
                          aria-label="not submitted"
                        />
                      )}
                  </Table.Td>
                  <Table.Td w="15%"> 
                    <Text size="sm" title={r.submitted_at ? `${formatDate(r.submitted_at)} / ${totalScore}` : "-"} lineClamp={1} >{r.submitted_at ? formatDate(r.submitted_at) : "-"}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Card>
  );
}
