import { StarRain } from '@/components/star-rain';
import { Faqs } from './_components/faqs';
import { FirstFeaturesSection } from './_components/features';
import { HeroSection } from './_components/hero-section';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FirstFeaturesSection />
      <Faqs />

      <StarRain starCount={500} backgroundColor="black" />
    </main>
  );
}
