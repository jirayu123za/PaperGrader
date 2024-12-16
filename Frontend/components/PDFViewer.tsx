import React, { useRef, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { scrollModePlugin } from '@react-pdf-viewer/scroll-mode';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import { Container, Group } from '@mantine/core';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useForm } from '@mantine/form';

interface PDFViewerProps {
  fileUrl: string;
  boundingBoxes: any[];
  updateBoundingBox: (index: number, newBox: any) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, boundingBoxes, updateBoundingBox }) => {
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const scrollModePluginInstance = scrollModePlugin();
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  const transformerRef = useRef<any>(null);
  const stageRef = useRef<any>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm({
    initialValues: {
      scrollOffset: { top: 0, left: 0 },
      viewerBounds: { width: 0, height: 0 },
      selectedShapeIndex: null as number | null,
    },
  });

  useEffect(() => {
    if (viewerContainerRef.current) {
      const { width, height } = viewerContainerRef.current.getBoundingClientRect();
      form.setFieldValue('viewerBounds', { width, height });
    }
  }, [fileUrl]);

  const handleScroll = () => {
    if (viewerContainerRef.current) {
      const { scrollTop, scrollLeft } = viewerContainerRef.current;
      form.setFieldValue('scrollOffset', { top: scrollTop, left: scrollLeft });
    }
  };

  const handleDragEnd = (index: number, e: any) => {
    updateBoundingBox(index, {
      ...boundingBoxes[index],
      x: e.target.x() + form.values.scrollOffset.left,
      y: e.target.y() + form.values.scrollOffset.top,
    });
  };

  const handleTransformEnd = (index: number) => {
    const node = stageRef.current?.findOne(`#box-${index}`);
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    updateBoundingBox(index, {
      ...boundingBoxes[index],
      x: node.x() + form.values.scrollOffset.left,
      y: node.y() + form.values.scrollOffset.top,
      width: node.width() * scaleX,
      height: node.height() * scaleY,
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <Container style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* PDF Viewer */}
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
        <div
          ref={viewerContainerRef}
          style={{ height: '100%', overflow: 'auto', position: 'relative' }}
          onScroll={handleScroll}
        >
          <Viewer
            fileUrl={fileUrl}
            plugins={[pageNavigationPluginInstance, scrollModePluginInstance, zoomPluginInstance]}
          />
        </div>
      </Worker>

      {/* Konva Stage */}
      <Stage
        width={form.values.viewerBounds.width}
        height={form.values.viewerBounds.height}
        x={-form.values.scrollOffset.left}
        y={-form.values.scrollOffset.top}
        style={{ position: 'absolute', top: 0, left: 0 }}
        ref={stageRef}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            form.setFieldValue('selectedShapeIndex', null);
          }
        }}
      >
        <Layer>
          {boundingBoxes.map((box, index) => (
            <Rect
              key={index}
              id={`box-${index}`}
              x={box.x - form.values.scrollOffset.left}
              y={box.y - form.values.scrollOffset.top}
              width={box.width}
              height={box.height}
              fill="rgba(0, 0, 255, 0.2)"
              stroke="blue"
              strokeWidth={2}
              draggable
              onDragEnd={(e) => handleDragEnd(index, e)}
              onTransformEnd={() => handleTransformEnd(index)}
              onClick={() => form.setFieldValue('selectedShapeIndex', index)}
            />
          ))}
          <Transformer
            ref={transformerRef}
            nodes={
              form.values.selectedShapeIndex !== null
                ? [stageRef.current?.findOne(`#box-${form.values.selectedShapeIndex}`)]
                : []
            }
            rotateEnabled={false}
          />
        </Layer>
      </Stage>

      {/* Zoom Controls */}
      <Group
        align="center"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '10%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        }}
      >
        <ZoomOutButton />
        <ZoomInButton />
      </Group>
    </Container>
  );
};

export default PDFViewer;
