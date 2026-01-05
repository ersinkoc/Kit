# @oxog/kit - Implementation Task List

This document contains an ordered, sequential list of all tasks required to implement @oxog/kit. Each task must be completed before moving to the next.

## Phase 1: Project Foundation

### 1.1 Initialize Project Structure
- [ ] Create root directory structure
- [ ] Create src/ with category subdirectories
- [ ] Create tests/ with category subdirectories
- [ ] Create examples/ with numbered folders
- [ ] Create website/ directory
- [ ] Create .github/workflows/ directory

**Dependencies**: None

### 1.2 Create Configuration Files
- [ ] package.json (zero runtime dependencies)
- [ ] tsconfig.json (strict mode enabled)
- [ ] tsup.config.ts (dual ESM/CJS build)
- [ ] vitest.config.ts (100% coverage thresholds)
- [ ] .eslintrc.json
- [ ] .prettierrc
- [ ] .gitignore

**Dependencies**: 1.1

### 1.3 Create Base Type Definitions
- [ ] src/types.ts (shared types)
- [ ] src/types/kernel.ts (Kernel interface)
- [ ] src/types/modules.ts (Module interfaces)

**Dependencies**: 1.1

### 1.4 Create Base Error Classes
- [ ] src/errors.ts (KitError base class)
- [ ] All error types (ValidationError, NetworkError, TimeoutError, ConfigError, NotFoundError, AuthError)

**Dependencies**: 1.3

## Phase 2: Micro-Kernel Core

### 2.1 Implement Kernel Core
- [ ] src/kernel.ts (Kernel class, plugin registry, lifecycle)
- [ ] Event bus implementation
- [ ] Context integration with AsyncLocalStorage
- [ ] Plugin registration and resolution

**Dependencies**: 1.4

### 2.2 Implement createKit Factory
- [ ] src/index.ts (main entry point)
- [ ] createKit() factory function
- [ ] Module initialization orchestration
- [ ] Type exports

**Dependencies**: 2.1

### 2.3 Write Kernel Tests
- [ ] tests/unit/kernel.spec.ts
- [ ] Plugin lifecycle tests
- [ ] Event emission tests
- [ ] Context propagation tests

**Dependencies**: 2.1, 2.2

## Phase 3: Core Runtime Modules

### 3.1 Implement Log Module
- [ ] src/core/log.ts (createLogger, Logger class)
- [ ] Log levels (debug, info, warn, error, fatal)
- [ ] JSON and pretty formatters
- [ ] Child logger functionality
- [ ] Silent mode for testing
- [ ] src/core/index.ts export

**Dependencies**: 2.2

### 3.2 Test Log Module
- [ ] tests/unit/core/log.spec.ts
- [ ] Test all log levels
- [ ] Test child loggers
- [ ] Test formatters
- [ ] Test silent mode

**Dependencies**: 3.1

### 3.3 Implement Config Module
- [ ] src/core/config.ts (createConfig)
- [ ] Dot notation access
- [ ] Default values
- [ ] Environment variable override
- [ ] File loading (JSON, YAML, TOML via parse)
- [ ] Proxy-based get/set/has

**Dependencies**: 3.1, 5.1 (parse module needed first)

**NOTE**: Skip to 5.1 (Parse Module) first, then return to 3.3

### 3.4 Test Config Module
- [ ] tests/unit/core/config.spec.ts
- [ ] Test dot notation
- [ ] Test env override
- [ ] Test file loading
- [ ] Test required keys

**Dependencies**: 3.3

### 3.5 Implement Env Module
- [ ] src/core/env.ts (createEnv)
- [ ] Typed getters (string, number, boolean, array, json, url, port)
- [ ] Required validation
- [ ] NODE_ENV helpers
- [ ] Dotenv parsing

**Dependencies**: 2.2

### 3.6 Test Env Module
- [ ] tests/unit/core/env.spec.ts
- [ ] Test all typed getters
- [ ] Test required validation
- [ ] Test NODE_ENV helpers
- [ ] Test dotenv parsing

**Dependencies**: 3.5

### 3.7 Implement Errors Module
- [ ] src/core/errors.ts (createErrorHandler)
- [ ] Error creation with codes
- [ ] Error wrapping
- [ ] capture/captureAsync helpers
- [ ] Global error events

**Dependencies**: 2.2

### 3.8 Test Errors Module
- [ ] tests/unit/core/errors.spec.ts
- [ ] Test error creation
- [ ] Test error wrapping
- [ ] Test capture helpers
- [ ] Test error events

**Dependencies**: 3.7

### 3.9 Implement Events Module
- [ ] src/core/events.ts (createEmitter)
- [ ] on/once/off/emit
- [ ] Wildcard support (* and user:*)
- [ ] emitAsync for async handlers
- [ ] Listener count tracking

**Dependencies**: 2.2

### 3.10 Test Events Module
- [ ] tests/unit/core/events.spec.ts
- [ ] Test basic events
- [ ] Test wildcards
- [ ] Test async emission
- [ ] Test once
- [ ] Test removal

**Dependencies**: 3.9

### 3.11 Implement Hooks Module
- [ ] src/core/hooks.ts (createHooks)
- [ ] Lifecycle hooks (init, start, stop, error, shutdown)
- [ ] Request hooks (before, after)
- [ ] Hook execution with priority
- [ ] Error handling in hooks

**Dependencies**: 3.9

### 3.12 Test Hooks Module
- [ ] tests/unit/core/hooks.spec.ts
- [ ] Test lifecycle hooks
- [ ] Test request hooks
- [ ] Test priority ordering
- [ ] Test error handling

**Dependencies**: 3.11

