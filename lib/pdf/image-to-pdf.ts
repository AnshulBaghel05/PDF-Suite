import { PDFDocument } from 'pdf-lib';

export async function imagesToPDF(images: File[]): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error('No images provided');
  }

  const pdfDoc = await PDFDocument.create();

  for (const image of images) {
    const imageBytes = await image.arrayBuffer();
    const uint8Array = new Uint8Array(imageBytes);

    let embeddedImage;
    const imageType = image.type;

    try {
      if (imageType === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(uint8Array);
      } else if (imageType === 'image/jpeg' || imageType === 'image/jpg') {
        embeddedImage = await pdfDoc.embedJpg(uint8Array);
      } else {
        throw new Error(`Unsupported image type: ${imageType}`);
      }

      const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: embeddedImage.width,
        height: embeddedImage.height,
      });
    } catch (err: any) {
      throw new Error(`Failed to process image ${image.name}: ${err.message}`);
    }
  }

  return await pdfDoc.save();
}
