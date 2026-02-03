import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ParallaxSection } from '@/components/landing/ParallaxSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { ImageGallerySection } from '@/components/landing/ImageGallerySection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FloatingContactButton } from '@/components/landing/FloatingContactButton';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        
        <div id="features">
          <FeaturesSection />
        </div>
        
        <ParallaxSection />
        
        <BenefitsSection />
        
        <ImageGallerySection />
        
        <div id="pricing">
          <PricingSection />
        </div>
        
        <div id="testimonials">
          <TestimonialsSection />
        </div>
        <div id="faq">
        <FAQSection />
        </div>
        
        
        <CTASection />
      </main>
      
      <LandingFooter />
      
      <FloatingContactButton />
    </div>
  );
}
