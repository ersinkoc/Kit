export const PACKAGE_NAME = '@oxog/kit';
export const PACKAGE_SHORT_NAME = 'kit';
export const GITHUB_REPO = 'oxog/kit';
export const NPM_PACKAGE = '@oxog/kit';
export const VERSION = '1.0.0';
export const DESCRIPTION = 'Zero-dependency Node.js standard library for modern TypeScript applications';
export const DOMAIN = 'kit.oxog.dev';
export const AUTHOR = 'Ersin KOC';
export const AUTHOR_GITHUB = 'ersinkoc';

export const FEATURES = [
  {
    title: 'Zero Dependencies',
    description: 'No external packages required. Uses only built-in Node.js APIs.',
    icon: 'Package',
  },
  {
    title: 'TypeScript-First',
    description: 'Full type safety with comprehensive type definitions and inference.',
    icon: 'FileCode',
  },
  {
    title: 'Tree-Shakeable',
    description: 'Import only what you need for optimal bundle size.',
    icon: 'TreePine',
  },
  {
    title: 'Production-Ready',
    description: 'Battle-tested with comprehensive error handling.',
    icon: 'Shield',
  },
  {
    title: 'Modern Patterns',
    description: 'Async/await, ES modules, and latest JavaScript features.',
    icon: 'Sparkles',
  },
  {
    title: 'Fully Tested',
    description: '1000+ tests with high coverage across all modules.',
    icon: 'CheckCircle',
  },
];

export const MODULES = [
  {
    name: 'utils',
    title: 'Utilities',
    description: 'String, array, object, date, math, and random utilities',
    path: '/docs/modules/utils',
  },
  {
    name: 'validation',
    title: 'Validation',
    description: 'Schema validation, sanitization, and transformation',
    path: '/docs/modules/validation',
  },
  {
    name: 'security',
    title: 'Security',
    description: 'JWT, password hashing, encryption, and crypto utilities',
    path: '/docs/modules/security',
  },
  {
    name: 'core',
    title: 'Core',
    description: 'Logging, events, configuration, context, and errors',
    path: '/docs/modules/core',
  },
  {
    name: 'async',
    title: 'Async',
    description: 'Queue, retry, circuit breaker, rate limiter, mutex',
    path: '/docs/modules/async',
  },
  {
    name: 'observability',
    title: 'Observability',
    description: 'Metrics, health checks, and distributed tracing',
    path: '/docs/modules/observability',
  },
  {
    name: 'network',
    title: 'Network',
    description: 'HTTP client, WebSocket, and SSE clients',
    path: '/docs/modules/network',
  },
  {
    name: 'data',
    title: 'Data',
    description: 'Cache, store, and session management',
    path: '/docs/modules/data',
  },
  {
    name: 'parsing',
    title: 'Parsing',
    description: 'JSON, URL, query string, and MIME type parsing',
    path: '/docs/modules/parsing',
  },
];

export const NAV_ITEMS = [
  { label: 'Docs', path: '/docs' },
  { label: 'API', path: '/api' },
  { label: 'Examples', path: '/examples' },
  { label: 'Playground', path: '/playground' },
];

export const STATS = [
  { label: 'Zero Dependencies', value: '0', icon: 'Package' },
  { label: 'TypeScript', value: '100%', icon: 'FileCode' },
  { label: 'Test Coverage', value: '95%+', icon: 'TestTube' },
  { label: 'Bundle Size', value: '<50KB', icon: 'FileBox' },
];
