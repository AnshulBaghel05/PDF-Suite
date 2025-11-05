'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { rotatePDF } from '@/lib/pdf/rotate';
import { Download, Loader2, CheckCircle, RotateCw } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function RotatePDFContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [rotatedPdf, setRotatedPdf] = useState<Uint8Array | null>(null);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
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

  const handleRotate = async () => {
    if (!file) {
      setError('Please select a PDF file to rotate');
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
      await processTool('rotate-pdf', 'Rotate PDF', [file], async () => {
        const rotated = await rotatePDF(file, rotation);
        setRotatedPdf(rotated);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to rotate PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (rotatedPdf) {
      const blob = new Blob([rotatedPdf as any], { type: 'application/pdf' });
      saveAs(blob, 'rotated.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Rotate PDF Pages</h1>
          <p className="text-xl text-gray-400">
            Rotate all pages left, right, or 180 degrees
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
            <li>2. Select rotation angle</li>
            <li>3. Click "Rotate PDF" to process</li>
            <li>4. Download your rotated PDF</li>
          </ol>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Rotation Angle</h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setRotation(90)}
              className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center space-y-3 ${
                rotation === 90
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <RotateCw className="w-8 h-8 text-primary" />
              <div className="text-lg font-semibold text-white">90° Right</div>
            </button>
            <button
              onClick={() => setRotation(180)}
              className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center space-y-3 ${
                rotation === 180
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <RotateCw className="w-8 h-8 text-primary" style={{ transform: 'rotate(180deg)' }} />
              <div className="text-lg font-semibold text-white">180°</div>
            </button>
            <button
              onClick={() => setRotation(270)}
              className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center space-y-3 ${
                rotation === 270
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <RotateCw className="w-8 h-8 text-primary" style={{ transform: 'rotate(270deg)' }} />
              <div className="text-lg font-semibold text-white">90° Left</div>
            </button>
          </div>
        </div>

        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          multiple={false}
        />

        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {!downloadReady ? (
          <div className="flex justify-center">
            <button
              onClick={handleRotate}
              disabled={!file || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Rotating...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-5 h-5" />
                  <span>Rotate PDF</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>PDF rotated successfully!</span>
            </div>
            <div className="flex justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Download Rotated PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RotatePDFPage() {
  return (
    <ProtectedTool toolId="rotate-pdf" toolName="Rotate PDF">
      <RotatePDFContent />
    </ProtectedTool>
  );
}
