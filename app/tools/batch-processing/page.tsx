'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { mergePDFs } from '@/lib/pdf/merge';
import { compressPDF } from '@/lib/pdf/compress';
import { Download, Loader2, CheckCircle, Layers } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function BatchProcessingContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<Uint8Array[]>([]);
  const [operation, setOperation] = useState<'merge' | 'compress'>('compress');
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState('');

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
    setProcessedFiles([]);
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      setError('Please select PDF files to process');
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
    setProgress('');

    try {
      await processTool('batch-processing', 'Batch Processing', files, async () => {
        if (operation === 'merge') {
          setProgress('Merging all PDFs...');
          const merged = await mergePDFs(files);
          setProcessedFiles([merged]);
          setProgress('Merge complete!');
        } else {
          // Compress each file
          const compressed: Uint8Array[] = [];
          for (let i = 0; i < files.length; i++) {
            setProgress(`Compressing file ${i + 1} of ${files.length}...`);
            const result = await compressPDF(files[i], 'medium');
            compressed.push(result);
          }
          setProcessedFiles(compressed);
          setProgress('All files compressed!');
        }

        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to process files');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (processedFiles.length === 0) return;

    if (operation === 'merge') {
      const blob = new Blob([processedFiles[0] as any], { type: 'application/pdf' });
      saveAs(blob, 'merged.pdf');
    } else {
      const zip = new JSZip();

      processedFiles.forEach((pdf, index) => {
        zip.file(`compressed_${index + 1}.pdf`, pdf);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'compressed_batch.zip');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Batch Processing</h1>
          <p className="text-xl text-gray-400">
            Process multiple PDFs at once
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
            <li>1. Upload multiple PDF files</li>
            <li>2. Choose operation (Merge or Compress)</li>
            <li>3. Click "Process Files"</li>
            <li>4. Download the result</li>
          </ol>
        </div>

        {!downloadReady && (
          <div className="glass rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Operation
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setOperation('compress')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  operation === 'compress'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Compress All
              </button>
              <button
                onClick={() => setOperation('merge')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  operation === 'merge'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Merge All
              </button>
            </div>
          </div>
        )}

        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={20}
          onFilesSelected={handleFilesSelected}
          multiple={true}
        />

        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {progress && (
          <div className="glass rounded-lg p-4 text-center text-gray-300">
            {progress}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!downloadReady ? (
            <button
              onClick={handleProcess}
              disabled={files.length === 0 || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Layers className="w-5 h-5" />
                  <span>Process Files</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center justify-center space-x-2 glow-red"
            >
              <Download className="w-5 h-5" />
              <span>Download {operation === 'merge' ? 'Merged PDF' : 'ZIP'}</span>
            </button>
          )}
        </div>

        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>
              {operation === 'merge'
                ? 'All PDFs merged successfully!'
                : `${files.length} PDFs compressed successfully!`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BatchProcessingPage() {
  return (
    <ProtectedTool toolId="batch-processing" toolName="Batch Processing">
      <BatchProcessingContent />
    </ProtectedTool>
  );
}
