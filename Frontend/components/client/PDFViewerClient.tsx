'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@mantine/core';

const PDFViewer = dynamic(() => import('../PDFViewer'), {
  ssr: false,
  loading: () => <Loader />,
});

export default function PDFViewerClient() {
  return <PDFViewer/>;
}