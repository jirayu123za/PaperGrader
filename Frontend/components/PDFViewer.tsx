import React, { useRef, useEffect } from 'react';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { scrollModePlugin } from '@react-pdf-viewer/scroll-mode';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import { Container, Group } from '@mantine/core';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useForm } from '@mantine/form';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PDFViewerProps {
  fileUrl: string;
  boundingBoxes: BoundingBox[];
  updateBoundingBox: (index: number, newBox: BoundingBox) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, boundingBoxes, updateBoundingBox }) => {
  const scrollModePluginInstance = scrollModePlugin();
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  const transformerRef = useRef<any>(null);
  const stageRef = useRef<any>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm({
    initialValues: {
      scrollOffset: { top: 0, left: 0 },
      selectedShapeIndex: null as number | null,
      scaleFactor: 1, // Scale factor จาก PDF zoom
    },
  });

  // Sync Scale Factor เมื่อมีการ Zoom
  const handleZoom = (zoom: any) => {
    form.setFieldValue('scaleFactor', zoom.scale);
  };

  // Update Scroll Offset
  const handleScroll = () => {
    if (viewerContainerRef.current) {
      const { scrollTop, scrollLeft } = viewerContainerRef.current;
      form.setFieldValue('scrollOffset', { top: scrollTop, left: scrollLeft });
    }
  };

  // Handle Dragging
  const handleDragEnd = (index: number, e: any) => {
    updateBoundingBox(index, {
      x: (e.target.x() + form.values.scrollOffset.left) / form.values.scaleFactor,
      y: (e.target.y() + form.values.scrollOffset.top) / form.values.scaleFactor,
      width: boundingBoxes[index].width,
      height: boundingBoxes[index].height,
    });
  };

  const handleTransformEnd = (index: number) => {
    const node = stageRef.current?.findOne(`#box-${index}`);
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    updateBoundingBox(index, {
      x: (node.x() + form.values.scrollOffset.left) / form.values.scaleFactor,
      y: (node.y() + form.values.scrollOffset.top) / form.values.scaleFactor,
      width: (node.width() * scaleX) / form.values.scaleFactor,
      height: (node.height() * scaleY) / form.values.scaleFactor,
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
            defaultScale={SpecialZoomLevel.PageWidth}
            plugins={[scrollModePluginInstance, zoomPluginInstance]}
            onZoom={handleZoom}
          />
        </div>
      </Worker>

      {/* Konva Stage */}
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        x={-form.values.scrollOffset.left * form.values.scaleFactor}
        y={-form.values.scrollOffset.top * form.values.scaleFactor}
        scaleX={form.values.scaleFactor}
        scaleY={form.values.scaleFactor}
        ref={stageRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
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
              x={box.x * form.values.scaleFactor}
              y={box.y * form.values.scaleFactor}
              width={box.width * form.values.scaleFactor}
              height={box.height * form.values.scaleFactor}
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
                ? (() => {
                  const selectedNode = stageRef.current?.findOne(`#box-${form.values.selectedShapeIndex}`);
                  return selectedNode ? [selectedNode] : []; 
                })()
                : []
            }
            rotateEnabled={false}
          />

        </Layer>
      </Stage>

      {/* Zoom Controls */}
      <Group
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '10%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '12px',
        }}
      >
        <ZoomOutButton />
        <ZoomInButton />
      </Group>
    </Container>
  );
};

export default PDFViewer;
