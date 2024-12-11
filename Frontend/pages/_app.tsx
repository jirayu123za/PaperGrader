import '../styles/globals.css'; 
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals'; 
import { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useSelectSectionStore } from '../store/useSectionStore';
import { useEffect } from 'react';
import { useRouter } from 'next/router';


const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const resetSelectedSections = useSelectSectionStore(
    (state) => state.resetSelectedSections
  );

  useEffect(() => {
    // ฟังก์ชันที่เรียกเมื่อ route เปลี่ยน
    const handleRouteChange = () => {
      resetSelectedSections(); // รีเซ็ต selectedSections เมื่อเปลี่ยน route
    };

    // Subscribe การเปลี่ยน route
    router.events.on('routeChangeStart', handleRouteChange);

    // Cleanup listener เมื่อ component ถูก unmount
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [resetSelectedSections, router.events]);

  return (
    <>
      <Head>
        {/* <html lang="en" /> */}
        <title>PaperGrader</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <QueryClientProvider client={queryClient}>
      <MantineProvider theme={{}}>
        <ModalsProvider> 
          <Component {...pageProps} />
          <ReactQueryDevtools initialIsOpen={false} />
        </ModalsProvider>
      </MantineProvider>
      </QueryClientProvider>
    </>
  );
}