### 3.13 Implement Context Module
- [ ] src/core/context.ts (createContext)
- [ ] AsyncLocalStorage wrapper
- [ ] run/get/set methods
- [ ] with helper
- [ ] getStore

**Dependencies**: 2.2

### 3.14 Test Context Module
- [ ] tests/unit/core/context.spec.ts
- [ ] Test context propagation
- [ ] Test nesting
- [ ] Test get/set
- [ ] Test with helper

**Dependencies**: 3.13

### 3.15 Create Core Index
- [ ] src/core/index.ts (export all core modules)
- [ ] Update package.json exports

**Dependencies**: 3.2, 3.4, 3.6, 3.8, 3.10, 3.12, 3.14

## Phase 4: Parsing & Format (Foundation)

### 4.1 Implement Parse Module
- [ ] src/parsing/parse.ts (createParser)
- [ ] JSON (with comments)
- [ ] YAML subset parser
- [ ] TOML parser
- [ ] CSV parser
- [ ] INI parser
- [ ] Dotenv parser
- [ ] Basic XML parser
- [ ] Query string parser
- [ ] URL parser
- [ ] Semver parser
- [ ] Bytes parser
- [ ] Duration parser
- [ ] Color parser
- [ ] Cron parser
- [ ] Date parser

**Dependencies**: 2.2

### 4.2 Test Parse Module
- [ ] tests/unit/parsing/parse.spec.ts
- [ ] Test all format parsers
- [ ] Test error handling
- [ ] Test edge cases

**Dependencies**: 4.1

### 4.3 Implement Format Module
- [ ] src/parsing/format.ts (createFormatter)
- [ ] Date formatting with patterns
- [ ] Number formatting
- [ ] Currency formatting
- [ ] Percentage formatting
- [ ] Bytes formatting
- [ ] Duration formatting
- [ ] Relative time
- [ ] Ordinal numbers
- [ ] Pluralization
- [ ] List formatting
- [ ] Pretty JSON
- [ ] ASCII table
- [ ] String truncation
- [ ] Padding
- [ ] Masking

**Dependencies**: 2.2

### 4.4 Test Format Module
- [ ] tests/unit/parsing/format.spec.ts
- [ ] Test all formatters
- [ ] Test patterns
- [ ] Test locales

**Dependencies**: 4.3

### 4.5 Create Parsing Index
- [ ] src/parsing/index.ts (export parse and format)
- [ ] Update package.json exports

**Dependencies**: 4.2, 4.4

**Now return to Phase 3, Task 3.3 (Config Module)**

## Phase 5: Validation Modules

### 5.1 Implement Validate Module
- [ ] src/validation/validate.ts (createValidator)
- [ ] Schema builder (string, number, boolean, array, object, enum, literal, union, optional, nullable)
- [ ] Chainable modifiers (min, max, length, email, url, uuid, regex, trim, lowercase, uppercase)
- [ ] parse method (throws)
- [ ] safeParse method (returns result)
- [ ] Type inference

**Dependencies**: 2.2

### 5.2 Test Validate Module
- [ ] tests/unit/validation/validate.spec.ts
- [ ] Test all validators
- [ ] Test modifiers
- [ ] Test type inference
- [ ] Test error messages

**Dependencies**: 5.1

### 5.3 Implement Transform Module
- [ ] src/validation/transform.ts (createTransformer)
- [ ] pipe for chaining
- [ ] map, filter, reduce
- [ ] flatten, unique
- [ ] groupBy, sortBy, keyBy
- [ ] pick, omit, rename, defaults
- [ ] compact, pluck

**Dependencies**: 2.2

### 5.4 Test Transform Module
- [ ] tests/unit/validation/transform.spec.ts
- [ ] Test all transformers
- [ ] Test pipe composition
- [ ] Test immutability

**Dependencies**: 5.3

### 5.5 Implement Sanitize Module
- [ ] src/validation/sanitize.ts (createSanitizer)
- [ ] HTML escape
- [ ] SQL escape
- [ ] Regex escape
- [ ] Filename sanitization
- [ ] Path traversal prevention
- [ ] URL validation and cleaning
- [ ] Email normalization
- [ ] Alphanumeric filter
- [ ] Trim and normalize

**Dependencies**: 2.2

### 5.6 Test Sanitize Module
- [ ] tests/unit/validation/sanitize.spec.ts
- [ ] Test all sanitizers
- [ ] Test XSS prevention
- [ ] Test SQL injection prevention
- [ ] Test path traversal prevention

**Dependencies**: 5.5

### 5.7 Create Validation Index
- [ ] src/validation/index.ts (export all validation modules)
- [ ] Update package.json exports

**Dependencies**: 5.2, 5.4, 5.6

## Phase 6: Data & Storage Modules

### 6.1 Implement Cache Module
- [ ] src/data/cache.ts (createCache)
- [ ] get/set/has/delete
- [ ] TTL support (string and ms)
- [ ] LRU eviction
- [ ] Max size enforcement
- [ ] getOrSet for lazy loading
- [ ] Multi-get/set (mget/mset)
- [ ] Wrap for memoization

**Dependencies**: 2.2

### 6.2 Test Cache Module
- [ ] tests/unit/data/cache.spec.ts
- [ ] Test basic operations
- [ ] Test TTL expiration
- [ ] Test LRU eviction
- [ ] Test max size
- [ ] Test multi operations

**Dependencies**: 6.1

### 6.3 Implement Store Module
- [ ] src/data/store.ts (createStore)
- [ ] get/set/has/delete/clear
- [ ] File-based JSON persistence
- [ ] Atomic writes (temp + rename)
- [ ] Auto-create directory
- [ ] Debounced writes
- [ ] Sync and async APIs

