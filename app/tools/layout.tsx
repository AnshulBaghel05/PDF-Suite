import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12">
        {children}
      </main>
      <Footer />
    </>
  );
}
