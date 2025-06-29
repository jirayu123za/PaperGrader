"use client";
import { Card, Title, Text, SimpleGrid } from "@mantine/core";
import { BarChart } from "@mantine/charts";

export default function GradeStatistics() {
  // สร้างข้อมูล random
  const gradesData = Array.from({ length: 5 }, (_, i) => ({
    grade: `${i + 1}.0`,
    count: Math.floor(Math.random() * 10),
  }));

  const stats = [
    { label: "Minimum", value: Math.min(...gradesData.map((d) => d.count)) },
    { label: "Median", value: 0 }, // Mock ไว้ ถ้าอยากคำนวณจริงบอกได้
    { label: "Maximum", value: Math.max(...gradesData.map((d) => d.count)) },
    {
      label: "Mean",
      value:
        gradesData.reduce((sum, d) => sum + d.count, 0) / gradesData.length,
    },
    { label: "Std Dev", value: 0 }, // Mock ไว้
  ];

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={3} mb="md">
        Review Grades for Test
      </Title>
      <BarChart
        h={200}
        data={gradesData}
        dataKey="grade"
        series={[{ name: "count", color: "blue" }]}
      />
      <SimpleGrid cols={5} mt="md">
        {stats.map((stat) => (
          <div key={stat.label}>
            <Text size="sm" c="dimmed">{stat.label}</Text>
            <Text size="xl" fw={700}>{stat.value.toFixed(2)}</Text>
          </div>
        ))}
      </SimpleGrid>
    </Card>
  );
}
