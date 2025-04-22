"use client";

import * as pdfjsLib from "pdfjs-dist";
import React, { useEffect, useRef } from "react";
import { Container, Box } from "@mantine/core";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface PdfPreviewProps {
  submissionBoxesURL: string[];
}

const SubmissionBoxes: React.FC<PdfPreviewProps> = ({ submissionBoxesURL }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderTasks: any[] = [];

    const renderAll = async () => {
      if (!containerRef.current) return;

      containerRef.current.innerHTML = "";

      for (let index = 0; index < submissionBoxesURL.length; index++) {
        const url = submissionBoxesURL[index];
        if (!url) continue;

        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);

          const scale = 1;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          containerRef.current.appendChild(canvas);

          const renderTask = page.render({
            canvasContext: context,
            viewport,
          });

          renderTasks.push(renderTask);
          await renderTask.promise;
        } catch (err) {
          console.error(`❌ PDF Render Error at index ${index}:`, err);
        }
      }
    };

    renderAll();

    return () => {
      renderTasks.forEach((task) => task?.cancel?.());
    };
  }, [submissionBoxesURL]);

  return (
    <Container>
      <Box
        ref={containerRef}
        style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start"
          }}
      />
    </Container>
  );
};

export default SubmissionBoxes;
