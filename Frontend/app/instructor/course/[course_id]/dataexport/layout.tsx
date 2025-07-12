import LeftMain from '@/components/LeftINS/LeftMain';

export default function ProcessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <LeftMain />
      <main className="grow">{children}</main>
    </div>
  );
}