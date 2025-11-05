'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { Download, Loader2, CheckCircle, FileText } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';

function WordToPDFContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
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

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a Word file');
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
      await processTool('word-to-pdf', 'Word to PDF', [file], async () => {
        const arrayBuffer = await file.arrayBuffer();

        // Extract text and HTML from Word document
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const htmlContent = result.value;

        // Create PDF from HTML
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        // Add text to PDF with word wrapping
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const maxWidth = pageWidth - (margin * 2);

        doc.setFontSize(11);
        const lines = doc.splitTextToSize(textContent, maxWidth);

        let yPosition = margin;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.getHeight();

        lines.forEach((line: string) => {
          if (yPosition + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });

        const pdfOutput = doc.output('blob');
        setPdfBlob(pdfOutput);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to convert Word to PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      saveAs(pdfBlob, 'converted.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Word to PDF</h1>
          <p className="text-xl text-gray-400">
            Convert DOCX files to PDF format
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
            <li>1. Upload a Word document (.docx)</li>
            <li>2. Click "Convert to PDF"</li>
            <li>3. Download your PDF file</li>
          </ol>
        </div>

        <FileUpload
          accept={{
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
          }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          multiple={false}
        />

        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!downloadReady ? (
            <button
              onClick={handleConvert}
              disabled={!file || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Convert to PDF</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center justify-center space-x-2 glow-red"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
          )}
        </div>

        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>Word document converted successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WordToPDFPage() {
  return (
    <ProtectedTool toolId="word-to-pdf" toolName="Word to PDF">
      <WordToPDFContent />
    </ProtectedTool>
  );
}
