'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { addBookmarksToPDF, extractBookmarks, Bookmark } from '@/lib/pdf/bookmarks';
import { Download, Loader2, CheckCircle, Plus, Trash2, FileText } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

function PDFBookmarksContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    { title: 'Chapter 1', pageNumber: 1, level: 0 },
  ]);
  const [processing, setProcessing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [processedPdfData, setProcessedPdfData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);

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
    setBookmarks([{ title: 'Chapter 1', pageNumber: 1, level: 0 }]);

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

  const handleExtractBookmarks = async () => {
    if (!file) return;

    setExtracting(true);
    setError('');

    try {
      const extracted = await extractBookmarks(file);
      if (extracted.length > 0) {
        setBookmarks(extracted);
      } else {
        setError('No bookmarks found in this PDF');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to extract bookmarks');
    } finally {
      setExtracting(false);
    }
  };

  const handleAddBookmark = () => {
    setBookmarks([...bookmarks, { title: `Bookmark ${bookmarks.length + 1}`, pageNumber: 1, level: 0 }]);
  };

  const handleRemoveBookmark = (index: number) => {
    setBookmarks(bookmarks.filter((_, i) => i !== index));
  };

  const handleBookmarkChange = (index: number, field: keyof Bookmark, value: string | number) => {
    const updated = [...bookmarks];
    updated[index] = { ...updated[index], [field]: value };
    setBookmarks(updated);
  };

  const handleProcess = async () => {
    if (!file || bookmarks.length === 0) {
      setError('Please select a PDF file and add at least one bookmark');
      return;
    }

    // Validate page numbers
    for (const bookmark of bookmarks) {
      if (!bookmark.title.trim()) {
        setError('All bookmarks must have a title');
        return;
      }
      if (totalPages > 0 && (bookmark.pageNumber < 1 || bookmark.pageNumber > totalPages)) {
        setError(`Invalid page number ${bookmark.pageNumber}. PDF has ${totalPages} pages.`);
        return;
      }
    }

    const fileSizeCheck = checkFileSize(file.size);
    if (!fileSizeCheck.allowed) {
      setError(fileSizeCheck.reason || 'File size exceeds plan limit');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await processTool('pdf-bookmarks', 'PDF Bookmarks', [file], async () => {
        const processedPdf = await addBookmarksToPDF(file, bookmarks);
        setProcessedPdfData(processedPdf);
        setDownloadReady(true);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add bookmarks to PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedPdfData) {
      const blob = new Blob([processedPdfData as any], { type: 'application/pdf' });
      saveAs(blob, 'bookmarked.pdf');
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">PDF Bookmarks</h1>
          <p className="text-xl text-gray-400">
            Add or edit bookmarks (table of contents) in your PDF
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
            <li>2. Extract existing bookmarks or create new ones</li>
            <li>3. Edit bookmark titles and page numbers</li>
            <li>4. Click "Add Bookmarks to PDF" to process</li>
            <li>5. Download your bookmarked PDF</li>
          </ol>
        </div>

        {/* File Upload */}
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          multiple={false}
        />

        {/* Extract Button */}
        {file && !downloadReady && (
          <div className="flex justify-center">
            <button
              onClick={handleExtractBookmarks}
              disabled={extracting}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Extract Existing Bookmarks</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Bookmarks Editor */}
        {file && !downloadReady && (
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Bookmarks {totalPages > 0 && `(Total Pages: ${totalPages})`}</h3>
              <button
                onClick={handleAddBookmark}
                className="btn-secondary text-sm px-3 py-2 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bookmark</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bookmarks.map((bookmark, index) => (
                <div key={index} className="glass rounded-lg p-4 flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={bookmark.title}
                      onChange={(e) => handleBookmarkChange(index, 'title', e.target.value)}
                      placeholder="Bookmark title"
                      className="bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      value={bookmark.pageNumber}
                      onChange={(e) => handleBookmarkChange(index, 'pageNumber', parseInt(e.target.value) || 1)}
                      placeholder="Page number"
                      min="1"
                      max={totalPages || 999}
                      className="bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveBookmark(index)}
                    className="text-red-500 hover:text-red-400 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
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
                disabled={!file || bookmarks.length === 0 || processing}
                className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Add Bookmarks to PDF</span>
                )}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center justify-center space-x-2 glow-red"
              >
                <Download className="w-5 h-5" />
                <span>Download Bookmarked PDF</span>
              </button>
            )}
          </div>
        )}

        {/* Success Message */}
        {downloadReady && (
          <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-3 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>Bookmarks added successfully!</span>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Easy</div>
            <div className="text-sm text-gray-400">Bookmark management</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Extract</div>
            <div className="text-sm text-gray-400">Existing bookmarks</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Navigate</div>
            <div className="text-sm text-gray-400">Better PDF experience</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PDFBookmarksPage() {
  return (
    <ProtectedTool toolId="pdf-bookmarks" toolName="PDF Bookmarks">
      <PDFBookmarksContent />
    </ProtectedTool>
  );
}
