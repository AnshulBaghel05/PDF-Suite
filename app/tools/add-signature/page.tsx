'use client';

import { useState, useRef, useEffect } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { addSignatureToPDF, addTextSignature, SignatureOptions } from '@/lib/pdf/signature';
import { Download, Loader2, CheckCircle, Pencil, Type, Upload, Trash2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';
import SignaturePad from 'signature_pad';

type SignatureMode = 'draw' | 'text' | 'upload';

function AddSignatureContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<SignatureMode>('draw');
  const [processing, setProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [processedPdfData, setProcessedPdfData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string>('');

  // Draw mode
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  // Text mode
  const [signatureText, setSignatureText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState('#000000');

  // Upload mode
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  // Common options
  const [pageNumber, setPageNumber] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 700 });
  const [size, setSize] = useState({ width: 200, height: 80 });
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (canvasRef.current && mode === 'draw') {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
      });
    }
  }, [mode]);

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

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setDownloadReady(false);
    setError('');

    // Get page count
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
    } catch (err) {
      console.error('Error reading PDF:', err);
    }
  };

  const handleClearSignature = () => {
    if (mode === 'draw' && signaturePadRef.current) {
      signaturePadRef.current.clear();
    } else if (mode === 'text') {
      setSignatureText('');
    } else if (mode === 'upload') {
      setSignatureImage(null);
    }
  };

  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    // Validate signature based on mode
    if (mode === 'draw' && signaturePadRef.current?.isEmpty()) {
      setError('Please draw your signature');
      return;
    }
    if (mode === 'text' && !signatureText.trim()) {
      setError('Please enter signature text');
      return;
    }
    if (mode === 'upload' && !signatureImage) {
      setError('Please upload a signature image');
      return;
    }

    if (totalPages > 0 && (pageNumber < 1 || pageNumber > totalPages)) {
      setError(`Invalid page number. PDF has ${totalPages} pages.`);
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
      await processTool('add-signature', 'Add Signature', [file], async () => {
        const options: SignatureOptions = {
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          pageNumber: pageNumber,
        };

        let processedPdf: Uint8Array;

        if (mode === 'draw' && signaturePadRef.current) {
          const signatureDataUrl = signaturePadRef.current.toDataURL();
          processedPdf = await addSignatureToPDF(file, signatureDataUrl, options);
        } else if (mode === 'text') {
          processedPdf = await addTextSignature(file, signatureText, {
            ...options,
            fontSize,
            fontColor,
          });
        } else if (mode === 'upload' && signatureImage) {
          processedPdf = await addSignatureToPDF(file, signatureImage, options);
        } else {
          throw new Error('Invalid signature mode');
        }

        setProcessedPdfData(processedPdf);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add signature to PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedPdfData) {
      const blob = new Blob([processedPdfData as any], { type: 'application/pdf' });
      saveAs(blob, 'signed.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Add Signature</h1>
          <p className="text-xl text-gray-400">
            Sign your PDF documents digitally
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
            <li>2. Choose signature method (Draw, Type, or Upload)</li>
            <li>3. Create your signature</li>
            <li>4. Adjust position and size</li>
            <li>5. Click "Add Signature to PDF" to process</li>
          </ol>
        </div>

        {/* File Upload */}
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          multiple={false}
        />

        {/* Signature Mode Selection */}
        {file && !downloadReady && (
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Signature Method</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setMode('draw')}
                className={`px-4 py-3 rounded-lg border text-sm transition-all ${
                  mode === 'draw'
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-gray-700 bg-black/30 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Pencil className="w-5 h-5 mx-auto mb-1" />
                Draw
              </button>
              <button
                onClick={() => setMode('text')}
                className={`px-4 py-3 rounded-lg border text-sm transition-all ${
                  mode === 'text'
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-gray-700 bg-black/30 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Type className="w-5 h-5 mx-auto mb-1" />
                Type
              </button>
              <button
                onClick={() => setMode('upload')}
                className={`px-4 py-3 rounded-lg border text-sm transition-all ${
                  mode === 'upload'
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-gray-700 bg-black/30 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Upload className="w-5 h-5 mx-auto mb-1" />
                Upload
              </button>
            </div>
          </div>
        )}

        {/* Signature Creation Area */}
        {file && !downloadReady && (
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Create Signature</h3>
              <button
                onClick={handleClearSignature}
                className="text-red-500 hover:text-red-400 flex items-center space-x-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>

            {mode === 'draw' && (
              <div className="bg-white rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full border-2 border-gray-300 cursor-crosshair"
                />
              </div>
            )}

            {mode === 'text' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  placeholder="Enter your signature text"
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white text-2xl focus:outline-none focus:border-primary"
                  style={{ fontFamily: 'cursive' }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Font Size</label>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value) || 24)}
                      min="12"
                      max="72"
                      className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="w-full h-10 bg-black/30 border border-gray-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {mode === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleSignatureImageUpload}
                  className="hidden"
                  id="signature-upload"
                />
                <label
                  htmlFor="signature-upload"
                  className="block w-full px-4 py-8 border-2 border-dashed border-gray-700 rounded-lg text-center cursor-pointer hover:border-primary transition-colors"
                >
                  {signatureImage ? (
                    <img src={signatureImage} alt="Signature" className="max-h-32 mx-auto" />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400">Click to upload signature image</p>
                      <p className="text-xs text-gray-500 mt-1">PNG or JPG format</p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
        )}

        {/* Position and Size Options */}
        {file && !downloadReady && (
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Position & Size</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Page Number {totalPages > 0 && `(of ${totalPages})`}</label>
                <input
                  type="number"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                  min="1"
                  max={totalPages || 999}
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">X Position</label>
                <input
                  type="number"
                  value={position.x}
                  onChange={(e) => setPosition({ ...position, x: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Y Position</label>
                <input
                  type="number"
                  value={position.y}
                  onChange={(e) => setPosition({ ...position, y: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Width</label>
                <input
                  type="number"
                  value={size.width}
                  onChange={(e) => setSize({ ...size, width: parseInt(e.target.value) || 100 })}
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Height</label>
                <input
                  type="number"
                  value={size.height}
                  onChange={(e) => setSize({ ...size, height: parseInt(e.target.value) || 50 })}
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        {file && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!downloadReady ? (
              <button
                onClick={handleProcess}
                disabled={processing}
                className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Add Signature to PDF</span>
                )}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center justify-center space-x-2 glow-red"
              >
                <Download className="w-5 h-5" />
                <span>Download Signed PDF</span>
              </button>
            )}
          </div>
        )}

        {/* Success Message */}
        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>Signature added successfully!</span>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">3 Methods</div>
            <div className="text-sm text-gray-400">Draw, Type, or Upload</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Customizable</div>
            <div className="text-sm text-gray-400">Position and size</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Professional</div>
            <div className="text-sm text-gray-400">Digital signatures</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddSignaturePage() {
  return (
    <ProtectedTool toolId="add-signature" toolName="Add Signature">
      <AddSignatureContent />
    </ProtectedTool>
  );
}
