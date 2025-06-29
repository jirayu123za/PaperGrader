"use client";
import { Card, Table, Text, Title, Input, Group } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export default function StudentTable() {
    const students = [
        {
            name: "Jirayu",
            email: "jirayu0042za@gmail.com",
            sections: "801",
            score: "1.0",
            graded: "✘",
            viewed: "--",
            time: "Jan 30 at 12:57PM",
        },
        {
            name: "KANAPHAT",
            email: "kanaphat_p@cmu.ac.th",
            sections: "",
            score: "-",
            graded: "No submission",
            viewed: "-",
            time: "-",
        },
        {
            name: "Navadon Khunlertgit",
            email: "navadon.k@cmu.ac.th",
            sections: "801",
            score: "-",
            graded: "No submission",
            viewed: "-",
            time: "-",
        },
        {
            name: "Test User",
            email: "test@gmail.com",
            sections: "801",
            score: "-",
            graded: "No submission",
            viewed: "-",
            time: "-",
        },
        {
            name: "Alice",
            email: "alice@example.com",
            sections: "802",
            score: "2.0",
            graded: "✓",
            viewed: "Yes",
            time: "Jan 31 at 10:00AM",
        },
        {
            name: "Bob",
            email: "bob@example.com",
            sections: "802",
            score: "3.0",
            graded: "✓",
            viewed: "Yes",
            time: "Jan 31 at 11:15AM",
        },
        {
            name: "Charlie",
            email: "charlie@example.com",
            sections: "803",
            score: "-",
            graded: "No submission",
            viewed: "-",
            time: "-",
        },
    ];

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder mt="lg" style={{ height: "100%" }}>
            <Group justify="space-between" mb="sm">
                <Title order={4}>👥 {students.length} Students</Title>
                <Input
                    icon={<IconSearch size="1rem" />}
                    placeholder="Search"
                    w={200}
                />
            </Group>
            <Table.ScrollContainer minWidth={800} style={{ height: "100%" }}>
                <Table striped withTableBorder >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Email</Table.Th>
                            <Table.Th>Sections</Table.Th>
                            <Table.Th>Score</Table.Th>
                            <Table.Th>Graded</Table.Th>
                            <Table.Th>Viewed</Table.Th>
                            <Table.Th>Time</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {students.map((s) => (
                            <Table.Tr key={s.email}>
                                <Table.Td>{s.name}</Table.Td>
                                <Table.Td>{s.email}</Table.Td>
                                <Table.Td>{s.sections}</Table.Td>
                                <Table.Td>{s.score}</Table.Td>
                                <Table.Td>{s.graded}</Table.Td>
                                <Table.Td>{s.viewed}</Table.Td>
                                <Table.Td>{s.time}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>
        </Card>
    );
}
