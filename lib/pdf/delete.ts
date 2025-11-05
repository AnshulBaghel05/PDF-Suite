import { PDFDocument } from 'pdf-lib';

export async function deletePages(file: File, pagesToDelete: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  // Validate page numbers
  for (const pageNum of pagesToDelete) {
    if (pageNum < 1 || pageNum > totalPages) {
      throw new Error(`Invalid page number: ${pageNum}. PDF has ${totalPages} pages.`);
    }
  }

  // Remove pages in reverse order to maintain correct indices
  const sortedPages = [...pagesToDelete].sort((a, b) => b - a);
  sortedPages.forEach(pageNum => {
    pdfDoc.removePage(pageNum - 1); // Convert to 0-based index
  });

  return await pdfDoc.save();
}
