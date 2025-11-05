'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { imagesToPDF } from '@/lib/pdf/image-to-pdf';
import { Download, Loader2, CheckCircle, ImagePlus } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function ImageToPDFContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
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

  const handleConvert = async () => {
    if (files.length === 0) {
      setError('Please select at least one image');
      return;
    }

    // Check total file size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const fileSizeCheck = checkFileSize(totalSize);
    if (!fileSizeCheck.allowed) {
      setError(fileSizeCheck.reason || 'Total file size exceeds plan limit');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await processTool('image-to-pdf', 'Image to PDF', files, async () => {
        const pdf = await imagesToPDF(files);
        setPdfData(pdf);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to convert images to PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfData) {
      const blob = new Blob([pdfData as any], { type: 'application/pdf' });
      saveAs(blob, 'images.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Image to PDF</h1>
          <p className="text-xl text-gray-400">
            Convert JPG, PNG images to PDF document
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
            <li>1. Upload one or more images (JPG, PNG)</li>
            <li>2. Images will be added in the order they appear</li>
            <li>3. Click "Convert to PDF" to process</li>
            <li>4. Download your PDF document</li>
          </ol>
        </div>

        <FileUpload
          accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
          maxFiles={20}
          onFilesSelected={handleFilesSelected}
          multiple={true}
        />

        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {!downloadReady ? (
          <div className="flex justify-center">
            <button
              onClick={handleConvert}
              disabled={files.length === 0 || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <ImagePlus className="w-5 h-5" />
                  <span>Convert to PDF</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>Images converted to PDF successfully!</span>
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

export default function ImageToPDFPage() {
  return (
    <ProtectedTool toolId="image-to-pdf" toolName="Image to PDF">
      <ImageToPDFContent />
    </ProtectedTool>
  );
}
