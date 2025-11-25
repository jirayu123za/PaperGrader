import LeftMain from '@/components/LeftINS/LeftMain';

export default function StatisticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <LeftMain />
      <div className="flex flex-col flex-1 px-6">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
