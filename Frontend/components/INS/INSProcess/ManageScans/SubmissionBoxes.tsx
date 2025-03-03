import * as pdfjsLib from 'pdfjs-dist';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Container, Flex, Loader, Box } from "@mantine/core";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface PdfPreviewProps {
  submissionBoxesURL: string[];
}

const SubmissionBoxes: React.FC<PdfPreviewProps> = ({ submissionBoxesURL }) => {
    const canvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
    const renderTaskRefs = useRef<any[]>([]);
    const loadingTaskRefs = useRef<any[]>([]);
    const [canvasSizes, setCanvasSizes] = useState<{ width: number; height: number }[]>([]);

    useEffect(() => {
        submissionBoxesURL.forEach((url, index) => {
            if (!url) return;
    
            const renderPDF = async () => {
            try {
                const canvas = canvasRefs.current[index];
                if (!canvas) return;
    
                if (renderTaskRefs.current[index]) {
                renderTaskRefs.current[index].cancel();
                }
                if (loadingTaskRefs.current[index]) {
                loadingTaskRefs.current[index].destroy();
                }
    
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                loadingTaskRefs.current[index] = pdfjsLib.getDocument({ data: arrayBuffer });
    
                const pdf = await loadingTaskRefs.current[index].promise;
                const page = await pdf.getPage(1);
    
                const scale = 1;
                const viewport = page.getViewport({ scale });
    
                const context = canvas.getContext("2d");
                if (!context) return;
    
                canvas.width = viewport.width;
                canvas.height = viewport.height;
    
                setCanvasSizes((prev) => {
                const newSizes = [...prev];
                newSizes[index] = { width: viewport.width, height: viewport.height };
                return newSizes;
                });
    
                renderTaskRefs.current[index] = page.render({
                canvasContext: context,
                viewport,
                });
    
                await renderTaskRefs.current[index].promise;
            } catch (error) {
                console.error(`Error rendering PDF (index ${index}):`, error);
            }
            };
    
            renderPDF();
        });
    
        return () => {
            renderTaskRefs.current.forEach((task) => task?.cancel());
            loadingTaskRefs.current.forEach((task) => task?.destroy());
        };
    }, []);

    return (
        <Container>
            <Box style={{ display: "flex", flexWrap: "wrap" }}>
                {submissionBoxesURL.map((_, index) => (
                    <canvas 
                        key={index}
                        ref={(el) => { if (el) canvasRefs.current[index] = el; }}
                    />
                ))}
            </Box>
        </Container>
    );
};


export default SubmissionBoxes;
