'use client';

import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import ProtectedTool from '@/components/tools/ProtectedTool';

function EditPDFContent() {
  const { profile } = useAuth();

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Construction className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">Edit PDF</h1>
          </div>
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

        {/* Coming Soon Card */}
        <div className="glass rounded-xl p-12 border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-6 bg-primary/20 rounded-full">
                <Construction className="w-16 h-16 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Coming Soon</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                We're working hard to bring you a powerful PDF editor with text editing,
                image insertion, drawing tools, and more.
              </p>
            </div>

            <div className="glass rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-white font-semibold mb-4">Planned Features:</h3>
              <div className="grid md:grid-cols-2 gap-3 text-left">
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-gray-400">Add and edit text</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-gray-400">Insert images and logos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-gray-400">Draw shapes and annotations</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-gray-400">Highlight and markup</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-gray-400">Digital signatures</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-gray-400">Form field editing</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/tools" className="btn-primary glow-red">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse All Tools
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Alternative Tools */}
        <div className="glass rounded-xl p-6 border border-gray-800">
          <h3 className="text-white font-semibold mb-4">Try These Tools Instead:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/tools/add-watermark"
              className="glass rounded-lg p-4 border border-gray-700 hover:border-primary/50 transition-all group"
            >
              <p className="text-white font-medium group-hover:text-primary transition-colors">Add Watermark</p>
              <p className="text-gray-400 text-sm mt-1">Add text or image watermark</p>
            </Link>
            <Link
              href="/tools/page-numbers"
              className="glass rounded-lg p-4 border border-gray-700 hover:border-primary/50 transition-all group"
            >
              <p className="text-white font-medium group-hover:text-primary transition-colors">Page Numbers</p>
              <p className="text-gray-400 text-sm mt-1">Add numbering and headers</p>
            </Link>
            <Link
              href="/tools/edit-metadata"
              className="glass rounded-lg p-4 border border-gray-700 hover:border-primary/50 transition-all group"
            >
              <p className="text-white font-medium group-hover:text-primary transition-colors">Edit Metadata</p>
              <p className="text-gray-400 text-sm mt-1">Edit PDF properties</p>
            </Link>
          </div>
        </div>
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
