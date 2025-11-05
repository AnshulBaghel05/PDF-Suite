'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { compressPDF } from '@/lib/pdf/compress';
import { Download, Loader2, CheckCircle, FileDown } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function CompressPDFContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [compressedPdf, setCompressedPdf] = useState<Uint8Array | null>(null);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [error, setError] = useState<string>('');
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

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
    const selectedFile = selectedFiles[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setOriginalSize(selectedFile.size);
    }
    setDownloadReady(false);
    setError('');
  };

  const handleCompress = async () => {
    if (!file) {
      setError('Please select a PDF file to compress');
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
      await processTool('compress-pdf', 'Compress PDF', [file], async () => {
        const compressed = await compressPDF(file, quality);
        setCompressedPdf(compressed);
        setCompressedSize(compressed.length);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to compress PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (compressedPdf) {
      const blob = new Blob([compressedPdf as any], { type: 'application/pdf' });
      saveAs(blob, 'compressed.pdf');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const compressionPercentage = originalSize > 0
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Compress PDF</h1>
          <p className="text-xl text-gray-400">
            Reduce PDF file size while preserving quality
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
            <li>2. Select compression quality</li>
            <li>3. Click "Compress PDF" to process</li>
            <li>4. Download your compressed PDF</li>
          </ol>
        </div>

        {/* Compression Quality Selector */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Compression Quality</h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setQuality('low')}
              className={`p-4 rounded-lg border-2 transition-all ${
                quality === 'low'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-lg font-semibold text-white mb-1">Low</div>
              <div className="text-sm text-gray-400">Smallest file</div>
            </button>
            <button
              onClick={() => setQuality('medium')}
              className={`p-4 rounded-lg border-2 transition-all ${
                quality === 'medium'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-lg font-semibold text-white mb-1">Medium</div>
              <div className="text-sm text-gray-400">Balanced</div>
            </button>
            <button
              onClick={() => setQuality('high')}
              className={`p-4 rounded-lg border-2 transition-all ${
                quality === 'high'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-lg font-semibold text-white mb-1">High</div>
              <div className="text-sm text-gray-400">Best quality</div>
            </button>
          </div>
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
        {!downloadReady ? (
          <div className="flex justify-center">
            <button
              onClick={handleCompress}
              disabled={!file || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Compressing...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  <span>Compress PDF</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success & Stats */}
            <div className="glass border border-green-500/50 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-3 text-green-500 mb-6">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-semibold">Compression complete!</span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Original</div>
                  <div className="text-xl font-bold text-white">{formatFileSize(originalSize)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Compressed</div>
                  <div className="text-xl font-bold text-primary">{formatFileSize(compressedSize)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Saved</div>
                  <div className="text-xl font-bold text-green-500">{compressionPercentage}%</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Compressed PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CompressPDFPage() {
  return (
    <ProtectedTool toolId="compress-pdf" toolName="Compress PDF">
      <CompressPDFContent />
    </ProtectedTool>
  );
}
