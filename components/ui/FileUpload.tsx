'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
}

export default function FileUpload({
  accept = { 'application/pdf': ['.pdf'] },
  maxSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 10,
  onFilesSelected,
  multiple = true,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError('');

      if (rejectedFiles.length > 0) {
        const errorMsg = rejectedFiles[0].errors[0].message;
        setError(errorMsg);
        return;
      }

      const newFiles = [...uploadedFiles, ...acceptedFiles];

      if (newFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setUploadedFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [uploadedFiles, maxFiles, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
          ${isDragActive
            ? 'border-primary bg-primary/10 scale-105'
            : 'border-gray-700 hover:border-primary/50 hover:bg-white/5'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className={`inline-flex p-4 rounded-full ${isDragActive ? 'bg-primary/20' : 'bg-white/5'}`}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
          </div>

          <div>
            <p className="text-lg font-semibold text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              or click to browse from your device
            </p>
            <button type="button" className="btn-secondary">
              Select Files
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Max {maxFiles} files • Up to {formatFileSize(maxSize)} each
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="glass rounded-lg p-4 flex items-center justify-between group hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <File className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
