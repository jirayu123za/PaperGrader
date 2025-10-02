"use client";
import { Select, Title, Flex, Stack, Card } from "@mantine/core";
import { useForm } from "@mantine/form";
import AssignmentStatistics from "./AssignmentStatistics";
import { RubricTable, type RubricItem } from "./RubricTable";

/** simple seeded rng */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return Math.floor((s / 0xffffffff) * 101);
  };
}
function generateScores(seed: number, n = 60) {
  const rand = lcg(seed);
  return Array.from({ length: n }, () => rand());
}

const RUBRIC_A1: RubricItem[] = [
  { id: "1", question: "Explain React components", points: 2 },
  {
    id: "2",
    question: "State & Props fundamentals",
    points: 3,
    subRows: [
      { id: "2.1", question: "Define state vs props", points: 1 },
      { id: "2.2", question: "Example: lifting state up", points: 1 },
    ],
  },
  { id: "3", question: "JSX & rendering rules", points: 2 },
  {
    id: "4",
    question: "Lifecycle & Hooks overview",
    points: 3,
    subRows: [
      { id: "4.1", question: "useEffect basics", points: 1 },
      { id: "4.2", question: "useMemo / useCallback", points: 1 },
    ],
  },
  { id: "5", question: "Accessibility basics", points: 2 },
];

const RUBRIC_A2: RubricItem[] = [
  { id: "1", question: "Explain async/await", points: 2 },
  {
    id: "2",
    question: "Promises and error handling",
    points: 3,
    subRows: [
      { id: "2.1", question: "Promise chaining", points: 1 },
      { id: "2.2", question: "Try/catch with async", points: 1 },
    ],
  },
  { id: "3", question: "HTTP & fetch patterns", points: 2 },
  {
    id: "4",
    question: "Caching & invalidation basics",
    points: 3,
    subRows: [
      { id: "4.1", question: "Stale-while-revalidate", points: 1 },
      { id: "4.2", question: "Cache keys design", points: 1 },
    ],
  },
  { id: "5", question: "Testing fundamentals", points: 2 },
];

const ASSIGNMENTS = [
  {
    id: "a1",
    label: "Assignment 1 — React Basics",
    scores: generateScores(12345, 60),
    rubric: RUBRIC_A1,
  },
  {
    id: "a2",
    label: "Assignment 2 — Async & Data",
    scores: generateScores(67890, 60),
    rubric: RUBRIC_A2,
  },
];

// ตัวอย่างรายการ Section (mock) — ภายหลังสามารถผูกกับ store/hook จริงได้เลย
const SECTIONS = [
  { value: "all", label: "All sections" },
  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
  { value: "C", label: "Section C" },
];

export default function ReviewSummary() {
  const form = useForm({
    initialValues: {
      assignmentId: ASSIGNMENTS[0].id,
      sectionId: "all",
    },
  });

  const current = ASSIGNMENTS.find((a) => a.id === form.values.assignmentId)!;

  return (
    <Stack gap="sm" className="h-[calc(100vh-80px)]">
      {/* ===== ส่วนบนสุด: Title + Selectors (Assignment + Section) ===== */}
      <Card withBorder padding="sm" radius="md">
        <Flex justify="space-between" align="center" gap="md" wrap="wrap">
          <Title order={3}>Assignment Statistics</Title>

          <Flex gap="sm" wrap="wrap">
            {/* เลือก Assignment */}
            <Select
              data={ASSIGNMENTS.map((a) => ({ value: a.id, label: a.label }))}
              value={form.values.assignmentId}
              onChange={(v) => v && form.setFieldValue("assignmentId", v)}
              checkIconPosition="right"
              size="sm"
              comboboxProps={{ withinPortal: true }}
              style={{ width: 320 }}
              placeholder="Select assignment"
              aria-label="Select assignment"
            />

            {/* เลือก Section (ไม่ใช้ SectionSelector component) */}
            <Select
              data={SECTIONS}
              value={form.values.sectionId}
              onChange={(v) => v && form.setFieldValue("sectionId", v)}
              checkIconPosition="right"
              size="sm"
              comboboxProps={{ withinPortal: true }}
              style={{ width: 220 }}
              placeholder="Select section"
              aria-label="Select section"
            />
          </Flex>
        </Flex>
      </Card>

      {/* ===== กราฟ: Review Grades for {assignmentName} ===== */}
      <div className="shrink-0">
        <AssignmentStatistics
          scores={current.scores}
          assignmentName={current.label}  // ถ้าต้องการต่อท้ายชื่อ section ค่อยปรับตรงนี้ได้
          initialChartHeight={220}
          initialBinCount={20}
          compact
        />
      </div>

      {/* ===== ตาราง rubric ===== */}
      <div className="flex-1 min-h-0">
        <RubricTable data={current.rubric} />
      </div>
    </Stack>
  );
}
