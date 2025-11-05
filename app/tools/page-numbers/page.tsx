'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { addPageNumbers } from '@/lib/pdf/page-numbers';
import { Download, Loader2, CheckCircle, Hash } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function PageNumbersContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const [fontSize, setFontSize] = useState(12);
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

  const handleAddNumbers = async () => {
    if (!file) {
      setError('Please select a PDF file');
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
      await processTool('page-numbers', 'Add Page Numbers', [file], async () => {
        const result = await addPageNumbers(file, { position, fontSize });
        setResultPdf(result);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add page numbers');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultPdf) {
      const blob = new Blob([resultPdf as any], { type: 'application/pdf' });
      saveAs(blob, 'numbered.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Add Page Numbers</h1>
          <p className="text-xl text-gray-400">
            Add page numbers to your PDF
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
            <li>2. Choose position and font size</li>
            <li>3. Click "Add Page Numbers"</li>
            <li>4. Download your numbered PDF</li>
          </ol>
        </div>

        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          multiple={false}
        />

        {file && !downloadReady && (
          <div className="glass rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Position
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setPosition('bottom')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    position === 'bottom'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Bottom
                </button>
                <button
                  onClick={() => setPosition('top')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    position === 'top'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Top
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Font Size: {fontSize}pt
              </label>
              <input
                type="range"
                min="8"
                max="20"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
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
              onClick={handleAddNumbers}
              disabled={!file || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Hash className="w-5 h-5" />
                  <span>Add Page Numbers</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center justify-center space-x-2 glow-red"
            >
              <Download className="w-5 h-5" />
              <span>Download Numbered PDF</span>
            </button>
          )}
        </div>

        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>Page numbers added successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PageNumbersPage() {
  return (
    <ProtectedTool toolId="page-numbers" toolName="Add Page Numbers">
      <PageNumbersContent />
    </ProtectedTool>
  );
}
