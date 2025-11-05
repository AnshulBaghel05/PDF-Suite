'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { PDFDocument } from 'pdf-lib';
import { Download, Loader2, CheckCircle, ArrowUpDown } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function ReorderPagesContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [pageOrder, setPageOrder] = useState<string>('');
  const [error, setError] = useState<string>('');

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

  const handleFileSelected = (selectedFiles: File[]) => {
    setFile(selectedFiles[0] || null);
    setDownloadReady(false);
    setError('');
  };

  const handleReorder = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!pageOrder.trim()) {
      setError('Please specify the new page order');
      return;
    }

    const fileSizeCheck = checkFileSize(file.size);
    if (!fileSizeCheck.allowed) {
      setError(fileSizeCheck.reason || 'File size exceeds plan limit');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await processTool('reorder-pages', 'Reorder Pages', [file], async () => {
        // Parse page order
        const pages = pageOrder
          .split(',')
          .map(p => parseInt(p.trim()) - 1) // Convert to 0-based index
          .filter(n => !isNaN(n) && n >= 0);

        if (pages.length === 0) {
          throw new Error('No valid page numbers found');
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();

        // Validate page numbers
        if (pages.some(p => p >= totalPages)) {
          throw new Error(`Invalid page number. PDF has ${totalPages} pages`);
        }

        // Create new PDF with reordered pages
        const newPdf = await PDFDocument.create();

        for (const pageIndex of pages) {
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
          newPdf.addPage(copiedPage);
        }

        const result = await newPdf.save();
        setResultPdf(result);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to reorder pages');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultPdf) {
      const blob = new Blob([resultPdf as any], { type: 'application/pdf' });
      saveAs(blob, 'reordered.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Reorder PDF Pages</h1>
          <p className="text-xl text-gray-400">
            Rearrange pages in any order you want
          </p>
          {profile && (
            <div className="glass rounded-lg px-4 py-2 inline-block">
              <span className="text-sm text-gray-400">Credits Remaining: </span>
              <span className="text-lg font-bold text-primary">{profile.credits_remaining}</span>
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold text-white mb-3">How to use:</h2>
          <ol className="space-y-2 text-gray-400 text-sm">
            <li>1. Upload a PDF file</li>
            <li>2. Enter the new page order (e.g., "3,1,2" to move page 3 first)</li>
            <li>3. Click "Reorder Pages"</li>
            <li>4. Download your reordered PDF</li>
          </ol>
        </div>

        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          multiple={false}
        />

        {file && (
          <div className="glass rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Page Order
            </label>
            <input
              type="text"
              value={pageOrder}
              onChange={(e) => setPageOrder(e.target.value)}
              placeholder="e.g., 3,1,2,4"
              className="w-full px-4 py-2 bg-dark-lighter border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            <p className="mt-2 text-xs text-gray-500">
              Enter page numbers in the order you want them, separated by commas (e.g., 3,1,2 to make page 3 first)
            </p>
          </div>
        )}

        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!downloadReady ? (
            <button
              onClick={handleReorder}
              disabled={!file || !pageOrder.trim() || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowUpDown className="w-5 h-5" />
                  <span>Reorder Pages</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center justify-center space-x-2 glow-red"
            >
              <Download className="w-5 h-5" />
              <span>Download Reordered PDF</span>
            </button>
          )}
        </div>

        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>Pages reordered successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReorderPagesPage() {
  return (
    <ProtectedTool toolId="reorder-pages" toolName="Reorder Pages">
      <ReorderPagesContent />
    </ProtectedTool>
  );
}
