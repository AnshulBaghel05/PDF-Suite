import { PDFDocument } from 'pdf-lib';

export async function compressPDF(file: File, quality: 'low' | 'medium' | 'high' = 'medium'): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Compression settings based on quality
  const compressionOptions = {
    low: { objectsPerTick: 50 },
    medium: { objectsPerTick: 100 },
    high: { objectsPerTick: 200 },
  };

  // Save with compression
  return await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    ...compressionOptions[quality],
  });
}
