import { PDFDocument, rgb } from 'pdf-lib';

export async function addPageNumbers(
  file: File,
  options: { position?: 'bottom' | 'top'; fontSize?: number } = {}
): Promise<Uint8Array> {
  const { position = 'bottom', fontSize = 12 } = options;

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNumber = `${index + 1}`;

    const y = position === 'bottom' ? 30 : height - 30;

    page.drawText(pageNumber, {
      x: width / 2 - 10,
      y,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
  });

  return await pdfDoc.save();
}
