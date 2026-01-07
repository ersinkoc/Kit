import { Link } from 'react-router-dom';
import { ArrowRight, Github } from 'lucide-react';
import { InstallTabs } from '@/components/common/InstallTabs';
import { PACKAGE_NAME, DESCRIPTION, GITHUB_REPO } from '@/lib/constants';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-radial" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="container relative mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-1.5 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[hsl(var(--muted-foreground))]">
              Now available on npm
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in">
            <span className="text-gradient">{PACKAGE_NAME}</span>
          </h1>

          {/* Description */}
          <p className="mb-8 max-w-2xl text-lg md:text-xl text-[hsl(var(--muted-foreground))] animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {DESCRIPTION}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/docs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] font-medium hover:bg-[hsl(var(--accent))] transition-colors"
            >
              <Github className="h-5 w-5" />
              View on GitHub
            </a>
          </div>

          {/* Install command */}
          <div className="w-full max-w-md animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <InstallTabs />
          </div>
        </div>
      </div>
    </section>
  );
}
