// app/instructor/course/[course_id]/process/[assignment_id]/create-outline/layout.tsx
import Create from '@/components/INS/INSProcess/Right/Create';

export default function CreateOutlineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
      <main className="grow overflow-hidden">{children}</main>
      <Create />
    </div>
  );
}
