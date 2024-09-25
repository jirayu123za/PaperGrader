import '../styles/globals.css'; 
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals'; 
import { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <html lang="en" />
        <title>PaperGrader</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <QueryClientProvider client={queryClient}>
      <MantineProvider theme={{}}>
        <ModalsProvider> 
          <Component {...pageProps} />
        </ModalsProvider>
      </MantineProvider>
      </QueryClientProvider>
    </>
  );
}
