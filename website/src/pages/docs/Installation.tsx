import { CodeBlock } from '@/components/code/CodeBlock';
import { InstallTabs } from '@/components/common/InstallTabs';

const importExample = `// Import specific modules
import { string, array } from '@oxog/kit/utils';
import { validate } from '@oxog/kit/validation';
import { jwt, hash } from '@oxog/kit/security';
import { log, createEventEmitter } from '@oxog/kit/core';
import { createQueue, retry } from '@oxog/kit/async';
import { metrics, createHealthChecker } from '@oxog/kit/observability';
import { http, createWebSocket } from '@oxog/kit/network';
import { createCache } from '@oxog/kit/data';
import { json, url } from '@oxog/kit/parsing';`;

const tsconfigExample = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}`;

export function Installation() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Installation</h1>
        <p className="text-xl text-[hsl(var(--muted-foreground))]">
          Get @oxog/kit installed in your project in seconds.
        </p>
      </div>

      {/* Requirements */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Requirements</h2>
        <ul className="list-disc list-inside space-y-2 text-[hsl(var(--muted-foreground))]">
          <li>Node.js 18 or later</li>
          <li>TypeScript 5.0+ (recommended)</li>
          <li>ES2022 target or later</li>
        </ul>
      </div>

      {/* Install */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Install</h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-4">
          Choose your preferred package manager:
        </p>
        <InstallTabs className="max-w-lg" />
      </div>

      {/* Import */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Import Modules</h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-4">
          @oxog/kit is organized into focused modules that you import separately.
          This allows for tree-shaking - only the code you import is included in your bundle.
        </p>
        <CodeBlock code={importExample} language="typescript" filename="app.ts" />
      </div>

      {/* TypeScript Config */}
      <div>
        <h2 className="text-2xl font-bold mb-4">TypeScript Configuration</h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-4">
          Recommended tsconfig.json settings for optimal TypeScript support:
        </p>
        <CodeBlock code={tsconfigExample} language="json" filename="tsconfig.json" />
      </div>

      {/* Verification */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Verify Installation</h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-4">
          Create a simple test file to verify everything is working:
        </p>
        <CodeBlock
          code={`import { string } from '@oxog/kit/utils';

console.log(string.slugify('Hello World!'));
// Output: 'hello-world'`}
          language="typescript"
          filename="test.ts"
        />
        <p className="text-[hsl(var(--muted-foreground))] mt-4">
          Run with: <code className="px-2 py-0.5 rounded bg-[hsl(var(--muted))]">npx tsx test.ts</code>
        </p>
      </div>
    </div>
  );
}
