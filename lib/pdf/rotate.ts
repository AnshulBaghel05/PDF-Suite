import { PDFDocument, degrees } from 'pdf-lib';

export async function rotatePDF(
  file: File,
  rotation: 90 | 180 | 270,
  pageIndices?: number[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const pages = pdfDoc.getPages();
  const pagesToRotate = pageIndices ?? pages.map((_, i) => i);

  pagesToRotate.forEach((index) => {
    if (index >= 0 && index < pages.length) {
      const page = pages[index];
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + rotation));
    }
  });

  return await pdfDoc.save();
}
