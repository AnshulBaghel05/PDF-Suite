'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { TOOLS } from '@/lib/utils/constants';
import AuthNav from '@/components/layout/AuthNav';
import Header from '@/components/layout/Header';
import {
  FileText,
  Scissors,
  Minimize,
  RotateCw,
  Trash2,
  FileOutput,
  ArrowUpDown,
  Image,
  FileImage,
  Type,
  ImageDown,
  FileType,
  Lock,
  Unlock,
  KeyRound,
  Settings,
  GitCompare,
  Layers,
  Grid3x3,
  ScanText,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  FileText,
  Scissors,
  Minimize,
  RotateCw,
  Trash2,
  FileOutput,
  ArrowUpDown,
  Image,
  FileImage,
  Type,
  ImageDown,
  FileType,
  Lock,
  Unlock,
  KeyRound,
  Settings,
  GitCompare,
  Layers,
  Grid3x3,
  ScanText,
};

export default function ToolsPage() {
  const { profile, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', name: 'All Tools', count: TOOLS.length },
    { id: 'organize', name: 'Organize', count: TOOLS.filter(t => t.category === 'organize').length },
    { id: 'convert', name: 'Convert', count: TOOLS.filter(t => t.category === 'convert').length },
    { id: 'security', name: 'Security', count: TOOLS.filter(t => t.category === 'security').length },
    { id: 'edit', name: 'Edit', count: TOOLS.filter(t => t.category === 'edit').length },
    { id: 'advanced', name: 'Advanced', count: TOOLS.filter(t => t.category === 'advanced').length },
  ];

  const filteredTools = TOOLS.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'organize':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'convert':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'security':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'edit':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'advanced':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <>
      {isAuthenticated ? <AuthNav /> : <Header />}
      <main className="min-h-screen pt-24 pb-12">
        <div className="section-container">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">All PDF Tools</h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Choose from 24 powerful tools to transform your PDFs
              </p>
              {isAuthenticated && profile && (
                <div className="glass rounded-lg px-4 py-2 inline-block">
                  <span className="text-sm text-gray-400">Credits Remaining: </span>
                  <span className="text-lg font-bold text-primary">
                    {profile.plan_type === 'enterprise' ? '∞' : profile.credits_remaining}
                  </span>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="glass rounded-xl p-4 border border-gray-800">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="glass rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-white">Categories</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => {
                const Icon = iconMap[tool.icon] || FileText;
                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="glass rounded-xl p-6 border border-gray-800 hover:border-primary/50 hover:glow-red transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-all">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border capitalize ${getCategoryColor(tool.category)}`}>
                        {tool.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">{tool.description}</p>
                    <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Use Tool
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* No Results */}
            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No tools found</h3>
                <p className="text-gray-500">Try adjusting your search or filter</p>
              </div>
            )}

            {/* Info Box */}
            {!isAuthenticated && (
              <div className="glass rounded-xl p-8 border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="text-center max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold text-white mb-3">Get Started for Free</h3>
                  <p className="text-gray-400 mb-6">
                    Sign up now and get 15 free credits to use with any of our 27 tools. No credit card required!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup" className="btn-primary glow-red">
                      Sign Up Free
                    </Link>
                    <Link href="/pricing" className="btn-secondary">
                      View Pricing
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
