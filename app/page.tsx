import { Hero, HowItWorks, Features, Guarantees, Testimonials, FAQ, CTA, Footer } from '@/components/landing';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Features />
      <Guarantees />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
