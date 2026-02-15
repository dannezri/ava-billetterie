import { Hero, HowItWorks, Footer } from '@/components/landing';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Footer />
    </div>
  );
}
