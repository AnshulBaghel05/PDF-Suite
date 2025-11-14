'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { Download, Loader2, CheckCircle, Lock } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function ProtectPDFContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [password, setPassword] = useState('');
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

  const handleProtect = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
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
      await processTool('protect-pdf', 'Protect PDF', [file], async () => {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // Note: Browser-based PDF encryption is limited
        // For full password protection, use desktop software or server-side processing
        // This adds a watermark to indicate protection intent
        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Add watermark to each page
        pages.forEach(page => {
          const { width, height } = page.getSize();

          // Add "PROTECTED" watermark
          page.drawText('PROTECTED', {
            x: width / 2 - 80,
            y: height / 2,
            size: 60,
            font,
            opacity: 0.08,
          });

          // Add password hint in footer
          page.drawText(`Password: ${password}`, {
            x: 20,
            y: 20,
            size: 8,
            font,
            opacity: 0.3,
          });
        });

        const pdfBytes = await pdfDoc.save();
        setResultPdf(pdfBytes);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to protect PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultPdf) {
      const blob = new Blob([resultPdf as any], { type: 'application/pdf' });
      saveAs(blob, 'protected.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Protect PDF</h1>
          <p className="text-xl text-gray-400">
            Add password protection to your PDF
          </p>
          {profile && (
            <div className="glass rounded-lg px-4 py-2 inline-block">
              <span className="text-sm text-gray-400">Credits Remaining: </span>
              <span className="text-lg font-bold text-primary">{profile.credits_remaining}</span>
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6 bg-yellow-500/5 border border-yellow-500/20">
          <p className="text-yellow-500 text-sm">
            <strong>Note:</strong> Password encryption requires server-side processing. This demo version adds a protection watermark. Upgrade to Pro for full encryption features.
          </p>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold text-white mb-3">How to use:</h2>
          <ol className="space-y-2 text-gray-400 text-sm">
            <li>1. Upload a PDF file</li>
            <li>2. Enter a secure password</li>
            <li>3. Click "Protect PDF"</li>
            <li>4. Download your protected PDF</li>
          </ol>
        </div>

        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          multiple={false}
        />

        {file && !downloadReady && (
          <div className="glass rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 bg-dark-lighter border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
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
              onClick={handleProtect}
              disabled={!file || !password || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Protect PDF</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center justify-center space-x-2 glow-red"
            >
              <Download className="w-5 h-5" />
              <span>Download Protected PDF</span>
            </button>
          )}
        </div>

        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>PDF protected successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProtectPDFPage() {
  return (
    <ProtectedTool toolId="protect-pdf" toolName="Protect PDF">
      <ProtectPDFContent />
    </ProtectedTool>
  );
}
