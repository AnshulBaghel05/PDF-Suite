'use client';

import Link from 'next/link';
import { TOOLS } from '@/lib/utils/constants';
import * as Icons from 'lucide-react';
import { useState } from 'react';

type IconName = keyof typeof Icons;

export default function ToolsShowcase() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Tools' },
    { id: 'basic', name: 'Basic' },
    { id: 'convert', name: 'Convert' },
    { id: 'edit', name: 'Edit' },
    { id: 'security', name: 'Security' },
    { id: 'advanced', name: 'Advanced' },
  ];

  const filteredTools = activeCategory === 'all'
    ? TOOLS
    : TOOLS.filter(tool => tool.category === activeCategory);

  return (
    <section id="tools" className="section-container">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gradient">
          All-in-One PDF Toolkit
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Everything you need to work with PDFs, powered by cutting-edge technology
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeCategory === category.id
                ? 'bg-primary text-white glow-red'
                : 'glass hover:bg-white/10 text-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool, index) => {
          const IconComponent = Icons[tool.icon as IconName] as React.ComponentType<{ className?: string }>;

          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="tool-card group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Icon */}
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  {IconComponent && <IconComponent className="w-8 h-8 text-primary" />}
                </div>

                {/* Tool Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-white text-lg group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {tool.description}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icons.ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-3">
            Ready to get started?
          </h3>
          <p className="text-gray-400 mb-6">
            Sign up now and get 10 free conversions to try all our tools
          </p>
          <Link href="/signup" className="btn-primary inline-flex items-center space-x-2">
            <span>Start Free Trial</span>
            <Icons.ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
