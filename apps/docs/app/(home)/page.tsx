import { StarRain } from '@/components/star-rain';
import { HeroSection } from './_components/hero-section';

export default function HomePage() {
  return (
    <main>
      <HeroSection />

      <StarRain starCount={500} backgroundColor="black" />
    </main>
  );
}
