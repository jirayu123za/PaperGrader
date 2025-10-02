

export default function Statisticslayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col flex-1 px-6">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
