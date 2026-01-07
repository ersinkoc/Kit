import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MODULES } from '@/lib/constants';
import {
  Book,
  Download,
  Rocket,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const DOCS_NAV = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', path: '/docs', icon: Book },
      { label: 'Installation', path: '/docs/installation', icon: Download },
      { label: 'Quick Start', path: '/docs/quick-start', icon: Rocket },
    ],
  },
  {
    title: 'Modules',
    items: MODULES.map((mod) => ({
      label: mod.title,
      path: mod.path,
      icon: Layers,
    })),
  },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside className={cn('w-64 shrink-0', className)}>
      <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pr-4 pb-8">
        <nav className="space-y-6">
          {DOCS_NAV.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm mb-2 text-[hsl(var(--foreground))]">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/docs'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-medium'
                            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
