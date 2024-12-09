import { Worker, Viewer } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { scrollModePlugin } from '@react-pdf-viewer/scroll-mode';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import { Button, Container, Group, Stack } from '@mantine/core';

interface PDFViewerProps {
  fileUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const scrollModePluginInstance = scrollModePlugin();
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  return (
    <Container style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
        <Stack style={{ height: '100%', width: '100%' }}>
          <Viewer
            fileUrl={fileUrl}
            plugins={[pageNavigationPluginInstance, scrollModePluginInstance, zoomPluginInstance]}
          />
        </Stack>
      </Worker>

      {/* Floating Controls */}
      <Group
        align="center"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '-25%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Button
          size="sm"
          variant="outline"
          color="blue"
          onClick={() => pageNavigationPluginInstance.jumpToPreviousPage()}
        >
          {'<'} Previous
        </Button>
        <ZoomOutButton/>
        <ZoomInButton/>
        <Button
          size="sm"
          variant="outline"
          color="blue"
          onClick={() => pageNavigationPluginInstance.jumpToNextPage()}
        >
          Next {'>'}
        </Button>
      </Group>
    </Container>
  );
};

export default PDFViewer;
