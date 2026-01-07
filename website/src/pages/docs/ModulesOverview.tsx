import { Link } from 'react-router-dom';
import { MODULES } from '@/lib/constants';
import { Layers, ArrowRight } from 'lucide-react';

export function ModulesOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Modules</h1>
        <p className="text-xl text-[hsl(var(--muted-foreground))]">
          @oxog/kit is organized into 9 specialized modules, each focusing on a specific domain.
        </p>
      </div>

      <div className="grid gap-4 not-prose">
        {MODULES.map((module) => (
          <Link
            key={module.name}
            to={module.path}
            className="group flex items-start gap-4 p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.5)] hover:shadow-lg transition-all"
          >
            <div className="p-2 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{module.title}</h3>
                <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                {module.description}
              </p>
              <code className="text-xs text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 rounded">
                import ... from '@oxog/kit/{module.name}'
              </code>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
