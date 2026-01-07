import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { MODULES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function ModulesShowcase() {
  return (
    <section className="py-20 border-t border-[hsl(var(--border))]">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive Module Library
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            9 specialized modules covering everything from utilities to observability.
            Each module is independently importable for optimal bundle size.
          </p>
        </div>

        {/* Modules grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((module, index) => (
            <Link
              key={module.name}
              to={module.path}
              className={cn(
                'group relative p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]',
                'hover:border-[hsl(var(--primary)/0.5)] hover:shadow-lg',
                'transition-all duration-200',
                'animate-fade-in'
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">
                      {module.title}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                    {module.description}
                  </p>
                  <code className="mt-2 inline-block text-xs text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 rounded">
                    @oxog/kit/{module.name}
                  </code>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/api"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] font-medium hover:bg-[hsl(var(--accent))] transition-colors"
          >
            View Full API Reference
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
