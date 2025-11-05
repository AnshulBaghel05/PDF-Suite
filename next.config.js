/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  swcMinify: true,

  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Optimize chunk loading
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate PDF libraries into their own chunk
            pdfLibs: {
              test: /[\\/]node_modules[\\/](pdf-lib|pdfjs-dist|jspdf)[\\/]/,
              name: 'pdf-libs',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Separate utilities
            utils: {
              test: /[\\/]node_modules[\\/](file-saver|jszip|mammoth|docx)[\\/]/,
              name: 'utils',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Default vendor chunk
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },

  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

module.exports = nextConfig;
