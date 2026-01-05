/**
 * Core runtime modules - the foundation of @oxog/kit
 *
 * @example
 * ```typescript
 * import { log, config, env, errors, events, hooks, context } from '@oxog/kit/core';
 *
 * // Use standalone modules
 * log.info('Hello from kit');
 * const port = env.number('PORT', 3000);
 * const dbUrl = config.get('database.url');
 * ```
 */

// Log module
export {
  Logger,
  createLogger,
  log,
  type LoggerOptions,
} from './log.js';

// Config module
export {
  Config,
  createConfig,
  config,
  type ConfigOptions,
} from './config.js';

// Env module
export {
  Env,
  createEnv,
  env,
} from './env.js';

// Errors module
export {
  ErrorHandler,
  createErrorHandler,
  errors,
} from './errors.js';

// Events module
export {
  Emitter,
  createEmitter,
  events,
  type EmitterOptions,
} from './events.js';

// Hooks module
export {
  Hooks,
  createHooks,
  hooks,
  type HookName,
  type HookHandler,
} from './hooks.js';

// Context module
export {
  Context,
  createContext,
  context,
} from './context.js';
