import { Link, NavLink } from 'react-router-dom';
import { Github, Star, Package, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { PACKAGE_NAME, GITHUB_REPO, NPM_PACKAGE, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background)/0.95)] backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background)/0.6)]">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(199,89%,48%)]">
            <span className="text-white font-mono text-sm font-bold">K</span>
          </div>
          <span className="hidden sm:inline">{PACKAGE_NAME}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[hsl(var(--foreground))] bg-[hsl(var(--accent))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/0.5)]'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* GitHub Star Button */}
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors text-sm font-medium"
          >
            <Star className="h-4 w-4" />
            <span>Star</span>
          </a>

          {/* npm link */}
          <a
            href={`https://www.npmjs.com/package/${NPM_PACKAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
            aria-label="npm package"
          >
            <Package className="h-5 w-5" />
          </a>

          {/* GitHub link */}
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
            aria-label="GitHub repository"
          >
            <Github className="h-5 w-5" />
          </a>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[hsl(var(--border))]">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-[hsl(var(--foreground))] bg-[hsl(var(--accent))]'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/0.5)]'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[hsl(var(--border))]">
              <a
                href={`https://github.com/${GITHUB_REPO}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors text-sm"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <a
                href={`https://www.npmjs.com/package/${NPM_PACKAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors text-sm"
              >
                <Package className="h-4 w-4" />
                npm
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
