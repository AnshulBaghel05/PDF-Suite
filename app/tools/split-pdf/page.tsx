'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { splitIntoSinglePages } from '@/lib/pdf/split';
import { Download, Loader2, CheckCircle, File } from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function SplitPDFContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [splitPdfs, setSplitPdfs] = useState<Uint8Array[]>([]);
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

  const handleSplit = async () => {
    if (!file) {
      setError('Please select a PDF file to split');
      return;
    }

    // Check file size against plan limits
    const fileSizeCheck = checkFileSize(file.size);
    if (!fileSizeCheck.allowed) {
      setError(fileSizeCheck.reason || 'File size exceeds plan limit');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await processTool('split-pdf', 'Split PDF', [file], async () => {
        const pdfs = await splitIntoSinglePages(file);
        setSplitPdfs(pdfs);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to split PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (splitPdfs.length === 0) return;

    const zip = new JSZip();

    splitPdfs.forEach((pdf, index) => {
      zip.file(`page_${index + 1}.pdf`, pdf);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'split_pages.zip');
  };

  const handleDownloadSingle = (pdf: Uint8Array, index: number) => {
    const blob = new Blob([pdf as any], { type: 'application/pdf' });
    saveAs(blob, `page_${index + 1}.pdf`);
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Split PDF Files</h1>
          <p className="text-xl text-gray-400">
            Extract pages into separate PDF files
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
            <li>1. Upload a PDF file</li>
            <li>2. Click "Split PDF" to extract all pages</li>
            <li>3. Download individual pages or all as ZIP</li>
          </ol>
        </div>

        {/* File Upload */}
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          multiple={false}
        />

        {/* Error Message */}
        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        {!downloadReady && (
          <div className="flex justify-center">
            <button
              onClick={handleSplit}
              disabled={!file || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Split PDF</span>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {downloadReady && (
          <div className="space-y-4">
            <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>PDF split into {splitPdfs.length} pages!</span>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleDownloadAll}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download All as ZIP</span>
              </button>
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">Individual Pages</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {splitPdfs.map((pdf, index) => (
                  <button
                    key={index}
                    onClick={() => handleDownloadSingle(pdf, index)}
                    className="glass hover:bg-white/10 rounded-lg p-4 flex flex-col items-center space-y-2 transition-all group"
                  >
                    <File className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-gray-300">Page {index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SplitPDFPage() {
  return (
    <ProtectedTool toolId="split-pdf" toolName="Split PDF">
      <SplitPDFContent />
    </ProtectedTool>
  );
}
