import LeftProcess from '@/components/LeftINS/LeftProcess';

export default function ProcessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <LeftProcess />
      <main className="grow">{children}</main>
    </div>
  );
}