**Dependencies**: 2.2, 4.1

### 6.4 Test Store Module
- [ ] tests/unit/data/store.spec.ts
- [ ] Test CRUD operations
- [ ] Test file persistence
- [ ] Test atomic writes
- [ ] Test debouncing

**Dependencies**: 6.3

### 6.5 Implement Session Module
- [ ] src/data/session.ts (createSessionManager)
- [ ] Session ID generation
- [ ] create/get/set/destroy/refresh
- [ ] TTL-based expiration
- [ ] Memory and file storage backends
- [ ] isValid validation

**Dependencies**: 2.2, 6.1, 8.1 (id module)

**NOTE**: Skip to 8.1 (ID Module) first, then return to 6.5

### 6.6 Test Session Module
- [ ] tests/unit/data/session.spec.ts
- [ ] Test session lifecycle
- [ ] Test expiration
- [ ] Test storage backends

**Dependencies**: 6.5

### 6.7 Create Data Index
- [ ] src/data/index.ts (export all data modules)
- [ ] Update package.json exports

**Dependencies**: 6.2, 6.4, 6.6

## Phase 7: Network Modules

### 7.1 Implement HTTP Module
- [ ] src/network/http.ts (createHttp)
- [ ] get/post/put/patch/delete/head
- [ ] Request method (full options)
- [ ] Query string building
- [ ] JSON body serialization
- [ ] Timeout support
- [ ] Retry with backoff
- [ ] Request/response interceptors
- [ ] AbortController support
- [ ] Progress callbacks
- [ ] Response type handling
- [ ] Base URL support
- [ ] Default headers

**Dependencies**: 2.2, 3.7 (retry)

### 7.2 Test HTTP Module
- [ ] tests/unit/network/http.spec.ts
- [ ] Test all HTTP methods
- [ ] Test interceptors
- [ ] Test retry
- [ ] Test timeout
- [ ] Test abort
- [ ] Mock server for integration tests

**Dependencies**: 7.1

### 7.3 Implement WebSocket Module
- [ ] src/network/ws.ts (createWebSocket)
- [ ] connect method
- [ ] send/sendJson methods
- [ ] close method
- [ ] Event handlers (open, message, close, error)
- [ ] Auto-reconnection
- [ ] Ping/pong heartbeat
- [ ] Connection state management

**Dependencies**: 2.2

### 7.4 Test WebSocket Module
- [ ] tests/unit/network/ws.spec.ts
- [ ] Test connection
- [ ] Test send methods
- [ ] Test events
- [ ] Test reconnection
- [ ] Mock WebSocket server

**Dependencies**: 7.3

### 7.5 Implement SSE Module
- [ ] src/network/sse.ts (createSSE)
- [ ] connect method
- [ ] Named event support
- [ ] Auto-reconnection
- [ ] Last-Event-ID tracking
- [ ] Connection state

**Dependencies**: 2.2

### 7.6 Test SSE Module
- [ ] tests/unit/network/sse.spec.ts
- [ ] Test connection
- [ ] Test named events
- [ ] Test reconnection
- [ ] Mock SSE server

**Dependencies**: 7.5

### 7.7 Create Network Index
- [ ] src/network/index.ts (export all network modules)
- [ ] Update package.json exports

**Dependencies**: 7.2, 7.4, 7.6

## Phase 8: Async & Concurrency Modules

### 8.1 Implement Queue Module
- [ ] src/async/queue.ts (createQueue)
- [ ] add method (with delay, priority, attempts)
- [ ] process method (with concurrency)
- [ ] pause/resume/clear
- [ ] getJob/getJobs
- [ ] Events (completed, failed, progress)
- [ ] Job status tracking

**Dependencies**: 2.2

### 8.2 Test Queue Module
- [ ] tests/unit/async/queue.spec.ts
- [ ] Test job processing
- [ ] Test priorities
- [ ] Test delay
- [ ] Test retry
- [ ] Test events

**Dependencies**: 8.1

### 8.3 Implement Scheduler Module
- [ ] src/async/scheduler.ts (createScheduler)
- [ ] every method (interval scheduling)
- [ ] cron method (cron expressions)
- [ ] at method (one-time)
- [ ] cancel/pause/resume
- [ ] list method
- [ ] next method (next run time)
- [ ] Timezone support

**Dependencies**: 2.2, 4.1 (cron parser)

### 8.4 Test Scheduler Module
- [ ] tests/unit/async/scheduler.spec.ts
- [ ] Test interval scheduling
- [ ] Test cron expressions
- [ ] Test one-time scheduling
- [ ] Test task management

**Dependencies**: 8.3

### 8.5 Implement Retry Module
- [ ] src/async/retry.ts (createRetry)
- [ ] retry method (sync)
- [ ] retry.async method
- [ ] wrap method
- [ ] Exponential backoff
- [ ] Max delay cap
- [ ] Conditional retry
- [ ] Retry callback

**Dependencies**: 2.2

### 8.6 Test Retry Module
- [ ] tests/unit/async/retry.spec.ts
- [ ] Test retry attempts
- [ ] Test backoff
- [ ] Test conditional retry
- [ ] Test wrap

**Dependencies**: 8.5

### 8.7 Implement RateLimit Module
- [ ] src/async/rateLimit.ts (createRateLimiter)
- [ ] check method
- [ ] consume method
- [ ] reset method
- [ ] get method
- [ ] configure method (pattern-based)
- [ ] Token bucket algorithm
- [ ] Sliding window

**Dependencies**: 2.2

