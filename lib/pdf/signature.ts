import { PDFDocument, rgb, degrees } from 'pdf-lib';

export interface SignatureOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

export async function addSignatureToPDF(
  file: File,
  signatureDataUrl: string,
  options: SignatureOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Convert data URL to image bytes
  const signatureImageBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());

  // Embed the signature image
  let signatureImage;
  try {
    signatureImage = await pdfDoc.embedPng(signatureImageBytes);
  } catch {
    try {
      signatureImage = await pdfDoc.embedJpg(signatureImageBytes);
    } catch (error) {
      throw new Error('Invalid signature image format. Please use PNG or JPG.');
    }
  }

  // Get the page
  const pages = pdfDoc.getPages();
  const pageIndex = options.pageNumber - 1;

  if (pageIndex < 0 || pageIndex >= pages.length) {
    throw new Error(`Invalid page number. PDF has ${pages.length} pages.`);
  }

  const page = pages[pageIndex];
  const pageHeight = page.getHeight();

  // Draw signature on page
  // Note: PDF coordinates start from bottom-left, so we need to convert Y
  page.drawImage(signatureImage, {
    x: options.x,
    y: pageHeight - options.y - options.height, // Convert from top-left to bottom-left origin
    width: options.width,
    height: options.height,
  });

  return await pdfDoc.save();
}

export async function addTextSignature(
  file: File,
  signatureText: string,
  options: SignatureOptions & { fontSize?: number; fontColor?: string }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const pages = pdfDoc.getPages();
  const pageIndex = options.pageNumber - 1;

  if (pageIndex < 0 || pageIndex >= pages.length) {
    throw new Error(`Invalid page number. PDF has ${pages.length} pages.`);
  }

  const page = pages[pageIndex];
  const pageHeight = page.getHeight();

  // Parse color
  const color = options.fontColor || '#000000';
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;

  // Draw text signature
  page.drawText(signatureText, {
    x: options.x,
    y: pageHeight - options.y - (options.fontSize || 24),
    size: options.fontSize || 24,
    color: rgb(r, g, b),
  });

  return await pdfDoc.save();
}

export async function addDateAndSignature(
  file: File,
  signatureDataUrl: string,
  options: SignatureOptions & { includeDate?: boolean; dateFormat?: string }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Embed signature
  const signatureImageBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
  let signatureImage;
  try {
    signatureImage = await pdfDoc.embedPng(signatureImageBytes);
  } catch {
    signatureImage = await pdfDoc.embedJpg(signatureImageBytes);
  }

  const pages = pdfDoc.getPages();
  const pageIndex = options.pageNumber - 1;

  if (pageIndex < 0 || pageIndex >= pages.length) {
    throw new Error(`Invalid page number. PDF has ${pages.length} pages.`);
  }

  const page = pages[pageIndex];
  const pageHeight = page.getHeight();

  // Draw signature
  page.drawImage(signatureImage, {
    x: options.x,
    y: pageHeight - options.y - options.height,
    width: options.width,
    height: options.height,
  });

  // Add date if requested
  if (options.includeDate) {
    const today = new Date();
    const dateStr = options.dateFormat
      ? formatDate(today, options.dateFormat)
      : today.toLocaleDateString();

    page.drawText(`Date: ${dateStr}`, {
      x: options.x,
      y: pageHeight - options.y - options.height - 20,
      size: 10,
      color: rgb(0, 0, 0),
    });
  }

  return await pdfDoc.save();
}

function formatDate(date: Date, format: string): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', String(year))
    .replace('YY', String(year).slice(-2));
}
