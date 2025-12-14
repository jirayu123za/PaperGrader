import HeaderCourse from '@/components/INS/Header/HeaderCourse';
import { LeftMain } from '@/components/LeftINS/LeftMain';

export default function ProcessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <LeftMain />
      <div className="flex flex-col flex-1 px-6">
        <HeaderCourse />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
