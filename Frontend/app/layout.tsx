// app/layout.tsx
import "../styles/globals.css";
import "@mantine/core/styles.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata = {
  title: "PaperGrader",
  description: "A project using Next.js 15 with Tailwind + Mantine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
