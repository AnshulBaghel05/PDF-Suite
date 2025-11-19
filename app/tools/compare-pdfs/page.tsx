'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import * as pdfjs from 'pdfjs-dist';
import { Loader2, CheckCircle, GitCompare } from 'lucide-react';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

// Set worker path - using local worker file for reliability
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function ComparePDFsContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<string>('');
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
    setFiles(selectedFiles.slice(0, 2));
    setComparisonResult('');
    setError('');
  };

  const handleCompare = async () => {
    if (files.length < 2) {
      setError('Please select 2 PDF files to compare');
      return;
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const fileSizeCheck = checkFileSize(totalSize);
    if (!fileSizeCheck.allowed) {
      setError(fileSizeCheck.reason || 'Total file size exceeds plan limit');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await processTool('compare-pdfs', 'Compare PDFs', files, async () => {
        const [file1, file2] = files;

        const arrayBuffer1 = await file1.arrayBuffer();
        const arrayBuffer2 = await file2.arrayBuffer();

        const pdf1 = await pdfjs.getDocument({ data: arrayBuffer1 }).promise;
        const pdf2 = await pdfjs.getDocument({ data: arrayBuffer2 }).promise;

        let result = `📄 File 1: ${file1.name}\n`;
        result += `   Pages: ${pdf1.numPages}\n\n`;
        result += `📄 File 2: ${file2.name}\n`;
        result += `   Pages: ${pdf2.numPages}\n\n`;

        if (pdf1.numPages !== pdf2.numPages) {
          result += `⚠️ Different number of pages: ${pdf1.numPages} vs ${pdf2.numPages}\n\n`;
        } else {
          result += `✓ Same number of pages: ${pdf1.numPages}\n\n`;
        }

        result += `📊 Comparison Summary:\n`;
        result += `- File 1 size: ${(file1.size / 1024).toFixed(2)} KB\n`;
        result += `- File 2 size: ${(file2.size / 1024).toFixed(2)} KB\n`;
        result += `- Size difference: ${Math.abs(file1.size - file2.size)} bytes\n`;

        setComparisonResult(result);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to compare PDFs');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Compare PDFs</h1>
          <p className="text-xl text-gray-400">
            Compare two PDF documents
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
            <li>1. Upload 2 PDF files</li>
            <li>2. Click "Compare PDFs"</li>
            <li>3. View comparison results</li>
          </ol>
        </div>

        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={2}
          onFilesSelected={handleFilesSelected}
          multiple={true}
        />

        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {!comparisonResult && (
          <div className="flex justify-center">
            <button
              onClick={handleCompare}
              disabled={files.length < 2 || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Comparing...</span>
                </>
              ) : (
                <>
                  <GitCompare className="w-5 h-5" />
                  <span>Compare PDFs</span>
                </>
              )}
            </button>
          </div>
        )}

        {comparisonResult && (
          <div className="space-y-4">
            <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>Comparison complete!</span>
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">Comparison Results:</h3>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-dark-lighter p-4 rounded-lg">
                {comparisonResult}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparePDFsPage() {
  return (
    <ProtectedTool toolId="compare-pdfs" toolName="Compare PDFs">
      <ComparePDFsContent />
    </ProtectedTool>
  );
}
