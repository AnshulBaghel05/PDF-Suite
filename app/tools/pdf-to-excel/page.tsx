'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { convertPDFToExcel, extractTablesFromPDF } from '@/lib/pdf/pdfToExcel';
import { Download, Loader2, CheckCircle, Table, FileSpreadsheet } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function PDFToExcelContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [detectTables, setDetectTables] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [excelData, setExcelData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string>('');
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState<string>('all');
  const [pageRange, setPageRange] = useState('');

  if (!profile) {
    return (
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setDownloadReady(false);
    setError('');

    // Get page count
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfjsLib = await import('pdfjs-dist');
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);
    } catch (err) {
      console.error('Error reading PDF:', err);
    }
  };

  const parsePageRange = (range: string, total: number): number[] => {
    const pages: number[] = [];
    const parts = range.split(',');

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map((s) => parseInt(s.trim()));
        if (isNaN(start) || isNaN(end)) continue;
        for (let i = Math.max(1, start); i <= Math.min(total, end); i++) {
          if (!pages.includes(i)) pages.push(i);
        }
      } else {
        const page = parseInt(part.trim());
        if (!isNaN(page) && page >= 1 && page <= total && !pages.includes(page)) {
          pages.push(page);
        }
      }
    }

    return pages.sort((a, b) => a - b);
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    const fileSizeCheck = checkFileSize(file.size);
    if (!fileSizeCheck.allowed) {
      setError(fileSizeCheck.reason || 'File size exceeds plan limit');
      return;
    }

    // Parse page range if specified
    let pagesToProcess: number[] | undefined;
    if (selectedPages === 'range') {
      if (!pageRange.trim()) {
        setError('Please enter a page range (e.g., 1-3, 5, 7-9)');
        return;
      }
      pagesToProcess = parsePageRange(pageRange, totalPages);
      if (pagesToProcess.length === 0) {
        setError('Invalid page range. Please check your input.');
        return;
      }
    }

    setProcessing(true);
    setError('');

    try {
      await processTool('pdf-to-excel', 'PDF to Excel', [file], async () => {
        const options = {
          detectTables,
          includeAllPages: selectedPages === 'all',
          selectedPages: pagesToProcess,
        };

        const excel = await convertPDFToExcel(file, options);
        setExcelData(excel);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to convert PDF to Excel');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (excelData) {
      const blob = new Blob([excelData as any], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'converted.xlsx');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">PDF to Excel</h1>
          <p className="text-xl text-gray-400">
            Convert PDF tables and text to Excel spreadsheets
          </p>
          {profile && (
            <div className="glass rounded-lg px-4 py-2 inline-block">
              <span className="text-sm text-gray-400">Credits Remaining: </span>
              <span className="text-lg font-bold text-primary">{profile.credits_remaining}</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold text-white mb-3">How to use:</h2>
          <ol className="space-y-2 text-gray-400 text-sm">
            <li>1. Upload a PDF file containing tables or text</li>
            <li>2. Choose conversion options (table detection, page range)</li>
            <li>3. Click "Convert to Excel" to process</li>
            <li>4. Download your Excel spreadsheet</li>
          </ol>
        </div>

        {/* File Upload */}
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          multiple={false}
        />

        {/* Conversion Options */}
        {file && !downloadReady && (
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Conversion Options</h3>

            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={detectTables}
                  onChange={(e) => setDetectTables(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-700 bg-black/30 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <div>
                  <div className="text-white text-sm font-medium">Detect Tables</div>
                  <div className="text-gray-400 text-xs">
                    Automatically identify and structure tables (recommended)
                  </div>
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Pages to Convert</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="pages"
                    value="all"
                    checked={selectedPages === 'all'}
                    onChange={(e) => setSelectedPages(e.target.value)}
                    className="w-4 h-4 border-gray-700 bg-black/30 text-primary focus:ring-primary"
                  />
                  <span className="text-white text-sm">
                    All Pages {totalPages > 0 && `(${totalPages} pages)`}
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="pages"
                    value="range"
                    checked={selectedPages === 'range'}
                    onChange={(e) => setSelectedPages(e.target.value)}
                    className="w-4 h-4 border-gray-700 bg-black/30 text-primary focus:ring-primary"
                  />
                  <span className="text-white text-sm">Specific Pages</span>
                </label>
              </div>

              {selectedPages === 'range' && (
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g., 1-3, 5, 7-9"
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                />
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        {file && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!downloadReady ? (
              <button
                onClick={handleProcess}
                disabled={!file || processing}
                className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-5 h-5" />
                    <span>Convert to Excel</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center justify-center space-x-2 glow-red"
              >
                <Download className="w-5 h-5" />
                <span>Download Excel File</span>
              </button>
            )}
          </div>
        )}

        {/* Success Message */}
        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>PDF converted to Excel successfully!</span>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Smart</div>
            <div className="text-sm text-gray-400">Table detection</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Flexible</div>
            <div className="text-sm text-gray-400">Custom page ranges</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Accurate</div>
            <div className="text-sm text-gray-400">Preserves structure</div>
          </div>
        </div>

        {/* Info Box */}
        <div className="glass border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Table className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-white font-medium text-sm">Best Results Tips</h4>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• Works best with PDFs containing structured tables</li>
                <li>• Enable "Detect Tables" for automatic table recognition</li>
                <li>• Each PDF page will be converted to a separate Excel sheet</li>
                <li>• Text-based PDFs work better than scanned images</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PDFToExcelPage() {
  return (
    <ProtectedTool toolId="pdf-to-excel" toolName="PDF to Excel">
      <PDFToExcelContent />
    </ProtectedTool>
  );
}
