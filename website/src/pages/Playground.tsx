import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_CODE = `// Try @oxog/kit in the playground!
// Note: This is a demo - actual execution requires a backend

import { string, array } from '@oxog/kit/utils';
import { validate } from '@oxog/kit/validation';

// String utilities
const slug = string.slugify('Hello World!');
console.log('Slug:', slug);

// Array utilities
const chunks = array.chunk([1, 2, 3, 4, 5, 6], 2);
console.log('Chunks:', chunks);

// Validation
const schema = validate.object({
  email: validate.string().required().email(),
  age: validate.number().min(0),
});

const result = schema.validate({
  email: 'user@example.com',
  age: 25,
});

console.log('Valid:', result.valid);
console.log('Data:', result.data);
`;

const PRESETS = [
  { label: 'Basic Usage', code: DEFAULT_CODE },
  {
    label: 'Validation',
    code: `import { validate } from '@oxog/kit/validation';

const userSchema = validate.object({
  name: validate.string().required().min(2),
  email: validate.string().required().email(),
  password: validate.string().required().min(8),
  age: validate.number().optional().min(13),
  roles: validate.array(validate.string()).default(['user']),
});

// Valid data
const validResult = userSchema.validate({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepass123',
  age: 25,
});
console.log('Valid result:', validResult);

// Invalid data
const invalidResult = userSchema.validate({
  name: 'J',
  email: 'invalid-email',
  password: '123',
});
console.log('Invalid result:', invalidResult);
`,
  },
  {
    label: 'Security',
    code: `import { jwt, crypto } from '@oxog/kit/security';

// Generate a secure key
const secretKey = crypto.generateKey();
console.log('Secret key:', secretKey);

// Create a JWT token
const token = jwt.sign(
  {
    userId: '12345',
    role: 'admin',
    permissions: ['read', 'write'],
  },
  secretKey,
  { expiresIn: '1h' }
);
console.log('JWT Token:', token);

// Decode the token (without verification)
const decoded = jwt.decode(token);
console.log('Decoded:', decoded);

// Verify the token
const verified = jwt.verify(token, secretKey);
console.log('Verified payload:', verified);
`,
  },
  {
    label: 'Async Patterns',
    code: `import { createQueue, retry, debounce, throttle } from '@oxog/kit/async';

// Task Queue
const queue = createQueue({ concurrency: 2 });

console.log('Adding 5 tasks to queue...');
for (let i = 1; i <= 5; i++) {
  queue.add(async () => {
    console.log(\`Task \${i} started\`);
    await new Promise(r => setTimeout(r, 100));
    console.log(\`Task \${i} completed\`);
    return i;
  });
}

console.log('Pending:', queue.size);
console.log('Running:', queue.pending);

// Debounce example
const debouncedLog = debounce((msg) => {
  console.log('Debounced:', msg);
}, 300);

// Throttle example
const throttledLog = throttle((msg) => {
  console.log('Throttled:', msg);
}, 500);
`,
  },
];

export function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setOutput(['// Running code...', '']);

    // Simulate execution (in a real app, this would send to a backend)
    setTimeout(() => {
      setOutput([
        '// Output:',
        'Slug: hello-world',
        'Chunks: [[1, 2], [3, 4], [5, 6]]',
        'Valid: true',
        'Data: { email: "user@example.com", age: 25 }',
        '',
        '// Note: This is a simulated output.',
        '// In production, code would be executed on a secure backend.',
      ]);
      setIsRunning(false);
    }, 500);
  };

  const resetCode = () => {
    setCode(DEFAULT_CODE);
    setOutput([]);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Playground</h1>
        <p className="text-xl text-[hsl(var(--muted-foreground))]">
          Experiment with @oxog/kit APIs in real-time.
        </p>
      </div>

      {/* Presets */}
      <div className="flex gap-2 flex-wrap mb-4">
        {PRESETS.map((preset, index) => (
          <button
            key={index}
            onClick={() => setCode(preset.code)}
            className="px-3 py-1.5 rounded-lg text-sm bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-sm text-[hsl(var(--muted-foreground))] font-mono">
                playground.ts
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={runCode}
                disabled={isRunning}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  'bg-[hsl(var(--primary))] text-white hover:opacity-90',
                  isRunning && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Play className="w-4 h-4" />
                Run
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-[500px] p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <span className="text-sm text-[hsl(var(--muted-foreground))] font-mono">
              Output
            </span>
          </div>
          <div className="h-[500px] p-4 font-mono text-sm overflow-auto">
            {output.length === 0 ? (
              <span className="text-[hsl(var(--muted-foreground))]">
                // Click "Run" to execute the code
              </span>
            ) : (
              output.map((line, index) => (
                <div key={index} className={line.startsWith('//') ? 'text-[hsl(var(--muted-foreground))]' : ''}>
                  {line || '\u00A0'}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-[hsl(var(--muted)/0.3)] text-sm text-[hsl(var(--muted-foreground))]">
        <strong>Note:</strong> This playground simulates code execution. In a production environment,
        code would be securely executed on a backend service.
      </div>
    </div>
  );
}
