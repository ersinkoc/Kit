import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CodeBlock } from '@/components/code/CodeBlock';

const exampleCode = `import { string, array } from '@oxog/kit/utils';
import { validate } from '@oxog/kit/validation';
import { jwt } from '@oxog/kit/security';
import { createQueue, retry } from '@oxog/kit/async';
import { metrics } from '@oxog/kit/observability';

// String utilities
const slug = string.slugify('Hello World!'); // 'hello-world'

// Array operations
const chunks = array.chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]

// Validation
const userSchema = validate.object({
  email: validate.string().required().email(),
  age: validate.number().min(0).max(150),
});

const result = userSchema.validate({ email: 'user@example.com', age: 25 });

// JWT
const token = jwt.sign({ userId: '123' }, 'secret', { expiresIn: '1h' });
const decoded = jwt.verify(token, 'secret');

// Async queue with concurrency control
const queue = createQueue({ concurrency: 3 });
await queue.add(() => processItem());

// Retry with exponential backoff
const data = await retry(() => fetchData(), { retries: 3, delay: 1000 });

// Metrics
const counter = metrics.counter({ name: 'requests_total' });
counter.inc();`;

export function QuickExample() {
  return (
    <section className="py-20 border-t border-[hsl(var(--border))]">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, powerful APIs
            </h2>
            <p className="text-lg text-[hsl(var(--muted-foreground))] mb-6">
              @oxog/kit provides intuitive, well-designed APIs that feel natural to use.
              Import only what you need - everything is tree-shakeable.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                'Modular imports - use only what you need',
                'Consistent API design across all modules',
                'Full TypeScript support with type inference',
                'Zero configuration required',
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/docs"
              className="inline-flex items-center gap-2 text-[hsl(var(--primary))] font-medium hover:underline"
            >
              Read the documentation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right - Code */}
          <div>
            <CodeBlock
              code={exampleCode}
              language="typescript"
              filename="example.ts"
              showLineNumbers
            />
          </div>
        </div>
      </div>
    </section>
  );
}
