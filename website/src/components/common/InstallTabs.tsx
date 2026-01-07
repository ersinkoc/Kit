import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CopyButton } from './CopyButton';
import { NPM_PACKAGE } from '@/lib/constants';

interface PackageManager {
  name: string;
  command: string;
}

const packageManagers: PackageManager[] = [
  { name: 'npm', command: `npm install ${NPM_PACKAGE}` },
  { name: 'yarn', command: `yarn add ${NPM_PACKAGE}` },
  { name: 'pnpm', command: `pnpm add ${NPM_PACKAGE}` },
  { name: 'bun', command: `bun add ${NPM_PACKAGE}` },
];

interface InstallTabsProps {
  className?: string;
}

export function InstallTabs({ className }: InstallTabsProps) {
  const [active, setActive] = useState(0);

  return (
    <div className={cn('rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden', className)}>
      {/* Tabs */}
      <div className="flex border-b border-[hsl(var(--border))]">
        {packageManagers.map((pm, index) => (
          <button
            key={pm.name}
            onClick={() => setActive(index)}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
              active === index
                ? 'bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/0.5)]'
            )}
          >
            {pm.name}
          </button>
        ))}
      </div>

      {/* Command */}
      <div className="flex items-center justify-between px-4 py-3 bg-[hsl(var(--muted)/0.3)]">
        <code className="text-sm font-mono text-[hsl(var(--foreground))]">
          {packageManagers[active].command}
        </code>
        <CopyButton text={packageManagers[active].command} showLabel={false} />
      </div>
    </div>
  );
}
