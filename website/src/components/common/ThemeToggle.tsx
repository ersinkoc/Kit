import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="relative">
      <button
        className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
        onClick={() => setShowMenu(!showMenu)}
        aria-label={`Current theme: ${resolvedTheme}. Click to change.`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[140px] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-1 shadow-lg">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  theme === value
                    ? 'bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
                )}
                onClick={() => {
                  setTheme(value);
                  setShowMenu(false);
                }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
