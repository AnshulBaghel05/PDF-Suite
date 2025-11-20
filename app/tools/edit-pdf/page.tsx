'use client';

import { useState, useRef } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { Download, Loader2, Type, Image as ImageIcon, Square, Circle, Minus, Edit3, Highlighter, PenTool, Trash2, Undo, Redo } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

type Tool = 'select' | 'text' | 'image' | 'rectangle' | 'circle' | 'line' | 'highlight' | 'draw' | 'signature';

interface Annotation {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  x2?: number;
  y2?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  imageData?: string;
  points?: { x: number; y: number }[];
  page: number;
}

function EditPDFContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [color, setColor] = useState('#000000');
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setError('');
    setAnnotations([]);
    setHistory([]);
    setHistoryStep(0);

    const fileSizeCheck = checkFileSize(selectedFile.size);
    if (!fileSizeCheck.allowed) {
      setError(fileSizeCheck.reason || 'File size exceeds plan limit');
      return;
    }

    setProcessing(true);

    try {
      // Load PDF
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPdfDoc(pdf);
      setNumPages(pdf.getPageCount());
      setCurrentPage(1);

      // Render first page
      await renderPage(selectedFile, 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load PDF');
    } finally {
      setProcessing(false);
    }
  };

  const renderPage = async (pdfFile: File, pageNum: number) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Redraw annotations for current page
      redrawAnnotations(pageNum);

      // Save canvas state
      setCanvasDataUrl(canvas.toDataURL());
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  const redrawAnnotations = (pageNum: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pageAnnotations = annotations.filter(a => a.page === pageNum);

    pageAnnotations.forEach(annotation => {
      ctx.fillStyle = annotation.color || color;
      ctx.strokeStyle = annotation.color || color;
      ctx.lineWidth = 2;

      switch (annotation.type) {
        case 'text':
          ctx.font = `${annotation.fontSize || fontSize}px Arial`;
          ctx.fillText(annotation.text || '', annotation.x, annotation.y);
          break;
        case 'rectangle':
          ctx.strokeRect(annotation.x, annotation.y, annotation.width || 0, annotation.height || 0);
          break;
        case 'circle':
          const radius = Math.sqrt(Math.pow(annotation.width || 0, 2) + Math.pow(annotation.height || 0, 2)) / 2;
          ctx.beginPath();
          ctx.arc(annotation.x + (annotation.width || 0) / 2, annotation.y + (annotation.height || 0) / 2, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(annotation.x, annotation.y);
          ctx.lineTo(annotation.x2 || 0, annotation.y2 || 0);
          ctx.stroke();
          break;
        case 'highlight':
          ctx.globalAlpha = 0.3;
          ctx.fillRect(annotation.x, annotation.y, annotation.width || 0, annotation.height || 0);
          ctx.globalAlpha = 1.0;
          break;
        case 'draw':
          if (annotation.points && annotation.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            annotation.points.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.stroke();
          }
          break;
      }
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: selectedTool,
      x,
      y,
      color,
      fontSize,
      page: currentPage,
      points: selectedTool === 'draw' ? [{ x, y }] : undefined,
    };

    setCurrentAnnotation(newAnnotation);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentAnnotation.type === 'draw' && currentAnnotation.points) {
      const updatedAnnotation = {
        ...currentAnnotation,
        points: [...currentAnnotation.points, { x, y }],
      };
      setCurrentAnnotation(updatedAnnotation);

      // Draw immediately for smooth drawing
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(currentAnnotation.points[currentAnnotation.points.length - 1].x, currentAnnotation.points[currentAnnotation.points.length - 1].y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    } else {
      const updatedAnnotation = {
        ...currentAnnotation,
        width: x - currentAnnotation.x,
        height: y - currentAnnotation.y,
        x2: x,
        y2: y,
      };
      setCurrentAnnotation(updatedAnnotation);
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return;

    if (currentAnnotation.type === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const finalAnnotation = { ...currentAnnotation, text };
        addAnnotation(finalAnnotation);
      }
    } else {
      addAnnotation(currentAnnotation);
    }

    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  const addAnnotation = (annotation: Annotation) => {
    const newAnnotations = [...annotations, annotation];
    setAnnotations(newAnnotations);

    // Add to history
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newAnnotations);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);

    // Redraw
    if (file) renderPage(file, currentPage);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      setAnnotations(history[newStep] || []);
      if (file) renderPage(file, currentPage);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      setAnnotations(history[newStep]);
      if (file) renderPage(file, currentPage);
    }
  };

  const handleInsertImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'image',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        imageData,
        page: currentPage,
      };
      addAnnotation(newAnnotation);
    };
    reader.readAsDataURL(imageFile);
  };

  const handleSave = async () => {
    if (!pdfDoc || !file) return;

    setProcessing(true);

    try {
      await processTool('edit-pdf', 'Edit PDF', [file], async () => {
        // Create a copy of the PDF
        const pdfDocCopy = await PDFDocument.load(await file.arrayBuffer());

        // Apply annotations to PDF
        for (let i = 0; i < pdfDocCopy.getPageCount(); i++) {
          const page = pdfDocCopy.getPage(i);
          const pageAnnotations = annotations.filter(a => a.page === i + 1);
          const { height } = page.getSize();

          for (const annotation of pageAnnotations) {
            // Convert canvas coordinates to PDF coordinates
            const pdfY = height - annotation.y;

            switch (annotation.type) {
              case 'text':
                if (annotation.text) {
                  const font = await pdfDocCopy.embedFont(StandardFonts.Helvetica);
                  page.drawText(annotation.text, {
                    x: annotation.x,
                    y: pdfY,
                    size: annotation.fontSize || 16,
                    font,
                    color: rgb(
                      parseInt(annotation.color?.slice(1, 3) || '00', 16) / 255,
                      parseInt(annotation.color?.slice(3, 5) || '00', 16) / 255,
                      parseInt(annotation.color?.slice(5, 7) || '00', 16) / 255
                    ),
                  });
                }
                break;
              case 'rectangle':
                page.drawRectangle({
                  x: annotation.x,
                  y: pdfY - (annotation.height || 0),
                  width: annotation.width || 0,
                  height: annotation.height || 0,
                  borderColor: rgb(
                    parseInt(annotation.color?.slice(1, 3) || '00', 16) / 255,
                    parseInt(annotation.color?.slice(3, 5) || '00', 16) / 255,
                    parseInt(annotation.color?.slice(5, 7) || '00', 16) / 255
                  ),
                  borderWidth: 2,
                });
                break;
              case 'highlight':
                page.drawRectangle({
                  x: annotation.x,
                  y: pdfY - (annotation.height || 0),
                  width: annotation.width || 0,
                  height: annotation.height || 0,
                  color: rgb(
                    parseInt(annotation.color?.slice(1, 3) || 'FF', 16) / 255,
                    parseInt(annotation.color?.slice(3, 5) || 'FF', 16) / 255,
                    parseInt(annotation.color?.slice(5, 7) || '00', 16) / 255
                  ),
                  opacity: 0.3,
                });
                break;
              case 'image':
                if (annotation.imageData) {
                  try {
                    const imageBytes = await fetch(annotation.imageData).then(res => res.arrayBuffer());
                    const image = annotation.imageData.includes('png')
                      ? await pdfDocCopy.embedPng(imageBytes)
                      : await pdfDocCopy.embedJpg(imageBytes);

                    page.drawImage(image, {
                      x: annotation.x,
                      y: pdfY - (annotation.height || 0),
                      width: annotation.width || 0,
                      height: annotation.height || 0,
                    });
                  } catch (err) {
                    console.error('Error embedding image:', err);
                  }
                }
                break;
            }
          }
        }

        // Save the PDF
        const pdfBytes = await pdfDocCopy.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, 'edited.pdf');
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages && file) {
      setCurrentPage(newPage);
      renderPage(file, newPage);
    }
  };

  const handleClearAnnotations = () => {
    if (confirm('Clear all annotations on this page?')) {
      const newAnnotations = annotations.filter(a => a.page !== currentPage);
      setAnnotations(newAnnotations);
      if (file) renderPage(file, currentPage);
    }
  };

  const tools = [
    { id: 'select' as Tool, icon: Edit3, label: 'Select', color: 'bg-gray-700' },
    { id: 'text' as Tool, icon: Type, label: 'Text', color: 'bg-blue-600' },
    { id: 'image' as Tool, icon: ImageIcon, label: 'Image', color: 'bg-green-600' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle', color: 'bg-purple-600' },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle', color: 'bg-pink-600' },
    { id: 'line' as Tool, icon: Minus, label: 'Line', color: 'bg-yellow-600' },
    { id: 'highlight' as Tool, icon: Highlighter, label: 'Highlight', color: 'bg-yellow-400' },
    { id: 'draw' as Tool, icon: PenTool, label: 'Draw', color: 'bg-red-600' },
  ];

  return (
    <div className="section-container">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">Edit PDF</h1>
          <p className="text-xl text-gray-400">
            Advanced PDF editing tool
          </p>
          {profile && (
            <div className="glass rounded-lg px-4 py-2 inline-block">
              <span className="text-sm text-gray-400">Credits Remaining: </span>
              <span className="text-lg font-bold text-primary">{profile.credits_remaining}</span>
            </div>
          )}
        </div>

        {/* File Upload */}
        {!file && (
          <>
            <FileUpload
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={1}
              onFilesSelected={handleFilesSelected}
              multiple={false}
            />

            {/* Instructions */}
            <div className="glass rounded-xl p-6">
              <h2 className="font-semibold text-white mb-3">How to use:</h2>
              <ol className="space-y-2 text-gray-400 text-sm">
                <li>1. Upload a PDF file</li>
                <li>2. Select a tool from the toolbar</li>
                <li>3. Click and drag on the PDF to add elements</li>
                <li>4. Use Undo/Redo to manage changes</li>
                <li>5. Save your edited PDF</li>
              </ol>
            </div>
          </>
        )}

        {/* PDF Editor */}
        {file && !processing && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="glass rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Tools */}
                <div className="flex flex-wrap gap-2">
                  {tools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setSelectedTool(tool.id);
                        if (tool.id === 'image') handleInsertImage();
                      }}
                      className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                        selectedTool === tool.id
                          ? `${tool.color} text-white`
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                      title={tool.label}
                    >
                      <tool.icon className="w-4 h-4" />
                      <span className="text-sm hidden sm:inline">{tool.label}</span>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-700"></div>

                {/* Font Size */}
                {selectedTool === 'text' && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-400">Size:</label>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                      min="8"
                      max="72"
                    />
                  </div>
                )}

                {/* Color Picker */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-400">Color:</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer"
                  />
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-700"></div>

                {/* Undo/Redo */}
                <button
                  onClick={handleUndo}
                  disabled={historyStep <= 0}
                  className="px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyStep >= history.length - 1}
                  className="px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>

                {/* Clear */}
                <button
                  onClick={handleClearAnnotations}
                  className="px-3 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/70"
                  title="Clear Page"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="glass rounded-xl p-4">
              <div className="flex justify-center">
                <div className="relative inline-block">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    className="border border-gray-700 rounded cursor-crosshair max-w-full h-auto"
                    style={{ touchAction: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center justify-between glass rounded-xl p-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="text-gray-400">
                Page {currentPage} of {numPages}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= numPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            {/* Save Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSave}
                disabled={processing || annotations.length === 0}
                className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Save Edited PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Processing */}
        {processing && !file && (
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-gray-400">Loading PDF...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Hidden file input for images */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelected}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default function EditPDFPage() {
  return (
    <ProtectedTool toolId="edit-pdf" toolName="Edit PDF">
      <EditPDFContent />
    </ProtectedTool>
  );
}
