"use client";

import { ReactNode } from "react";
import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const colorSchemeManager = localStorageColorSchemeManager({
  key: "mantine-color-scheme"
});

const queryClient = new QueryClient();

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        colorSchemeManager={colorSchemeManager}
      >
        <ModalsProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
