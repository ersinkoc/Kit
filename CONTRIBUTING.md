# Contributing to @oxog/kit

Thank you for your interest in contributing to @oxog/kit! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/ersinkoc/kit.git
   cd kit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new string utility function
fix: resolve memory leak in cache module
docs: update README with new examples
test: add tests for validation module
refactor: simplify retry logic
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm test`
4. Ensure code is formatted: `npm run format`
5. Ensure no lint errors: `npm run lint`
6. Update documentation if needed
7. Submit a pull request

## Code Guidelines

### TypeScript

- Use strict TypeScript with no `any` types
- Export all public types
- Document public APIs with JSDoc comments

### Testing

- Write tests for all new functionality
- Maintain 100% test coverage
- Use descriptive test names

```typescript
describe('string.slugify', () => {
  it('should convert spaces to hyphens', () => {
    expect(string.slugify('hello world')).toBe('hello-world');
  });

  it('should handle unicode characters', () => {
    expect(string.slugify('héllo wörld')).toBe('hello-world');
  });
});
```

### Zero Dependencies

This project maintains **zero runtime dependencies**. All functionality must be implemented using:
- Node.js built-in modules
- Native JavaScript/TypeScript

Do not add any external packages to `dependencies`.

## Project Structure

```
src/
├── core/           # Core runtime modules
├── utils/          # Utility functions
├── validation/     # Validation schemas
├── security/       # Security utilities
├── async/          # Async patterns
├── observability/  # Metrics and tracing
├── network/        # HTTP, WebSocket, SSE
├── data/           # Cache, store, session
├── parsing/        # JSON, URL, query string
├── adapters/       # Framework adapters
└── presets/        # Pre-configured kits
```

## Adding a New Module

1. Create the module in the appropriate directory
2. Export from the category's `index.ts`
3. Add tests in `tests/` directory
4. Update `package.json` exports if needed
5. Document in README.md

## Questions?

Open an issue for any questions or concerns.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
