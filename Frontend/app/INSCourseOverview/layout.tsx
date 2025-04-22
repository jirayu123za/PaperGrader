import LeftOverview from '@/components/LeftINS/LeftOverview';

export default function ProcessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <LeftOverview />
      <main className="grow">{children}</main>
    </div>
  );
}