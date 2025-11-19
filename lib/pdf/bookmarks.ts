import { PDFDocument, PDFName, PDFArray, PDFDict, PDFRef } from 'pdf-lib';

export interface Bookmark {
  title: string;
  pageNumber: number;
  level: number;
}

export async function addBookmarksToPDF(
  file: File,
  bookmarks: Bookmark[]
): Promise<Uint8Array> {
  if (bookmarks.length === 0) {
    throw new Error('At least one bookmark is required');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  // Validate page numbers
  for (const bookmark of bookmarks) {
    if (bookmark.pageNumber < 1 || bookmark.pageNumber > pages.length) {
      throw new Error(
        `Invalid page number ${bookmark.pageNumber}. PDF has ${pages.length} pages.`
      );
    }
  }

  // Create outline dictionary (bookmarks structure)
  const outlineDict = PDFDict.withContext(pdfDoc.context);
  outlineDict.set(PDFName.of('Type'), PDFName.of('Outlines'));
  const outlineRef = pdfDoc.context.register(outlineDict);

  const outlineItems: PDFRef[] = [];

  // Create bookmark entries
  for (let i = 0; i < bookmarks.length; i++) {
    const bookmark = bookmarks[i];
    const page = pages[bookmark.pageNumber - 1];
    const pageRef = page.ref;

    // Create destination array [page /XYZ left top zoom]
    const destArray = PDFArray.withContext(pdfDoc.context);
    destArray.push(pageRef);
    destArray.push(PDFName.of('XYZ'));
    destArray.push(pdfDoc.context.obj(0));
    destArray.push(pdfDoc.context.obj(page.getHeight()));
    destArray.push(pdfDoc.context.obj(0));

    // Create outline item
    const itemDict = PDFDict.withContext(pdfDoc.context);
    itemDict.set(PDFName.of('Title'), pdfDoc.context.obj(bookmark.title));
    itemDict.set(PDFName.of('Parent'), outlineRef);
    itemDict.set(PDFName.of('Dest'), destArray);

    const itemRef = pdfDoc.context.register(itemDict);

    // Add Prev/Next references
    if (i > 0) {
      itemDict.set(PDFName.of('Prev'), outlineItems[i - 1]);
      const prevDict = pdfDoc.context.lookup(outlineItems[i - 1]) as PDFDict;
      prevDict.set(PDFName.of('Next'), itemRef);
    }

    outlineItems.push(itemRef);
  }

  // Set First and Last in outline dictionary
  if (outlineItems.length > 0) {
    outlineDict.set(PDFName.of('First'), outlineItems[0]);
    outlineDict.set(PDFName.of('Last'), outlineItems[outlineItems.length - 1]);
    outlineDict.set(PDFName.of('Count'), pdfDoc.context.obj(outlineItems.length));
  }

  // Add Outlines to catalog
  const catalog = pdfDoc.catalog;
  catalog.set(PDFName.of('Outlines'), outlineRef);

  return await pdfDoc.save();
}

export async function extractBookmarks(file: File): Promise<Bookmark[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const bookmarks: Bookmark[] = [];

  try {
    const catalog = pdfDoc.catalog;
    const outlinesRef = catalog.lookup(PDFName.of('Outlines'));

    if (!outlinesRef) {
      return bookmarks; // No bookmarks in PDF
    }

    const outlines = pdfDoc.context.lookup(outlinesRef as PDFRef) as PDFDict;
    const firstRef = outlines.get(PDFName.of('First')) as PDFRef;

    if (!firstRef) {
      return bookmarks;
    }

    // Traverse bookmark tree
    let currentRef: PDFRef | undefined = firstRef;
    let index = 0;

    while (currentRef && index < 100) {
      // Safety limit
      const item = pdfDoc.context.lookup(currentRef) as PDFDict;
      const title = item.lookup(PDFName.of('Title'))?.toString() || `Bookmark ${index + 1}`;
      const dest = item.lookup(PDFName.of('Dest'));

      let pageNumber = 1;
      if (dest && dest instanceof PDFArray) {
        const pageRef = dest.get(0) as PDFRef;
        const pages = pdfDoc.getPages();
        pageNumber =
          pages.findIndex((p) => pdfDoc.context.register(p.node).toString() === pageRef.toString()) +
          1;
      }

      bookmarks.push({
        title: title.replace(/[()]/g, ''),
        pageNumber: pageNumber || 1,
        level: 0,
      });

      const nextRef = item.get(PDFName.of('Next')) as PDFRef | undefined;
      currentRef = nextRef;
      index++;
    }
  } catch (error) {
    console.error('Error extracting bookmarks:', error);
  }

  return bookmarks;
}