### 8.8 Test RateLimit Module
- [ ] tests/unit/async/rateLimit.spec.ts
- [ ] Test token bucket
- [ ] Test sliding window
- [ ] Test pattern configuration
- [ ] Test rate limiting

**Dependencies**: 8.7

### 8.9 Implement Circuit Module
- [ ] src/async/circuit.ts (createCircuitBreaker)
- [ ] call method
- [ ] getState method
- [ ] reset method
- [ ] configure method
- [ ] State events (open, close, half-open)
- [ ] Three-state machine

**Dependencies**: 2.2

### 8.10 Test Circuit Module
- [ ] tests/unit/async/circuit.spec.ts
- [ ] Test state transitions
- [ ] Test failure threshold
- [ ] Test success threshold
- [ ] Test events

**Dependencies**: 8.9

### 8.11 Implement Pool Module
- [ ] src/async/pool.ts (createPool)
- [ ] create method (factory)
- [ ] acquire/release
- [ ] drain method
- [ ] stats method
- [ ] Min/max pool size
- [ ] Validation
- [ ] Acquire timeout
- [ ] Idle timeout

**Dependencies**: 2.2

### 8.12 Test Pool Module
- [ ] tests/unit/async/pool.spec.ts
- [ ] Test acquire/release
- [ ] Test min/max size
- [ ] Test validation
- [ ] Test timeouts
- [ ] Test drain

**Dependencies**: 8.11

### 8.13 Implement Timeout Module
- [ ] src/async/timeout.ts (createTimeout)
- [ ] timeout method (promise wrapper)
- [ ] fn method (function wrapper)
- [ ] race method
- [ ] Custom error messages

**Dependencies**: 2.2

### 8.14 Test Timeout Module
- [ ] tests/unit/async/timeout.spec.ts
- [ ] Test promise timeout
- [ ] Test function wrapper
- [ ] Test race
- [ ] Test custom errors

**Dependencies**: 8.13

### 8.15 Implement Debounce Module
- [ ] src/async/debounce.ts (createDebounce)
- [ ] debounce method (with leading/trailing)
- [ ] throttle method
- [ ] cancel method
- [ ] flush method
- [ ] Max wait option

**Dependencies**: 2.2

### 8.16 Test Debounce Module
- [ ] tests/unit/async/debounce.spec.ts
- [ ] Test debounce
- [ ] Test throttle
- [ ] Test leading/trailing
- [ ] Test cancel
- [ ] Test flush

**Dependencies**: 8.15

### 8.17 Implement Mutex Module
- [ ] src/async/mutex.ts (createMutex, createSemaphore)
- [ ] Mutex (acquire/release)
- [ ] Semaphore (counted)
- [ ] runExclusive helper
- [ ] Timeout on acquire
- [ ] Queue management

**Dependencies**: 2.2

### 8.18 Test Mutex Module
- [ ] tests/unit/async/mutex.spec.ts
- [ ] Test mutex
- [ ] Test semaphore
- [ ] Test runExclusive
- [ ] Test timeout
- [ ] Test queue

**Dependencies**: 8.17

### 8.19 Create Async Index
- [ ] src/async/index.ts (export all async modules)
- [ ] Update package.json exports

**Dependencies**: 8.2, 8.4, 8.6, 8.8, 8.10, 8.12, 8.14, 8.16, 8.18

## Phase 9: Security Modules

### 9.1 Implement Crypto Module
- [ ] src/security/crypto.ts (createCrypto)
- [ ] hash method (SHA-256, SHA-512, MD5)
- [ ] hmac method
- [ ] randomBytes method
- [ ] randomString method
- [ ] randomInt method
- [ ] randomUUID method
- [ ] encrypt method (AES-256-GCM)
- [ ] decrypt method
- [ ] timingSafeEqual method

**Dependencies**: 2.2

### 9.2 Test Crypto Module
- [ ] tests/unit/security/crypto.spec.ts
- [ ] Test all hash algorithms
- [ ] Test HMAC
- [ ] Test random generation
- [ ] Test encryption/decryption
- [ ] Test timing-safe comparison

**Dependencies**: 9.1

### 9.3 Implement JWT Module
- [ ] src/security/jwt.ts (createJWT)
- [ ] sign method (HS256, HS384, HS512)
- [ ] verify method
- [ ] decode method (no verification)
- [ ] isExpired method
- [ ] Standard claims (iss, aud, exp, iat, nbf)

**Dependencies**: 2.2, 9.1

### 9.4 Test JWT Module
- [ ] tests/unit/security/jwt.spec.ts
- [ ] Test signing
- [ ] Test verification
- [ ] Test decoding
- [ ] Test expiration
- [ ] Test all algorithms

**Dependencies**: 9.3

### 9.5 Implement Hash Module
- [ ] src/security/hash.ts (createHash)
- [ ] password method (PBKDF2-based)
- [ ] verify method
- [ ] needsRehash method
- [ ] Configurable cost/iterations

**Dependencies**: 2.2, 9.1

### 9.6 Test Hash Module
- [ ] tests/unit/security/hash.spec.ts
- [ ] Test password hashing
- [ ] Test verification
- [ ] Test rehash detection
- [ ] Test cost options

**Dependencies**: 9.5

### 9.7 Create Security Index
- [ ] src/security/index.ts (export all security modules)
- [ ] Update package.json exports

**Dependencies**: 9.2, 9.4, 9.6

## Phase 10: Utility Modules (19 modules)

### 10.1 Implement ID Module
- [ ] src/utils/id.ts (createIdGenerator)
- [ ] uuid (v4)
- [ ] uuidv7 (time-sortable)
- [ ] nanoid (URL-safe)
- [ ] cuid (collision-resistant)
- [ ] ulid (sortable)
- [ ] snowflake (distributed)
- [ ] objectId (MongoDB-style)
- [ ] short (compact)
- [ ] sequential (with prefix)

