import { PDFDocument } from 'pdf-lib';

export async function extractPages(file: File, pagesToExtract: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  // Validate page numbers
  for (const pageNum of pagesToExtract) {
    if (pageNum < 1 || pageNum > totalPages) {
      throw new Error(`Invalid page number: ${pageNum}. PDF has ${totalPages} pages.`);
    }
  }

  const newPdf = await PDFDocument.create();
  const pageIndices = pagesToExtract.map(n => n - 1); // Convert to 0-based

  const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}
