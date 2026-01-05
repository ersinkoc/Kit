/**
 * Tests for string utility module
 */
import { describe, it, expect } from 'vitest';
import { string } from '@oxog/kit/utils';

describe('string utilities', () => {
  describe('case conversions', () => {
    it('camelCase converts to camelCase', () => {
      expect(string.camelCase('hello-world')).toBe('helloWorld');
      expect(string.camelCase('Hello World')).toBe('helloWorld');
      expect(string.camelCase('hello_world')).toBe('helloWorld');
    });

    it('pascalCase converts to PascalCase', () => {
      expect(string.pascalCase('hello-world')).toBe('HelloWorld');
      expect(string.pascalCase('hello world')).toBe('HelloWorld');
    });

    it('snakeCase converts to snake_case', () => {
      expect(string.snakeCase('helloWorld')).toBe('hello_world');
      expect(string.snakeCase('HelloWorld')).toBe('hello_world');
    });

    it('kebabCase converts to kebab-case', () => {
      expect(string.kebabCase('helloWorld')).toBe('hello-world');
      expect(string.kebabCase('hello_world')).toBe('hello-world');
    });
  });

  describe('capitalize', () => {
    it('capitalize capitalizes first letter', () => {
      expect(string.capitalize('hello')).toBe('Hello');
    });

    it('capitalizeWords capitalizes each word', () => {
      expect(string.capitalizeWords('hello world')).toBe('Hello World');
    });
  });

  describe('case changes', () => {
    it('lowerCase converts to lowercase', () => {
      expect(string.lowerCase('HELLO')).toBe('hello');
    });

    it('upperCase converts to uppercase', () => {
      expect(string.upperCase('hello')).toBe('HELLO');
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(string.truncate('Hello World', 5)).toBe('He...');
    });

    it('returns original if short enough', () => {
      expect(string.truncate('Hello', 10)).toBe('Hello');
    });
  });

  describe('trim operations', () => {
    it('trim removes whitespace from both ends', () => {
      expect(string.trim('  hello  ')).toBe('hello');
    });

    it('trimLeft removes whitespace from left', () => {
      expect(string.trimLeft('  hello')).toBe('hello');
    });

    it('trimRight removes whitespace from right', () => {
      expect(string.trimRight('hello  ')).toBe('hello');
    });

    it('trimAll removes all whitespace', () => {
      expect(string.trimAll('  he llo  ')).toBe('hello');
    });
  });

  describe('pad operations', () => {
    it('padLeft pads on left', () => {
      expect(string.padLeft('5', 3, '0')).toBe('005');
    });

    it('padRight pads on right', () => {
      expect(string.padRight('5', 3, '0')).toBe('500');
    });
  });

  describe('count', () => {
    it('counts occurrences', () => {
      expect(string.count('hello world hello', 'hello')).toBe(2);
    });
  });

  describe('string checks', () => {
    it('contains checks substring', () => {
      expect(string.contains('hello world', 'world')).toBe(true);
      expect(string.contains('hello world', 'foo')).toBe(false);
    });

    it('startsWith checks start', () => {
      expect(string.startsWith('hello world', 'hello')).toBe(true);
    });

    it('endsWith checks end', () => {
      expect(string.endsWith('hello world', 'world')).toBe(true);
    });
  });

  describe('replaceAll', () => {
    it('replaces all occurrences', () => {
      expect(string.replaceAll('hello world hello', 'hello', 'hi')).toBe('hi world hi');
    });
  });

  describe('reverse', () => {
    it('reverses string', () => {
      expect(string.reverse('hello')).toBe('olleh');
    });
  });

  describe('lines/unlines', () => {
    it('lines splits into lines', () => {
      expect(string.lines('hello\nworld')).toEqual(['hello', 'world']);
    });

    it('unlines joins lines', () => {
      expect(string.unlines(['hello', 'world'])).toBe('hello\nworld');
    });
  });

  describe('words/unwords', () => {
    it('words splits into words', () => {
      expect(string.words('hello world')).toEqual(['hello', 'world']);
    });

    it('unwords joins words', () => {
      expect(string.unwords(['hello', 'world'])).toBe('hello world');
    });
  });

  describe('repeat', () => {
    it('repeats string', () => {
      expect(string.repeat('ha', 3)).toBe('hahaha');
    });
  });

  describe('isEmpty/isBlank', () => {
    it('isEmpty checks empty', () => {
      expect(string.isEmpty('')).toBe(true);
      expect(string.isEmpty('hello')).toBe(false);
    });

    it('isBlank checks blank', () => {
      expect(string.isBlank('')).toBe(true);
      expect(string.isBlank('  ')).toBe(true);
      expect(string.isBlank('hello')).toBe(false);
    });
  });

  describe('length', () => {
    it('returns string length', () => {
      expect(string.length('hello')).toBe(5);
    });
  });

  describe('substring/charAt/charCodeAt', () => {
    it('substring extracts portion', () => {
      expect(string.substring('hello', 1, 4)).toBe('ell');
    });

    it('charAt gets character', () => {
      expect(string.charAt('hello', 1)).toBe('e');
    });

    it('charCodeAt gets char code', () => {
      expect(string.charCodeAt('hello', 0)).toBe(104);
    });
  });

  describe('format', () => {
    it('formats with placeholders', () => {
      expect(string.format('Hello {name}!', { name: 'World' })).toBe('Hello World!');
    });
  });

  describe('abbreviate', () => {
    it('abbreviates long strings', () => {
      expect(string.abbreviate('Hello World', 5)).toBe('He...');
    });
  });

  describe('wrap', () => {
    it('wraps text to width', () => {
      expect(string.wrap('hello world foo bar', 10)).toBe('hello\nworld foo\nbar');
    });
  });
});
