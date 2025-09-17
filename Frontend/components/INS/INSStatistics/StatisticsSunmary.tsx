"use client";
import { Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import AssignmentStatistics from "./AssignmentStatistics";
import { RubricTable, type RubricItem } from "./RubricTable";

/** ตัวช่วยสร้างเลขสุ่มแบบกำหนด seed ง่าย ๆ เพื่อสร้าง mock scores ที่คงที่สำหรับแต่ละ assignment */
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

/** Mock: rubric ของแต่ละ assignment (แยกชุดกันชัดเจน) */
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

/** Mock ข้อมูล assignment 2 อัน (scores + rubric แยกกัน) */
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
    initialValues: { assignmentId: ASSIGNMENTS[0].id },
  });

  const current = ASSIGNMENTS.find((a) => a.id === form.values.assignmentId)!;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* ส่วนบน: กราฟ + selector ใส่เข้าไปในหัวข้อของกราฟ */}
      <div className="shrink-0">
        <AssignmentStatistics
          scores={current.scores}
          assignmentSelector={
            <Select
              data={ASSIGNMENTS.map((a) => ({ value: a.id, label: a.label }))}
              value={form.values.assignmentId}
              // ✅ ให้ฟังก์ชันคืนค่า void แน่นอน
              onChange={(v) => {
                if (v) form.setFieldValue("assignmentId", v);
              }}
              checkIconPosition="right"
              size="sm"
              // ✅ Mantine v7 ใช้ comboboxProps แทน withinPortal
              comboboxProps={{ withinPortal: true }}
              // ถ้า TS บ่นเรื่อง w ให้เปลี่ยนเป็น style={{ width: 280 }}
              w={280}
              placeholder="Select assignment"
            />
          }
        />
      </div>

      {/* ส่วนล่าง: ตาราง rubric แยกตาม assignment */}
      <div className="flex-1 min-h-0">
        <RubricTable data={current.rubric} />
      </div>
    </div>
  );
}
