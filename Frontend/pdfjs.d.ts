declare module 'pdfjs-dist/build/pdf' {
    export interface PDFDocumentProxy {
      getPage: (pageNumber: number) => Promise<PDFPageProxy>;
    }
  
    export interface PDFPageProxy {
      getViewport: (params: { scale: number }) => { width: number; height: number };
      render: (params: { canvasContext: CanvasRenderingContext2D; viewport: any }) => { promise: Promise<void> };
    }
  
    export function getDocument(url: string): { promise: Promise<PDFDocumentProxy> };
  
    const pdfjsLib: {
      getDocument: typeof getDocument;
      GlobalWorkerOptions: { workerSrc: string };
    };
  
    export default pdfjsLib;
  }
  