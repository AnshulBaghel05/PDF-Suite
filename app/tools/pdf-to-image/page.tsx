'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import * as pdfjs from 'pdfjs-dist';
import { Download, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

// Set worker path - using unpkg CDN for better reliability
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function PDFToImageContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [images, setImages] = useState<Blob[]>([]);
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
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
    setImages([]);
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
      await processTool('pdf-to-image', 'PDF to Image', [file], async () => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const imageBlobs: Blob[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;

            const blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((b) => {
                resolve(b || new Blob());
              }, format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
            });

            imageBlobs.push(blob);
          }
        }

        setImages(imageBlobs);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to convert PDF to images');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;

    const zip = new JSZip();
    const ext = format === 'png' ? 'png' : 'jpg';

    images.forEach((blob, index) => {
      zip.file(`page_${index + 1}.${ext}`, blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `pdf_images.zip`);
  };

  const handleDownloadSingle = (blob: Blob, index: number) => {
    const ext = format === 'png' ? 'png' : 'jpg';
    saveAs(blob, `page_${index + 1}.${ext}`);
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">PDF to Image</h1>
          <p className="text-xl text-gray-400">
            Convert PDF pages to JPG or PNG images
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
            <li>2. Choose output format (PNG or JPG)</li>
            <li>3. Click "Convert to Images"</li>
            <li>4. Download individual images or all as ZIP</li>
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
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Output Format
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setFormat('png')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  format === 'png'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                PNG (High Quality)
              </button>
              <button
                onClick={() => setFormat('jpg')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  format === 'jpg'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                JPG (Smaller Size)
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {!downloadReady && (
          <div className="flex justify-center">
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
                  <ImageIcon className="w-5 h-5" />
                  <span>Convert to Images</span>
                </>
              )}
            </button>
          </div>
        )}

        {downloadReady && images.length > 0 && (
          <div className="space-y-4">
            <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>Converted {images.length} pages to images!</span>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleDownloadAll}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download All as ZIP</span>
              </button>
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">Individual Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((blob, index) => (
                  <button
                    key={index}
                    onClick={() => handleDownloadSingle(blob, index)}
                    className="glass hover:bg-white/10 rounded-lg p-4 flex flex-col items-center space-y-2 transition-all group"
                  >
                    <ImageIcon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-gray-300">Page {index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PDFToImagePage() {
  return (
    <ProtectedTool toolId="pdf-to-image" toolName="PDF to Image">
      <PDFToImageContent />
    </ProtectedTool>
  );
}
