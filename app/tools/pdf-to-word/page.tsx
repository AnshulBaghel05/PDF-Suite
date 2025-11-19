'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import * as pdfjs from 'pdfjs-dist';
import { Download, Loader2, CheckCircle, FileText } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

// Set worker path - using local worker file for reliability
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function PDFToWordContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [wordBlob, setWordBlob] = useState<Blob | null>(null);
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
      await processTool('pdf-to-word', 'PDF to Word', [file], async () => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        const paragraphs: Paragraph[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');

          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: pageText,
                  size: 24
                })
              ],
              spacing: {
                after: 200
              }
            })
          );

          if (i < pdf.numPages) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `--- Page ${i} ---`,
                    break: 1
                  })
                ]
              })
            );
          }
        }

        const doc = new Document({
          sections: [{
            properties: {},
            children: paragraphs
          }]
        });

        const blob = await Packer.toBlob(doc);
        setWordBlob(blob);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to convert PDF to Word');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (wordBlob) {
      saveAs(wordBlob, 'converted.docx');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">PDF to Word</h1>
          <p className="text-xl text-gray-400">
            Convert PDF files to DOCX format
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
            <li>2. Click "Convert to Word"</li>
            <li>3. Download your DOCX file</li>
          </ol>
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
                  <span>Convert to Word</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center justify-center space-x-2 glow-red"
            >
              <Download className="w-5 h-5" />
              <span>Download Word Document</span>
            </button>
          )}
        </div>

        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>PDF converted successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PDFToWordPage() {
  return (
    <ProtectedTool toolId="pdf-to-word" toolName="PDF to Word">
      <PDFToWordContent />
    </ProtectedTool>
  );
}
