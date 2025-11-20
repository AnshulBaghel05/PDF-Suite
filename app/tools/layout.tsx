'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import AuthNav from '@/components/layout/AuthNav';
import Footer from '@/components/layout/Footer';

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuthContext();

  return (
    <>
      {loading ? null : isAuthenticated ? <AuthNav /> : <Header />}
      <main className="min-h-screen pt-24 pb-12">
        {children}
      </main>
      <Footer />
    </>
  );
}
