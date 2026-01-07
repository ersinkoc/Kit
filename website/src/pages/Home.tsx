import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Stats } from '@/components/home/Stats';
import { QuickExample } from '@/components/home/QuickExample';
import { ModulesShowcase } from '@/components/home/ModulesShowcase';

export function Home() {
  return (
    <div>
      <Hero />
      <Stats />
      <Features />
      <QuickExample />
      <ModulesShowcase />
    </div>
  );
}
