'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import * as pdfjs from 'pdfjs-dist';
import { Download, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

// Set worker path - using local worker file for reliability
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function ExtractImagesContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
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
    setImages([]);
    setError('');
  };

  const handleExtract = async () => {
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
      await processTool('extract-images', 'Extract Images', [file], async () => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const extractedImages: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const ops = await page.getOperatorList();

          for (let j = 0; j < ops.fnArray.length; j++) {
            if (ops.fnArray[j] === pdfjs.OPS.paintImageXObject) {
              const imageName = ops.argsArray[j][0];
              try {
                const image = await page.objs.get(imageName);
                if (image && image.data) {
                  const canvas = document.createElement('canvas');
                  canvas.width = image.width;
                  canvas.height = image.height;
                  const ctx = canvas.getContext('2d');

                  if (ctx) {
                    const imageData = ctx.createImageData(image.width, image.height);
                    imageData.data.set(image.data);
                    ctx.putImageData(imageData, 0, 0);
                    extractedImages.push(canvas.toDataURL('image/png'));
                  }
                }
              } catch (err) {
                console.log('Error extracting image:', err);
              }
            }
          }
        }

        if (extractedImages.length === 0) {
          throw new Error('No images found in this PDF');
        }

        setImages(extractedImages);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to extract images from PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;

    const zip = new JSZip();

    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i].split(',')[1];
      zip.file(`image_${i + 1}.png`, base64Data, { base64: true });
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'extracted_images.zip');
  };

  const handleDownloadSingle = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `image_${index + 1}.png`;
    link.click();
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Extract Images from PDF</h1>
          <p className="text-xl text-gray-400">
            Extract all embedded images from your PDF
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
            <li>2. Click "Extract Images"</li>
            <li>3. Preview extracted images</li>
            <li>4. Download individual images or all as ZIP</li>
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

        {images.length === 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleExtract}
              disabled={!file || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Extracting Images...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span>Extract Images</span>
                </>
              )}
            </button>
          </div>
        )}

        {images.length > 0 && (
          <div className="space-y-4">
            <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>Found {images.length} images!</span>
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
              <h3 className="font-semibold text-white mb-4">Extracted Images:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="glass rounded-lg p-3 space-y-2">
                    <img
                      src={img}
                      alt={`Extracted ${index + 1}`}
                      className="w-full h-32 object-contain rounded"
                    />
                    <button
                      onClick={() => handleDownloadSingle(img, index)}
                      className="w-full btn-secondary text-sm py-2"
                    >
                      Download Image {index + 1}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExtractImagesPage() {
  return (
    <ProtectedTool toolId="extract-images" toolName="Extract Images">
      <ExtractImagesContent />
    </ProtectedTool>
  );
}
