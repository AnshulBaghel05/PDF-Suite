import { PDFDocument, rgb, degrees } from 'pdf-lib';

export async function addWatermark(
  file: File,
  text: string,
  options: { opacity?: number; rotation?: number; fontSize?: number } = {}
): Promise<Uint8Array> {
  const { opacity = 0.3, rotation = 45, fontSize = 50 } = options;

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach(page => {
    const { width, height } = page.getSize();

    page.drawText(text, {
      x: width / 2 - (text.length * fontSize) / 4,
      y: height / 2,
      size: fontSize,
      opacity,
      rotate: degrees(rotation),
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  return await pdfDoc.save();
}
