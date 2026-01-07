import { Heart, Github, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PACKAGE_NAME, GITHUB_REPO, NPM_PACKAGE, VERSION, AUTHOR, AUTHOR_GITHUB } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)]">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(199,89%,48%)]">
                <span className="text-white font-mono text-sm font-bold">K</span>
              </div>
              <span>{PACKAGE_NAME}</span>
            </Link>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Zero-dependency Node.js standard library for modern TypeScript applications.
            </p>
          </div>

          {/* Documentation */}
          <div>
            <h3 className="font-semibold mb-4">Documentation</h3>
            <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <Link to="/docs" className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Introduction
                </Link>
              </li>
              <li>
                <Link to="/docs/installation" className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Installation
                </Link>
              </li>
              <li>
                <Link to="/docs/quick-start" className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Quick Start
                </Link>
              </li>
              <li>
                <Link to="/api" className="hover:text-[hsl(var(--foreground))] transition-colors">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Modules */}
          <div>
            <h3 className="font-semibold mb-4">Modules</h3>
            <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <Link to="/docs/modules/utils" className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Utilities
                </Link>
              </li>
              <li>
                <Link to="/docs/modules/validation" className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Validation
                </Link>
              </li>
              <li>
                <Link to="/docs/modules/security" className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/docs/modules/async" className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Async
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <a
                  href={`https://github.com/${GITHUB_REPO}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={`https://www.npmjs.com/package/${NPM_PACKAGE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  <Package className="h-4 w-4" />
                  npm
                </a>
              </li>
              <li>
                <Link to="/examples" className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Examples
                </Link>
              </li>
              <li>
                <Link to="/playground" className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Playground
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[hsl(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Made with love */}
          <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
            Made with{' '}
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />{' '}
            by{' '}
            <a
              href={`https://github.com/${AUTHOR_GITHUB}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
            >
              {AUTHOR}
            </a>
          </div>

          {/* Version & License */}
          <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
            <span>v{VERSION}</span>
            <span className="text-[hsl(var(--border))]">|</span>
            <span>MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
