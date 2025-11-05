'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { deletePages } from '@/lib/pdf/delete';
import { Download, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function DeletePagesContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [pagesToDelete, setPagesToDelete] = useState<string>('');
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

  const handleDelete = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!pagesToDelete.trim()) {
      setError('Please specify pages to delete');
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
      await processTool('delete-pages', 'Delete Pages', [file], async () => {
      // Parse page numbers (e.g., "1,3,5" or "1-3,5")
      const pages = pagesToDelete
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

        const result = await deletePages(file, pages);
        setResultPdf(result);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete pages');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultPdf) {
      const blob = new Blob([resultPdf as any], { type: 'application/pdf' });
      saveAs(blob, 'deleted_pages.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Delete PDF Pages</h1>
          <p className="text-xl text-gray-400">
            Remove unwanted pages from your PDF
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
            <li>2. Enter page numbers to delete (e.g., "1,3,5" or "1-3,7")</li>
            <li>3. Click "Delete Pages" to process</li>
            <li>4. Download your modified PDF</li>
          </ol>
        </div>

        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          multiple={false}
        />

        <div className="glass rounded-xl p-6">
          <label htmlFor="pages" className="block text-sm font-medium text-gray-300 mb-2">
            Pages to Delete
          </label>
          <input
            id="pages"
            type="text"
            value={pagesToDelete}
            onChange={(e) => setPagesToDelete(e.target.value)}
            className="input-field"
            placeholder="e.g., 1,3,5 or 1-3,7"
          />
          <p className="text-xs text-gray-400 mt-2">
            Enter page numbers separated by commas. Use hyphens for ranges (e.g., 1-5 means pages 1 through 5)
          </p>
        </div>

        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {!downloadReady ? (
          <div className="flex justify-center">
            <button
              onClick={handleDelete}
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
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Pages</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>Pages deleted successfully!</span>
            </div>
            <div className="flex justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DeletePagesPage() {
  return (
    <ProtectedTool toolId="delete-pages" toolName="Delete Pages">
      <DeletePagesContent />
    </ProtectedTool>
  );
}