**Dependencies**: 2.2

### 10.2 Test ID Module
- [ ] tests/unit/utils/id.spec.ts
- [ ] Test all ID formats
- [ ] Test uniqueness
- [ ] Test sortability (v7, ulid, snowflake)

**Dependencies**: 10.1

**Now return to Phase 6, Task 6.5 (Session Module)**

### 10.3 Implement String Module
- [ ] src/utils/string.ts (string utilities)
- [ ] Case conversion (camel, pascal, snake, kebab, title)
- [ ] capitalize, slugify
- [ ] truncate, pad
- [ ] repeat, reverse
- [ ] words, lines, chars
- [ ] template interpolation
- [ ] escape/unescape
- [ ] trim, contains, startsWith, endsWith
- [ ] count, replace, split, join

**Dependencies**: 2.2

### 10.4 Test String Module
- [ ] tests/unit/utils/string.spec.ts
- [ ] Test all case conversions
- [ ] Test string operations
- [ ] Test template rendering

**Dependencies**: 10.3

### 10.5 Implement Array Module
- [ ] src/utils/array.ts (array utilities)
- [ ] chunk, unique, flatten, compact
- [ ] groupBy, keyBy, sortBy
- [ ] shuffle, sample
- [ ] first, last, nth
- [ ] range, zip, unzip
- [ ] intersection, union, difference
- [ ] without, move, insert, remove
- [ ] partition, pluck
- [ ] sum, average, min, max
- [ ] isEmpty, isNotEmpty

**Dependencies**: 2.2

### 10.6 Test Array Module
- [ ] tests/unit/utils/array.spec.ts
- [ ] Test all array operations
- [ ] Test edge cases (empty arrays)
- [ ] Test immutability

**Dependencies**: 10.5

### 10.7 Implement Object Module
- [ ] src/utils/object.ts (object utilities)
- [ ] get/set/has/delete (dot notation)
- [ ] pick, omit
- [ ] merge, deepMerge
- [ ] clone, deepClone
- [ ] freeze, deepFreeze
- [ ] keys, values, entries, fromEntries
- [ ] invert, mapKeys, mapValues, filter
- [ ] isEmpty, isNotEmpty
- [ ] isPlain, equals, diff
- [ ] defaults, compact
- [ ] flatten, unflatten

**Dependencies**: 2.2

### 10.8 Test Object Module
- [ ] tests/unit/utils/object.spec.ts
- [ ] Test all object operations
- [ ] Test deep operations
- [ ] Test immutability

**Dependencies**: 10.7

### 10.9 Implement Date Module
- [ ] src/utils/date.ts (date utilities)
- [ ] now, parse, format, isValid
- [ ] isBefore, isAfter, isSame, isBetween
- [ ] add, subtract
- [ ] startOf, endOf
- [ ] diff, relative, calendar
- [ ] toUnix, fromUnix
- [ ] toISO, toUTC, toLocal
- [ ] getYear, getMonth, getDay, etc.
- [ ] isLeapYear, daysInMonth

**Dependencies**: 2.2

### 10.10 Test Date Module
- [ ] tests/unit/utils/date.spec.ts
- [ ] Test parsing and formatting
- [ ] Test date arithmetic
- [ ] Test comparisons
- [ ] Test timezones

**Dependencies**: 10.9

### 10.11 Implement Math Module
- [ ] src/utils/math.ts (math utilities)
- [ ] clamp, round, floor, ceil
- [ ] random, randomInt
- [ ] sum, average, median, mode
- [ ] min, max, range
- [ ] variance, stdDev
- [ ] percentage, percentChange
- [ ] lerp, map
- [ ] inRange
- [ ] isPrime, factorial, fibonacci
- [ ] gcd, lcm

**Dependencies**: 2.2

### 10.12 Test Math Module
- [ ] tests/unit/utils/math.spec.ts
- [ ] Test all math operations
- [ ] Test statistical functions
- [ ] Test edge cases

**Dependencies**: 10.11

### 10.13 Implement Color Module
- [ ] src/utils/color.ts (color utilities)
- [ ] parse (hex, rgb, hsl)
- [ ] toHex, toRgb, toHsl, toRgba
- [ ] lighten, darken
- [ ] saturate, desaturate
- [ ] invert, grayscale, complement
- [ ] mix, contrast
- [ ] isLight, isDark
- [ ] random

**Dependencies**: 2.2

### 10.14 Test Color Module
- [ ] tests/unit/utils/color.spec.ts
- [ ] Test color parsing
- [ ] Test color conversions
- [ ] Test color manipulation

**Dependencies**: 10.13

### 10.15 Implement Path Module
- [ ] src/utils/path.ts (path utilities)
- [ ] join, resolve, normalize
- [ ] relative, dirname, basename, extname
- [ ] parse, format
- [ ] isAbsolute, isRelative
- [ ] sep, delimiter

**Dependencies**: 2.2

### 10.16 Test Path Module
- [ ] tests/unit/utils/path.spec.ts
- [ ] Test all path operations
- [ ] Test cross-platform behavior

**Dependencies**: 10.15

### 10.17 Implement URL Module
- [ ] src/utils/url.ts (URL utilities)
- [ ] parse, format, resolve, join
- [ ] isValid, isAbsolute
- [ ] getOrigin, getHost, getPath, getQuery, getHash
- [ ] setQuery, addQuery, removeQuery
- [ ] encode, decode
- [ ] encodeComponent, decodeComponent

**Dependencies**: 2.2

