import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Blog - PDFSuit',
  description: 'Tips, tutorials, and updates about PDF tools and document management.',
};

export default function BlogPage() {
  // Sample blog posts
  const posts = [
    {
      id: 1,
      title: 'How to Compress PDFs Without Losing Quality',
      excerpt: 'Learn the best techniques to reduce PDF file size while maintaining document quality for sharing and storage.',
      category: 'Tutorial',
      date: 'November 1, 2025',
      readTime: '5 min read',
      slug: 'compress-pdfs-without-losing-quality',
    },
    {
      id: 2,
      title: 'Why Client-Side PDF Processing Matters',
      excerpt: 'Discover why processing PDFs in your browser is faster, more secure, and better for your privacy.',
      category: 'Privacy',
      date: 'October 28, 2025',
      readTime: '4 min read',
      slug: 'client-side-pdf-processing',
    },
    {
      id: 3,
      title: 'Top 10 PDF Tools Every Professional Needs',
      excerpt: 'A comprehensive guide to essential PDF tools that can boost your productivity and streamline your workflow.',
      category: 'Guide',
      date: 'October 25, 2025',
      readTime: '8 min read',
      slug: 'top-pdf-tools',
    },
    {
      id: 4,
      title: 'Converting PDFs to Word: Best Practices',
      excerpt: 'Master the art of PDF to Word conversion with tips for maintaining formatting and handling complex layouts.',
      category: 'Tutorial',
      date: 'October 20, 2025',
      readTime: '6 min read',
      slug: 'pdf-to-word-best-practices',
    },
    {
      id: 5,
      title: 'Securing Your PDFs: A Complete Guide',
      excerpt: 'Everything you need to know about password protection, encryption, and keeping your documents safe.',
      category: 'Security',
      date: 'October 15, 2025',
      readTime: '7 min read',
      slug: 'securing-your-pdfs',
    },
    {
      id: 6,
      title: 'Batch Processing PDFs: Save Hours of Work',
      excerpt: 'Learn how to process multiple PDFs at once and automate repetitive document management tasks.',
      category: 'Productivity',
      date: 'October 10, 2025',
      readTime: '5 min read',
      slug: 'batch-processing-pdfs',
    },
  ];

  const categories = ['All', 'Tutorial', 'Guide', 'Privacy', 'Security', 'Productivity'];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12">
        <div className="section-container">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              PDFSuit Blog
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Tips, tutorials, and insights about PDF tools and document management
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  category === 'All'
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="card group cursor-pointer hover:border-primary/50 transition-all">
                <div className="space-y-4">
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{post.date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Coming Soon Message */}
          <div className="text-center mt-16">
            <p className="text-gray-400">
              More articles coming soon! Stay tuned for updates.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
