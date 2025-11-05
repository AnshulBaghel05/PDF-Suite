import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/ui/HeroSection';
import ToolsShowcase from '@/components/ui/ToolsShowcase';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ToolsShowcase />
      <Footer />
    </main>
  );
}