### 10.18 Test URL Module
- [ ] tests/unit/utils/url.spec.ts
- [ ] Test URL parsing
- [ ] Test query manipulation
- [ ] Test encoding

**Dependencies**: 10.17

### 10.19 Implement MIME Module
- [ ] src/utils/mime.ts (MIME utilities)
- [ ] lookup (extension to MIME)
- [ ] extension (MIME to extension)
- [ ] contentType (with charset)
- [ ] isText, isImage, isVideo, isAudio, isFont, isCompressed

**Dependencies**: 2.2

### 10.20 Test MIME Module
- [ ] tests/unit/utils/mime.spec.ts
- [ ] Test MIME type lookup
- [ ] Test extension lookup
- [ ] Test type checking

**Dependencies**: 10.19

### 10.21 Implement Size Module
- [ ] src/utils/size.ts (size utilities)
- [ ] format (bytes to human-readable)
- [ ] parse (human-readable to bytes)
- [ ] bytes (unit conversion)
- [ ] toKB, toMB, toGB, toTB

**Dependencies**: 2.2

### 10.22 Test Size Module
- [ ] tests/unit/utils/size.spec.ts
- [ ] Test formatting
- [ ] Test parsing
- [ ] Test conversions

**Dependencies**: 10.21

### 10.23 Implement Slug Module
- [ ] src/utils/slug.ts (slug utilities)
- [ ] create (string to slug)
- [ ] isValid, sanitize
- [ ] Options (separator, lowercase, trim, strict)

**Dependencies**: 2.2

### 10.24 Test Slug Module
- [ ] tests/unit/utils/slug.spec.ts
- [ ] Test slug creation
- [ ] Test validation
- [ ] Test sanitization

**Dependencies**: 10.23

### 10.25 Implement Timer Module
- [ ] src/utils/timer.ts (timer utilities)
- [ ] start/stop/elapsed/lap/reset
- [ ] time, timeAsync
- [ ] sleep, defer, nextTick

**Dependencies**: 2.2

### 10.26 Test Timer Module
- [ ] tests/unit/utils/timer.spec.ts
- [ ] Test timing
- [ ] Test laps
- [ ] Test sleep

**Dependencies**: 10.25

### 10.27 Implement Diff Module
- [ ] src/utils/diff.ts (diff utilities)
- [ ] object (shallow diff)
- [ ] array (added, removed, common)
- [ ] deep (deep comparison)
- [ ] patch (apply changes)

**Dependencies**: 2.2

### 10.28 Test Diff Module
- [ ] tests/unit/utils/diff.spec.ts
- [ ] Test object diffing
- [ ] Test array diffing
- [ ] Test patching

**Dependencies**: 10.27

### 10.29 Implement Clone Module
- [ ] src/utils/clone.ts (clone utilities)
- [ ] clone (deep clone)
- [ ] shallow
- [ ] with (clone and modify)

**Dependencies**: 2.2

### 10.30 Test Clone Module
- [ ] tests/unit/utils/clone.spec.ts
- [ ] Test deep clone
- [ ] Test shallow clone
- [ ] Test with

**Dependencies**: 10.29

