import { createWorker, Worker } from 'tesseract.js';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface OCRResult {
  text: string;
  pageNumber: number;
  confidence: number;
}

export async function performOCR(
  file: File,
  language: string = 'eng',
  onProgress?: (progress: number) => void
): Promise<OCRResult[]> {
  const results: OCRResult[] = [];

  // Check if file is PDF or image
  const fileType = file.type;
  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf';

  if (!isImage && !isPDF) {
    throw new Error('File must be a PDF or image (PNG, JPG, JPEG)');
  }

  // Initialize Tesseract worker
  const worker = await createWorker(language, 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  try {
    if (isImage) {
      // Process single image
      const imageUrl = URL.createObjectURL(file);
      const result = await worker.recognize(imageUrl);
      URL.revokeObjectURL(imageUrl);

      results.push({
        text: result.data.text,
        pageNumber: 1,
        confidence: result.data.confidence,
      });
    } else if (isPDF) {
      // Process PDF pages
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });

        // Perform OCR on page
        const imageUrl = URL.createObjectURL(blob);
        const result = await worker.recognize(imageUrl);
        URL.revokeObjectURL(imageUrl);

        results.push({
          text: result.data.text,
          pageNumber: pageNum,
          confidence: result.data.confidence,
        });

        if (onProgress) {
          onProgress(Math.round((pageNum / numPages) * 100));
        }
      }
    }
  } finally {
    await worker.terminate();
  }

  return results;
}

export async function createSearchablePDF(
  file: File,
  ocrResults: OCRResult[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  // Add invisible text layer to each page
  for (const result of ocrResults) {
    const pageIndex = result.pageNumber - 1;
    if (pageIndex >= 0 && pageIndex < pages.length) {
      const page = pages[pageIndex];
      const { width, height } = page.getSize();

      // Add text at bottom of page (invisible)
      page.drawText(result.text, {
        x: 0,
        y: 0,
        size: 0.1, // Very small size
        color: rgb(1, 1, 1), // White text (invisible on white background)
        opacity: 0.01,
      });
    }
  }

  return await pdfDoc.save();
}

export function formatOCRResults(results: OCRResult[]): string {
  return results
    .map(
      (result) =>
        `=== Page ${result.pageNumber} (Confidence: ${result.confidence.toFixed(2)}%) ===\n${result.text}\n`
    )
    .join('\n');
}
