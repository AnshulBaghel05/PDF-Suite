'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { performOCR, createSearchablePDF, formatOCRResults, OCRResult } from '@/lib/pdf/ocr';
import { Download, Loader2, CheckCircle, FileText, Eye } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function OCRPDFContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('eng');
  const [outputFormat, setOutputFormat] = useState<'text' | 'searchable-pdf'>('text');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);
  const [ocrResults, setOcrResults] = useState<OCRResult[] | null>(null);
  const [processedData, setProcessedData] = useState<Uint8Array | string | null>(null);
  const [error, setError] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

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
    setFile(selectedFiles[0]);
    setDownloadReady(false);
    setError('');
    setOcrResults(null);
    setShowPreview(false);
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a PDF or image file');
      return;
    }

    const fileSizeCheck = checkFileSize(file.size);
    if (!fileSizeCheck.allowed) {
      setError(fileSizeCheck.reason || 'File size exceeds plan limit');
      return;
    }

    setProcessing(true);
    setError('');
    setProgress(0);

    try {
      await processTool('ocr-pdf', 'OCR PDF', [file], async () => {
        // Perform OCR
        const results = await performOCR(file, language, (prog) => {
          setProgress(prog);
        });
        setOcrResults(results);

        // Generate output based on format
        if (outputFormat === 'text') {
          const textOutput = formatOCRResults(results);
          setProcessedData(textOutput);
        } else {
          const searchablePdf = await createSearchablePDF(file, results);
          setProcessedData(searchablePdf);
        }

        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to perform OCR');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!processedData) return;

    if (outputFormat === 'text') {
      const blob = new Blob([processedData as string], { type: 'text/plain' });
      saveAs(blob, 'ocr-result.txt');
    } else {
      const blob = new Blob([processedData as any], { type: 'application/pdf' });
      saveAs(blob, 'searchable.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">OCR PDF</h1>
          <p className="text-xl text-gray-400">
            Extract text from scanned PDFs and images using OCR
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
            <li>1. Upload a scanned PDF or image (PNG, JPG)</li>
            <li>2. Select language and output format</li>
            <li>3. Click "Extract Text" to process</li>
            <li>4. Download extracted text or searchable PDF</li>
          </ol>
        </div>

        {/* File Upload */}
        <FileUpload
          accept={{
            'application/pdf': ['.pdf'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
          }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          multiple={false}
        />

        {/* Options */}
        {file && !downloadReady && (
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white">OCR Options</h3>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              >
                <option value="eng">English</option>
                <option value="spa">Spanish</option>
                <option value="fra">French</option>
                <option value="deu">German</option>
                <option value="ita">Italian</option>
                <option value="por">Portuguese</option>
                <option value="rus">Russian</option>
                <option value="chi_sim">Chinese (Simplified)</option>
                <option value="jpn">Japanese</option>
                <option value="kor">Korean</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Output Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOutputFormat('text')}
                  className={`px-4 py-3 rounded-lg border text-sm transition-all ${
                    outputFormat === 'text'
                      ? 'border-primary bg-primary/20 text-white'
                      : 'border-gray-700 bg-black/30 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-1" />
                  Text File
                </button>
                <button
                  onClick={() => setOutputFormat('searchable-pdf')}
                  className={`px-4 py-3 rounded-lg border text-sm transition-all ${
                    outputFormat === 'searchable-pdf'
                      ? 'border-primary bg-primary/20 text-white'
                      : 'border-gray-700 bg-black/30 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-1" />
                  Searchable PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {processing && (
          <div className="glass rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Processing with OCR...</span>
              <span className="text-primary font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-red-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
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
                disabled={!file || processing}
                className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Extracting Text...</span>
                  </>
                ) : (
                  <span>Extract Text</span>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center justify-center space-x-2 glow-red"
                >
                  <Download className="w-5 h-5" />
                  <span>Download {outputFormat === 'text' ? 'Text' : 'PDF'}</span>
                </button>
                {outputFormat === 'text' && (
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-5 h-5" />
                    <span>{showPreview ? 'Hide' : 'Preview'} Text</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Success Message */}
        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>Text extracted successfully!</span>
          </div>
        )}

        {/* Text Preview */}
        {showPreview && ocrResults && outputFormat === 'text' && (
          <div className="glass rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-white">Extracted Text Preview</h3>
            <div className="bg-black/30 border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {formatOCRResults(ocrResults)}
              </pre>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Average confidence: {(ocrResults.reduce((sum, r) => sum + r.confidence, 0) / ocrResults.length).toFixed(2)}%
            </p>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">10+</div>
            <div className="text-sm text-gray-400">Languages supported</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">AI-Powered</div>
            <div className="text-sm text-gray-400">Tesseract OCR engine</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Accurate</div>
            <div className="text-sm text-gray-400">High quality results</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OCRPDFPage() {
  return (
    <ProtectedTool toolId="ocr-pdf" toolName="OCR PDF">
      <OCRPDFContent />
    </ProtectedTool>
  );
}
