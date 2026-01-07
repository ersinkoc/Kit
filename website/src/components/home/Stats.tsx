import { Package, FileCode, TestTube, FileBox } from 'lucide-react';
import { STATS } from '@/lib/constants';

const iconMap = {
  Package,
  FileCode,
  TestTube,
  FileBox,
};

export function Stats() {
  return (
    <section className="py-16 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, index) => {
            const Icon = iconMap[stat.icon as keyof typeof iconMap];
            return (
              <div
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-3 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
