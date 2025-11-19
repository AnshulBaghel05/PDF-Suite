import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// Set worker source for PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export interface TableCell {
  value: string;
  row: number;
  col: number;
}

export interface ExtractedTable {
  pageNumber: number;
  rows: string[][];
}

export async function convertPDFToExcel(
  file: File,
  options?: {
    detectTables?: boolean;
    includeAllPages?: boolean;
    selectedPages?: number[];
  }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const workbook = XLSX.utils.book_new();
  const pagesToProcess = options?.selectedPages || Array.from({ length: numPages }, (_, i) => i + 1);

  for (const pageNum of pagesToProcess) {
    if (pageNum < 1 || pageNum > numPages) continue;

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Extract text items with positions
    const items = textContent.items as any[];

    if (options?.detectTables) {
      // Try to detect table structure based on text positions
      const table = detectTableStructure(items);
      const worksheet = XLSX.utils.aoa_to_sheet(table.rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${pageNum}`);
    } else {
      // Simple text extraction - organize by lines
      const lines = organizeTextIntoLines(items);
      const worksheet = XLSX.utils.aoa_to_sheet(lines);
      XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${pageNum}`);
    }
  }

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  return new Uint8Array(excelBuffer);
}

function detectTableStructure(items: any[]): ExtractedTable {
  // Group items by vertical position (rows)
  const rowMap = new Map<number, any[]>();

  items.forEach((item) => {
    if (!item.str.trim()) return;

    const y = Math.round(item.transform[5]); // Y position
    if (!rowMap.has(y)) {
      rowMap.set(y, []);
    }
    rowMap.get(y)!.push(item);
  });

  // Sort rows by Y position (descending, as PDF coordinates start from bottom)
  const sortedRows = Array.from(rowMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([_, items]) => items.sort((a, b) => a.transform[4] - b.transform[4])); // Sort items in row by X

  // Convert to string matrix
  const rows: string[][] = [];

  sortedRows.forEach((rowItems) => {
    // Group items that are close together horizontally
    const cells: string[] = [];
    let currentCell = '';
    let lastX = -1;

    rowItems.forEach((item, idx) => {
      const x = item.transform[4];
      const text = item.str.trim();

      // If significant horizontal gap, start new cell
      if (lastX !== -1 && x - lastX > 30) {
        if (currentCell) cells.push(currentCell);
        currentCell = text;
      } else {
        currentCell += (currentCell ? ' ' : '') + text;
      }

      lastX = x + (item.width || 0);

      // Last item in row
      if (idx === rowItems.length - 1) {
        if (currentCell) cells.push(currentCell);
      }
    });

    if (cells.length > 0) {
      rows.push(cells);
    }
  });

  return {
    pageNumber: 1,
    rows,
  };
}

function organizeTextIntoLines(items: any[]): string[][] {
  // Group by Y position (lines)
  const lineMap = new Map<number, any[]>();
  const threshold = 5; // Pixels tolerance for same line

  items.forEach((item) => {
    if (!item.str.trim()) return;

    const y = Math.round(item.transform[5] / threshold) * threshold;
    if (!lineMap.has(y)) {
      lineMap.set(y, []);
    }
    lineMap.get(y)!.push(item);
  });

  // Sort lines by Y position and convert to text
  const lines = Array.from(lineMap.entries())
    .sort((a, b) => b[0] - a[0]) // Top to bottom
    .map(([_, items]) => {
      // Sort items in line by X position
      const sortedItems = items.sort((a, b) => a.transform[4] - b.transform[4]);
      const lineText = sortedItems.map((item) => item.str).join(' ');
      return [lineText]; // Each line as a single cell
    });

  return lines;
}

export async function extractTablesFromPDF(file: File): Promise<ExtractedTable[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const tables: ExtractedTable[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    const table = detectTableStructure(items);
    table.pageNumber = pageNum;
    tables.push(table);
  }

  return tables;
}

export function createExcelFromTables(tables: ExtractedTable[]): Uint8Array {
  const workbook = XLSX.utils.book_new();

  tables.forEach((table) => {
    const worksheet = XLSX.utils.aoa_to_sheet(table.rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${table.pageNumber}`);
  });

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  return new Uint8Array(excelBuffer);
}
