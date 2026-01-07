import {
  Package,
  FileCode,
  TreePine,
  Shield,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FEATURES } from '@/lib/constants';

const iconMap = {
  Package,
  FileCode,
  TreePine,
  Shield,
  Sparkles,
  CheckCircle,
};

export function Features() {
  return (
    <section className="py-20 border-t border-[hsl(var(--border))]">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why @oxog/kit?
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Everything you need for building robust Node.js applications, without the dependency bloat.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <div
                key={feature.title}
                className={cn(
                  'group relative p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]',
                  'hover:border-[hsl(var(--primary)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.05)]',
                  'transition-all duration-300',
                  'animate-fade-in'
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className="mb-4 inline-flex p-3 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  {feature.description}
                </p>

                {/* Hover gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
