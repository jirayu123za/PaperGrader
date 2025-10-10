"use client";
import { Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import AssignmentStatistics from "./AssignmentStatistics";
import { RubricTable, type RubricItem } from "./RubricTable";
import StatisticHeader from "../Header/StatisticHeader";

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
      {/* ✅ ย้ายหัวข้อ + สอง Select มาไว้ในคอมโพเนนต์ใหม่ */}
      <StatisticHeader title="Assignment Statistics" />

      <div className="shrink-0">
        <AssignmentStatistics
          scores={current.scores}
          assignmentName={current.label}
          initialChartHeight={220}
          initialBinCount={20}
          compact
        />
      </div>

      <div className="flex-1 min-h-0">
        <RubricTable data={current.rubric} />
      </div>
    </Stack>
  );
}
