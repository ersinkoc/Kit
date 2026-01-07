import { Link } from 'react-router-dom';
import { ArrowRight, Package, FileCode, Shield, Zap } from 'lucide-react';
import { CodeBlock } from '@/components/code/CodeBlock';

const quickStartCode = `import { string, array } from '@oxog/kit/utils';
import { validate } from '@oxog/kit/validation';
import { jwt } from '@oxog/kit/security';

// Use immediately - no configuration needed
const slug = string.slugify('Hello World!');
const schema = validate.object({ email: validate.string().email() });
const token = jwt.sign({ id: 1 }, 'secret');`;

export function Introduction() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <h1 className="text-4xl font-bold mb-4">Introduction</h1>
        <p className="text-xl text-[hsl(var(--muted-foreground))]">
          @oxog/kit is a comprehensive, zero-dependency Node.js standard library for modern TypeScript applications.
        </p>
      </div>

      {/* Key features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
        {[
          {
            icon: Package,
            title: 'Zero Dependencies',
            description: 'No external packages. Uses only built-in Node.js APIs.',
          },
          {
            icon: FileCode,
            title: 'TypeScript-First',
            description: 'Full type safety with comprehensive type definitions.',
          },
          {
            icon: Shield,
            title: 'Production-Ready',
            description: 'Battle-tested with 1000+ tests and high coverage.',
          },
          {
            icon: Zap,
            title: 'Tree-Shakeable',
            description: 'Import only what you need for optimal bundle size.',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
          >
            <feature.icon className="h-6 w-6 text-[hsl(var(--primary))] mb-2" />
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* What's included */}
      <div>
        <h2 className="text-2xl font-bold mb-4">What's Included</h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-4">
          @oxog/kit provides 9 specialized modules covering all aspects of application development:
        </p>
        <ul className="space-y-2">
          {[
            { name: 'utils', desc: 'String, array, object, date, math, and random utilities' },
            { name: 'validation', desc: 'Schema validation, sanitization, and transformation' },
            { name: 'security', desc: 'JWT, password hashing, encryption, and crypto utilities' },
            { name: 'core', desc: 'Logging, events, configuration, context, and errors' },
            { name: 'async', desc: 'Queue, retry, circuit breaker, rate limiter, mutex' },
            { name: 'observability', desc: 'Metrics, health checks, and distributed tracing' },
            { name: 'network', desc: 'HTTP client, WebSocket, and SSE clients' },
            { name: 'data', desc: 'Cache, store, and session management' },
            { name: 'parsing', desc: 'JSON, URL, query string, and MIME type parsing' },
          ].map((module) => (
            <li key={module.name} className="flex items-start gap-3">
              <code className="px-2 py-0.5 rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm shrink-0">
                {module.name}
              </code>
              <span className="text-[hsl(var(--muted-foreground))]">{module.desc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick example */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Example</h2>
        <CodeBlock code={quickStartCode} language="typescript" filename="example.ts" />
      </div>

      {/* Next steps */}
      <div className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/docs/installation"
            className="flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.5)] transition-colors group"
          >
            <div>
              <div className="font-semibold">Installation</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Get started in seconds</div>
            </div>
            <ArrowRight className="h-5 w-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] group-hover:translate-x-1 transition-all" />
          </Link>
          <Link
            to="/docs/quick-start"
            className="flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.5)] transition-colors group"
          >
            <div>
              <div className="font-semibold">Quick Start</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Build your first app</div>
            </div>
            <ArrowRight className="h-5 w-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
