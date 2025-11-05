'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { extractPages } from '@/lib/pdf/extract';
import { Download, Loader2, CheckCircle, FileText } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function ExtractPagesContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [pagesToExtract, setPagesToExtract] = useState<string>('');
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

  const handleExtract = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!pagesToExtract.trim()) {
      setError('Please specify pages to extract');
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
      await processTool('extract-pages', 'Extract Pages', [file], async () => {
        // Parse page numbers (e.g., "1,3,5" or "1-3,5")
        const pages = pagesToExtract
          .split(',')
          .flatMap(part => {
            part = part.trim();
            if (part.includes('-')) {
              const [start, end] = part.split('-').map(n => parseInt(n));
              return Array.from({ length: end - start + 1 }, (_, i) => start + i);
            }
            return [parseInt(part)];
          })
          .filter(n => !isNaN(n));

        if (pages.length === 0) {
          throw new Error('No valid page numbers found');
        }

        const result = await extractPages(file, pages);
        setResultPdf(result);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to extract pages');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultPdf) {
      const blob = new Blob([resultPdf as any], { type: 'application/pdf' });
      saveAs(blob, 'extracted.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Extract PDF Pages</h1>
          <p className="text-xl text-gray-400">
            Extract specific pages into a new PDF
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
            <li>2. Enter page numbers to extract (e.g., "1,3,5" or "1-3,7")</li>
            <li>3. Click "Extract Pages"</li>
            <li>4. Download the new PDF with only selected pages</li>
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
              Pages to Extract
            </label>
            <input
              type="text"
              value={pagesToExtract}
              onChange={(e) => setPagesToExtract(e.target.value)}
              placeholder="e.g., 1,3,5 or 1-3,7"
              className="w-full px-4 py-2 bg-dark-lighter border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            <p className="mt-2 text-xs text-gray-500">
              Separate page numbers with commas. Use hyphens for ranges (e.g., 1-5 for pages 1 to 5)
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
              onClick={handleExtract}
              disabled={!file || !pagesToExtract.trim() || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Extract Pages</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center justify-center space-x-2 glow-red"
            >
              <Download className="w-5 h-5" />
              <span>Download Extracted PDF</span>
            </button>
          )}
        </div>

        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>Pages extracted successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExtractPagesPage() {
  return (
    <ProtectedTool toolId="extract-pages" toolName="Extract Pages">
      <ExtractPagesContent />
    </ProtectedTool>
  );
}