### 10.31 Implement Template Module
- [ ] src/utils/template.ts (template utilities)
- [ ] render (string interpolation)
- [ ] compile (pre-compile template)
- [ ] escape
- [ ] Syntax: {{var}}, {{#if}}, {{#each}}

**Dependencies**: 2.2

### 10.32 Test Template Module
- [ ] tests/unit/utils/template.spec.ts
- [ ] Test rendering
- [ ] Test compilation
- [ ] Test conditionals and loops

**Dependencies**: 10.31

### 10.33 Implement Random Module
- [ ] src/utils/random.ts (random utilities)
- [ ] int, float, boolean
- [ ] string, pick, sample, shuffle
- [ ] weighted, color, hex

**Dependencies**: 2.2

### 10.34 Test Random Module
- [ ] tests/unit/utils/random.spec.ts
- [ ] Test all random generators
- [ ] Test distributions

**Dependencies**: 10.33

### 10.35 Implement RegExp Module
- [ ] src/utils/regexp.ts (regexp utilities)
- [ ] escape, isValid, create
- [ ] match, matchAll, test, replace, split
- [ ] Common patterns (email, url, uuid, phone, ip, etc.)

**Dependencies**: 2.2

### 10.36 Test RegExp Module
- [ ] tests/unit/utils/regexp.spec.ts
- [ ] Test regexp utilities
- [ ] Test common patterns

**Dependencies**: 10.35

### 10.37 Implement Encoding Module
- [ ] src/utils/encoding.ts (encoding utilities)
- [ ] base64.encode/decode
- [ ] base64url.encode/decode
- [ ] hex.encode/decode
- [ ] utf8.encode/decode
- [ ] ascii.encode/decode

**Dependencies**: 2.2

### 10.38 Test Encoding Module
- [ ] tests/unit/utils/encoding.spec.ts
- [ ] Test all encodings
- [ ] Test round-trip conversions

**Dependencies**: 10.37

### 10.39 Create Utils Index
- [ ] src/utils/index.ts (export all utility modules)
- [ ] Update package.json exports

**Dependencies**: 10.2, 10.4, 10.6, 10.8, 10.10, 10.12, 10.14, 10.16, 10.18, 10.20, 10.22, 10.24, 10.26, 10.28, 10.30, 10.32, 10.34, 10.36, 10.38

## Phase 11: Observability Modules

### 11.1 Implement Metrics Module
- [ ] src/observability/metrics.ts (createMetrics)
- [ ] counter method
- [ ] gauge method
- [ ] histogram method
- [ ] summary method
- [ ] collect method (Prometheus format)
- [ ] toJSON method
- [ ] Label support

**Dependencies**: 2.2

### 11.2 Test Metrics Module
- [ ] tests/unit/observability/metrics.spec.ts
- [ ] Test counter
- [ ] Test gauge
- [ ] Test histogram
- [ ] Test summary
- [ ] Test labels
- [ ] Test collection

**Dependencies**: 11.1

### 11.3 Implement Health Module
- [ ] src/observability/health.ts (createHealthChecker)
- [ ] register method
- [ ] unregister method
- [ ] check method
- [ ] status method
- [ ] serve method (HTTP endpoint)

**Dependencies**: 2.2

### 11.4 Test Health Module
- [ ] tests/unit/observability/health.spec.ts
- [ ] Test registration
- [ ] Test checks
- [ ] Test status
- [ ] Test HTTP serving

**Dependencies**: 11.3

### 11.5 Implement Trace Module
- [ ] src/observability/trace.ts (createTracer)
- [ ] start method
- [ ] end method
- [ ] span method
- [ ] current method
- [ ] addMeta method
- [ ] getTraceId method
- [ ] Context integration

**Dependencies**: 2.2, 3.13

### 11.6 Test Trace Module
- [ ] tests/unit/observability/trace.spec.ts
- [ ] Test trace lifecycle
- [ ] Test span management
- [ ] Test context propagation

**Dependencies**: 11.5

### 11.7 Create Observability Index
- [ ] src/observability/index.ts (export all observability modules)
- [ ] Update package.json exports

**Dependencies**: 11.2, 11.4, 11.6

## Phase 12: Framework Adapters

### 12.1 Implement Express Adapter
- [ ] src/adapters/express.ts (expressMiddleware)
- [ ] Middleware factory
- [ ] Attach kit to request
- [ ] Context propagation
- [ ] Request ID generation

**Dependencies**: 2.2, 3.13

### 12.2 Test Express Adapter
- [ ] tests/unit/adapters/express.spec.ts
- [ ] Test middleware
- [ ] Test context
- [ ] Test request IDs

**Dependencies**: 12.1

### 12.3 Implement Fastify Adapter
- [ ] src/adapters/fastify.ts (fastifyPlugin)
- [ ] Plugin factory
- [ ] Attach kit to request
- [ ] Context propagation
- [ ] Request ID generation

**Dependencies**: 2.2, 3.13

### 12.4 Test Fastify Adapter
- [ ] tests/unit/adapters/fastify.spec.ts
- [ ] Test plugin
- [ ] Test context
- [ ] Test request IDs

**Dependencies**: 12.3

### 12.5 Implement Hono Adapter
- [ ] src/adapters/hono.ts (honoMiddleware)
- [ ] Middleware factory
- [ ] Attach kit to context
- [ ] Context propagation
- [ ] Request ID generation

**Dependencies**: 2.2, 3.13

### 12.6 Test Hono Adapter
- [ ] tests/unit/adapters/hono.spec.ts
- [ ] Test middleware
- [ ] Test context
- [ ] Test request IDs

**Dependencies**: 12.5

### 12.7 Implement Koa Adapter
- [ ] src/adapters/koa.ts (koaMiddleware)
- [ ] Middleware factory
- [ ] Attach kit to context
- [ ] Context propagation
- [ ] Request ID generation

**Dependencies**: 2.2, 3.13

### 12.8 Test Koa Adapter
- [ ] tests/unit/adapters/koa.spec.ts
- [ ] Test middleware
- [ ] Test context
- [ ] Test request IDs

**Dependencies**: 12.7

### 12.9 Implement HTTP Handler Adapter
- [ ] src/adapters/http.ts (httpHandler)
- [ ] Handler factory
- [ ] Attach kit to request
- [ ] Context propagation
- [ ] Request ID generation

**Dependencies**: 2.2, 3.13

### 12.10 Test HTTP Handler Adapter
- [ ] tests/unit/adapters/http.spec.ts
- [ ] Test handler
- [ ] Test context
- [ ] Test request IDs

**Dependencies**: 12.9

### 12.11 Create Adapters Index
- [ ] src/adapters/index.ts (export all adapters)
- [ ] Update package.json exports

**Dependencies**: 12.2, 12.4, 12.6, 12.8, 12.10

## Phase 13: Presets

### 13.1 Implement Presets
- [ ] src/presets/index.ts (export all presets)
- [ ] src/presets/api.ts (API preset config)
- [ ] src/presets/cli.ts (CLI preset config)
- [ ] src/presets/worker.ts (Worker preset config)
- [ ] src/presets/microservice.ts (Microservice preset config)
- [ ] src/presets/minimal.ts (Minimal preset config)

**Dependencies**: All previous phases

### 13.2 Test Presets
- [ ] tests/unit/presets.spec.ts
- [ ] Test API preset
- [ ] Test CLI preset
- [ ] Test Worker preset
- [ ] Test Microservice preset
- [ ] Test Minimal preset

**Dependencies**: 13.1

## Phase 14: Integration Testing

### 14.1 Full Kit Integration Tests
- [ ] tests/integration/full-kit.spec.ts
- [ ] Test complete createKit flow
- [ ] Test all modules together
- [ ] Test inter-module communication

**Dependencies**: All previous phases

### 14.2 Preset Integration Tests
- [ ] tests/integration/presets.spec.ts
- [ ] Test all presets with real usage
- [ ] Test preset extensibility

**Dependencies**: 13.2

## Phase 15: Examples

### 15.1 Create Basic Examples
- [ ] examples/01-basic/quick-start.ts
- [ ] examples/01-basic/standalone-modules.ts

**Dependencies**: All previous phases

### 15.2 Create Core Module Examples
- [ ] examples/02-core-modules/logging.ts
- [ ] examples/02-core-modules/configuration.ts
- [ ] examples/02-core-modules/error-handling.ts
- [ ] examples/02-core-modules/events-hooks.ts

**Dependencies**: 15.1

### 15.3 Create Network Examples
- [ ] examples/03-network/http-client.ts
- [ ] examples/03-network/websocket.ts
- [ ] examples/03-network/sse.ts

**Dependencies**: 15.1

### 15.4 Create Validation Examples
- [ ] examples/04-validation/schema-validation.ts
- [ ] examples/04-validation/data-transform.ts
- [ ] examples/04-validation/input-sanitization.ts

**Dependencies**: 15.1

### 15.5 Create Async Examples
- [ ] examples/05-async/queue.ts
- [ ] examples/05-async/scheduler.ts
- [ ] examples/05-async/retry-circuit.ts
- [ ] examples/05-async/rate-limiting.ts

**Dependencies**: 15.1

### 15.6 Create Security Examples
- [ ] examples/06-security/crypto.ts
- [ ] examples/06-security/jwt.ts
- [ ] examples/06-security/password-hashing.ts

**Dependencies**: 15.1

### 15.7 Create Utility Examples
- [ ] examples/07-utilities/string-array-object.ts
- [ ] examples/07-utilities/date-time.ts
- [ ] examples/07-utilities/id-generation.ts
- [ ] examples/07-utilities/encoding-parsing.ts

**Dependencies**: 15.1

### 15.8 Create Observability Examples
- [ ] examples/08-observability/metrics.ts
- [ ] examples/08-observability/health-checks.ts
- [ ] examples/08-observability/tracing.ts

**Dependencies**: 15.1

### 15.9 Create Framework Examples
- [ ] examples/09-frameworks/express-server.ts
- [ ] examples/09-frameworks/fastify-server.ts
- [ ] examples/09-frameworks/hono-server.ts
- [ ] examples/09-frameworks/koa-server.ts

**Dependencies**: 15.1

### 15.10 Create Preset Examples
- [ ] examples/10-presets/api-preset.ts
- [ ] examples/10-presets/cli-preset.ts
- [ ] examples/10-presets/worker-preset.ts

**Dependencies**: 15.1

### 15.11 Create Real-World Examples
- [ ] examples/11-real-world/rest-api.ts
- [ ] examples/11-real-world/web-scraper.ts
- [ ] examples/11-real-world/job-processor.ts
- [ ] examples/11-real-world/cli-tool.ts

**Dependencies**: 15.1

## Phase 16: Documentation

### 16.1 Create README.md
- [ ] Complete README with all sections
- [ ] Installation instructions
- [ ] Quick start guide
- [ ] All module documentation
- [ ] Examples reference
- [ ] LLM-optimized first 500 tokens

**Dependencies**: All examples created

### 16.2 Create llms.txt
- [ ] Create root llms.txt (< 2000 tokens)
- [ ] Quick reference for all modules
- [ ] Common patterns
- [ ] Copy to website/public/

**Dependencies**: 16.1

### 16.3 Update CHANGELOG.md
- [ ] Create initial CHANGELOG
- [ ] Document all features

**Dependencies**: All phases

## Phase 17: Website

### 17.1 Initialize Website
- [ ] Set up Vite + React + TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up Prism React Renderer
- [ ] Install Lucide React icons
- [ ] Create CNAME (kit.oxog.dev)

**Dependencies**: None

### 17.2 Create Website Pages
- [ ] Home page (hero, features, install)
- [ ] Getting Started page
- [ ] API Reference page (all modules)
- [ ] Examples page (all examples)
- [ ] Presets page
- [ ] Playground page

**Dependencies**: 17.1

### 17.3 Style Website
- [ ] Dark/Light theme toggle
- [ ] IDE-style code blocks with line numbers
- [ ] Copy buttons on code blocks
- [ ] Mobile responsive design
- [ ] Footer (copyright, GitHub, MIT)

**Dependencies**: 17.2

### 17.4 Deploy Website
- [ ] Create GitHub Actions workflow
- [ ] Test deployment
- [ ] Verify kit.oxog.dev

**Dependencies**: 17.3

## Phase 18: Final Verification

### 18.1 Quality Checks
- [ ] npm run build succeeds
- [ ] npm run test:coverage shows 100%
- [ ] npm run typecheck passes
- [ ] npm run lint passes
- [ ] All examples run successfully

**Dependencies**: All previous phases

### 18.2 Bundle Size Verification
- [ ] Measure single module size (< 2KB)
- [ ] Measure core runtime size (< 8KB)
- [ ] Measure full kit size (< 50KB)

**Dependencies**: 18.1

### 18.3 Documentation Verification
- [ ] llms.txt < 2000 tokens
- [ ] All public APIs have JSDoc
- [ ] All JSDoc has @example
- [ ] README is complete

**Dependencies**: 18.1

### 18.4 Release Preparation
- [ ] Tag version (v1.0.0)
- [ ] Create GitHub release
- [ ] Publish to npm (@oxog/kit)
- [ ] Verify npm package
- [ ] Verify website deployment

**Dependencies**: 18.2, 18.3

## Completion Checklist

- [ ] All 52 modules implemented
- [ ] All 5 adapters implemented
- [ ] All 5 presets implemented
- [ ] 100% test coverage achieved
- [ ] 15+ examples created
- [ ] llms.txt created
- [ ] Website deployed
- [ ] Package published to npm
- [ ] Documentation complete
- [ ] Zero runtime dependencies
