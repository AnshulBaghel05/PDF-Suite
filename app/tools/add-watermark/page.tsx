'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { addWatermark } from '@/lib/pdf/watermark';
import { Download, Loader2, CheckCircle, Droplet } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function AddWatermarkContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
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

  const handleAddWatermark = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!watermarkText.trim()) {
      setError('Please enter watermark text');
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
      await processTool('add-watermark', 'Add Watermark', [file], async () => {
        const result = await addWatermark(file, watermarkText, { opacity, rotation });
        setResultPdf(result);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add watermark');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultPdf) {
      const blob = new Blob([new Uint8Array(resultPdf)], { type: 'application/pdf' });
      saveAs(blob, 'watermarked.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Add Watermark</h1>
          <p className="text-xl text-gray-400">
            Add custom text watermark to your PDF
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
            <li>2. Enter watermark text and customize settings</li>
            <li>3. Click "Add Watermark" to process</li>
            <li>4. Download your watermarked PDF</li>
          </ol>
        </div>

        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          multiple={false}
        />

        <div className="glass rounded-xl p-6 space-y-4">
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-300 mb-2">
              Watermark Text
            </label>
            <input
              id="text"
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="input-field"
              placeholder="Enter watermark text"
            />
          </div>

          <div>
            <label htmlFor="opacity" className="block text-sm font-medium text-gray-300 mb-2">
              Opacity: {Math.round(opacity * 100)}%
            </label>
            <input
              id="opacity"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="rotation" className="block text-sm font-medium text-gray-300 mb-2">
              Rotation: {rotation}°
            </label>
            <input
              id="rotation"
              type="range"
              min="0"
              max="90"
              step="15"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {!downloadReady ? (
          <div className="flex justify-center">
            <button
              onClick={handleAddWatermark}
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
                  <Droplet className="w-5 h-5" />
                  <span>Add Watermark</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>Watermark added successfully!</span>
            </div>
            <div className="flex justify-center">
              <button onClick={handleDownload} className="btn-primary flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Download Watermarked PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddWatermarkPage() {
  return (
    <ProtectedTool toolId="add-watermark" toolName="Add Watermark">
      <AddWatermarkContent />
    </ProtectedTool>
  );
}
