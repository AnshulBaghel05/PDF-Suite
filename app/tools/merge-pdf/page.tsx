'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { mergePDFs } from '@/lib/pdf/merge';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';
import Link from 'next/link';

function MergePDFContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [mergedPdfData, setMergedPdfData] = useState<Uint8Array | null>(null);
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

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setDownloadReady(false);
    setError('');
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    // Check file sizes against plan limits
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const fileSizeCheck = checkFileSize(totalSize);
    if (!fileSizeCheck.allowed) {
      setError(fileSizeCheck.reason || 'File size exceeds plan limit');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await processTool('merge-pdf', 'Merge PDF', files, async () => {
        const mergedPdf = await mergePDFs(files);
        setMergedPdfData(mergedPdf);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to merge PDFs');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (mergedPdfData) {
      const blob = new Blob([mergedPdfData as any], { type: 'application/pdf' });
      saveAs(blob, 'merged.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Merge PDF Files</h1>
          <p className="text-xl text-gray-400">
            Combine multiple PDF documents into a single file
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
            <li>1. Upload 2 or more PDF files</li>
            <li>2. Files will be merged in the order they appear</li>
            <li>3. Click "Merge PDFs" to process</li>
            <li>4. Download your merged PDF</li>
          </ol>
        </div>

        {/* File Upload */}
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={20}
          onFilesSelected={handleFilesSelected}
          multiple={true}
        />

        {/* Error Message */}
        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!downloadReady ? (
            <button
              onClick={handleMerge}
              disabled={files.length < 2 || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Merge PDFs</span>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center justify-center space-x-2 glow-red"
            >
              <Download className="w-5 h-5" />
              <span>Download Merged PDF</span>
            </button>
          )}
        </div>

        {/* Success Message */}
        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>PDFs merged successfully!</span>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Unlimited</div>
            <div className="text-sm text-gray-400">Files to merge</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">100%</div>
            <div className="text-sm text-gray-400">Client-side processing</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Instant</div>
            <div className="text-sm text-gray-400">Results</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MergePDFPage() {
  return (
    <ProtectedTool toolId="merge-pdf" toolName="Merge PDF">
      <MergePDFContent />
    </ProtectedTool>
  );
}
