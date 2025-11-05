import { PDFDocument } from 'pdf-lib';

export async function splitPDF(file: File, ranges: { start: number; end: number }[]): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  const splitPDFs: Uint8Array[] = [];

  for (const range of ranges) {
    if (range.start < 1 || range.end > totalPages || range.start > range.end) {
      throw new Error(`Invalid range: ${range.start}-${range.end}. PDF has ${totalPages} pages.`);
    }

    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from(
      { length: range.end - range.start + 1 },
      (_, i) => range.start - 1 + i
    );

    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    splitPDFs.push(pdfBytes);
  }

  return splitPDFs;
}

export async function splitIntoSinglePages(file: File): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  const splitPDFs: Uint8Array[] = [];

  for (let i = 0; i < totalPages; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(copiedPage);

    const pdfBytes = await newPdf.save();
    splitPDFs.push(pdfBytes);
  }

  return splitPDFs;
}
