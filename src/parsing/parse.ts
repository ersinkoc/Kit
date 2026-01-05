/**
 * Parsing utilities for converting strings to structured data
 */

/**
 * Parse result with metadata
 */
export interface ParseResult<T = unknown> {
  /** Parsed data */
  data: T;
  /** Whether parsing was successful */
  success: boolean;
  /** Error message if parsing failed */
  error?: string;
  /** Remaining unparsed input */
  remaining?: string;
}

/**
 * Parser options
 */
export interface ParserOptions {
  /** Strict mode - fail on unexpected data */
  strict?: boolean;
  /** Skip whitespace */
  skipWhitespace?: boolean;
  /** Custom error handler */
  onError?: (error: string) => void;
}

/**
 * Number parsing result
 */
export interface NumberResult {
  /** Parsed number */
  value: number;
  /** Original string representation */
  original: string;
  /** Whether number is integer */
  isInteger: boolean;
  /** Whether number is negative */
  isNegative: boolean;
}

/**
 * Date parsing result
 */
export interface DateResult {
  /** Parsed date */
  value: Date;
  /** Format that matched */
  format: string;
  /** Original string */
  original: string;
}

/**
 * URL parsing result
 */
export interface URLResult {
  /** Protocol */
  protocol: string;
  /** Hostname */
  hostname: string;
  /** Port */
  port?: string;
  /** Pathname */
  pathname: string;
  /** Query parameters */
  query: Record<string, string>;
  /** Hash */
  hash: string;
  /** Full URL */
  href: string;
}

/**
 * Parse string to number with metadata
 */
export function parseNumber(input: string): ParseResult<NumberResult> {
  const trimmed = input.trim();

  // Handle hex (0x prefix)
  if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
    const value = parseInt(trimmed, 16);
    return {
      data: {
        value,
        original: trimmed,
        isInteger: true,
        isNegative: false,
      },
      success: true,
    };
  }

  // Handle binary (0b prefix)
  if (/^0b[01]+$/.test(trimmed)) {
    const value = parseInt(trimmed.slice(2), 2);
    return {
      data: {
        value,
        original: trimmed,
        isInteger: true,
        isNegative: false,
      },
      success: true,
    };
  }

  // Handle octal (0o prefix)
  if (/^0o[0-7]+$/.test(trimmed)) {
    const value = parseInt(trimmed.slice(2), 8);
    return {
      data: {
        value,
        original: trimmed,
        isInteger: true,
        isNegative: false,
      },
      success: true,
    };
  }

  // Handle scientific notation
  const sciMatch = trimmed.match(/^([+-]?\d+(?:\.\d+)?)[eE]([+-]?\d+)$/);
  if (sciMatch) {
    const value = parseFloat(trimmed);
    return {
      data: {
        value,
        original: trimmed,
        isInteger: !trimmed.includes('.') && !(sciMatch[1]?.includes('.')),
        isNegative: value < 0,
      },
      success: true,
    };
  }

  // Handle regular numbers
  if (/^[+-]?\d+(?:\.\d+)?$/.test(trimmed)) {
    const value = parseFloat(trimmed);
    return {
      data: {
        value,
        original: trimmed,
        isInteger: !trimmed.includes('.'),
        isNegative: trimmed.startsWith('-'),
      },
      success: true,
    };
  }

  // Handle number with separators (1,234.56)
  const sepMatch = trimmed.match(/^([+-]?)\d{1,3}(?:,\d{3})*(?:\.\d+)?$/);
  if (sepMatch) {
    const value = parseFloat(trimmed.replace(/,/g, ''));
    return {
      data: {
        value,
        original: trimmed,
        isInteger: !trimmed.includes('.'),
        isNegative: sepMatch[1] === '-',
      },
      success: true,
    };
  }

  return {
    data: null as unknown as NumberResult,
    success: false,
    error: `Invalid number: ${input}`,
  };
}

/**
 * Parse string to boolean
 */
export function parseBoolean(input: string): ParseResult<boolean> {
  const trimmed = input.toLowerCase().trim();

  const trueValues = ['true', '1', 'yes', 'on', 'enabled', 'y', 't'];
  const falseValues = ['false', '0', 'no', 'off', 'disabled', 'n', 'f'];

  if (trueValues.includes(trimmed)) {
    return {
      data: true,
      success: true,
    };
  }

  if (falseValues.includes(trimmed)) {
    return {
      data: false,
      success: true,
    };
  }

  return {
    data: false,
    success: false,
    error: `Invalid boolean: ${input}`,
  };
}

/**
 * Common date formats
 */
const DATE_FORMATS = [
  // ISO 8601
  {
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/,
    format: 'ISO 8601',
    parse: (str: string) => new Date(str),
  },
  // US format: MM/DD/YYYY
  {
    regex: /^(\d{2})\/(\d{2})\/(\d{4})$/,
    format: 'MM/DD/YYYY',
    parse: (str: string) => {
      const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return new Date(NaN);
      const [, m, d, y] = match;
      return new Date(parseInt(y!), parseInt(m!) - 1, parseInt(d!));
    },
  },
  // European format: DD.MM.YYYY
  {
    regex: /^(\d{2})\.(\d{2})\.(\d{4})$/,
    format: 'DD.MM.YYYY',
    parse: (str: string) => {
      const match = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      if (!match) return new Date(NaN);
      const [, d, m, y] = match;
      return new Date(parseInt(y!), parseInt(m!) - 1, parseInt(d!));
    },
  },
  // Short: YYYY-MM-DD
  {
    regex: /^(\d{4})-(\d{2})-(\d{2})$/,
    format: 'YYYY-MM-DD',
    parse: (str: string) => {
      const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return new Date(NaN);
      const [, y, m, d] = match;
      return new Date(parseInt(y!), parseInt(m!) - 1, parseInt(d!));
    },
  },
  // RFC 2822
  {
    regex: /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} [+-]\d{4}$/,
    format: 'RFC 2822',
    parse: (str: string) => new Date(str),
  },
  // Time only: HH:MM:SS
  {
    regex: /^(\d{2}):(\d{2}):(\d{2})$/,
    format: 'HH:MM:SS',
    parse: (str: string) => {
      const match = str.match(/^(\d{2}):(\d{2}):(\d{2})$/);
      if (!match) return new Date(NaN);
      const [, h, m, s] = match;
      const date = new Date();
      date.setHours(parseInt(h!), parseInt(m!), parseInt(s!), 0);
      return date;
    },
  },
];

/**
 * Parse string to date
 */
export function parseDate(input: string): ParseResult<DateResult> {
  const trimmed = input.trim();

  for (const { regex, format, parse } of DATE_FORMATS) {
    if (regex.test(trimmed)) {
      const date = parse(trimmed);
      if (!isNaN(date.getTime())) {
        return {
          data: {
            value: date,
            format,
            original: trimmed,
          },
          success: true,
        };
      }
    }
  }

  // Try native Date parsing as fallback
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return {
      data: {
        value: date,
        format: 'native',
        original: trimmed,
      },
      success: true,
    };
  }

  return {
    data: null as unknown as DateResult,
    success: false,
    error: `Invalid date: ${input}`,
  };
}

/**
 * Parse JSON with error handling
 */
export function parseJSON<T = unknown>(input: string): ParseResult<T> {
  try {
    const data = JSON.parse(input);
    return {
      data,
      success: true,
    };
  } catch (error) {
    return {
      data: null as unknown as T,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown JSON parse error',
    };
  }
}

/**
 * Parse URL with query parameters
 */
export function parseURL(input: string): ParseResult<URLResult> {
  try {
    const url = new URL(input.trim());

    // Parse query parameters
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    return {
      data: {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        query,
        hash: url.hash,
        href: url.href,
      },
      success: true,
    };
  } catch (error) {
    return {
      data: null as unknown as URLResult,
      success: false,
      error: error instanceof Error ? error.message : 'Invalid URL',
    };
  }
}

/**
 * Parse query string to object
 */
export function parseQueryString(input: string): ParseResult<Record<string, string>> {
  if (!input || input.trim() === '') {
    return {
      data: {},
      success: true,
    };
  }

  // Remove leading ? if present
  const queryString = input.startsWith('?') ? input.slice(1) : input;

  try {
    const params = new URLSearchParams(queryString);
    const result: Record<string, string> = {};

    params.forEach((value, key) => {
      result[key] = value;
    });

    return {
      data: result,
      success: true,
    };
  } catch (error) {
    return {
      data: {},
      success: false,
      error: error instanceof Error ? error.message : 'Invalid query string',
    };
  }
}

/**
 * Parse command line arguments
 */
export interface CLIOption {
  /** Option name */
  name: string;
  /** Option value */
  value?: string;
  /** Whether option is a flag */
  isFlag: boolean;
  /** Position in args */
  position: number;
}

export interface CLIResult {
  /** Positional arguments */
  args: string[];
  /** Options */
  options: Record<string, string | boolean>;
  /** Raw options */
  raw: CLIOption[];
}

export function parseCLI(input: string | string[]): ParseResult<CLIResult> {
  const args = Array.isArray(input) ? input : input.split(/\s+/);
  const result: CLIResult = {
    args: [],
    options: {},
    raw: [],
  };

  let position = 0;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    // Long option: --name=value or --name value
    if (arg.startsWith('--')) {
      const option = arg.slice(2);
      const eqIndex = option.indexOf('=');

      if (eqIndex !== -1) {
        // --name=value format
        const name = option.slice(0, eqIndex);
        const value = option.slice(eqIndex + 1);
        result.options[name] = value;
        result.raw.push({
          name,
          value,
          isFlag: false,
          position,
        });
      } else {
        // --name value format
        const name = option;
        const nextArg = args[i + 1];

        if (nextArg && !nextArg.startsWith('-')) {
          result.options[name] = nextArg;
          result.raw.push({
            name,
            value: nextArg,
            isFlag: false,
            position,
          });
          i++; // Skip next arg
        } else {
          result.options[name] = true;
          result.raw.push({
            name,
            isFlag: true,
            position,
          });
        }
      }
      position++;
    }
    // Short option: -nvalue or -n value
    else if (arg.startsWith('-') && !arg.startsWith('--')) {
      const option = arg.slice(1);

      if (option.length > 1) {
        // Combined flags: -abc = -a -b -c
        for (const char of option) {
          result.options[char] = true;
          result.raw.push({
            name: char,
            isFlag: true,
            position,
          });
          position++;
        }
      } else {
        // Single option: -n value
        const name = option;
        const nextArg = args[i + 1];

        if (nextArg && !nextArg.startsWith('-')) {
          result.options[name] = nextArg;
          result.raw.push({
            name,
            value: nextArg!,
            isFlag: false,
            position,
          });
          i++; // Skip next arg
        } else {
          result.options[name] = true;
          result.raw.push({
            name,
            isFlag: true,
            position,
          });
        }
        position++;
      }
    }
    // Positional argument
    else {
      result.args.push(arg);
    }
  }

  return {
    data: result,
    success: true,
  };
}

/**
 * Parse CSV string
 */
export interface CSVRow {
  /** Row values */
  values: string[];
  /** Raw row string */
  raw: string;
  /** Row index */
  index: number;
}

export interface CSVResult {
  /** Headers (if hasHeader) */
  headers: string[];
  /** Rows */
  rows: CSVRow[];
  /** Raw data */
  raw: string;
}

export function parseCSV(
  input: string,
  options: {
    /** First row as headers */
    header?: boolean;
    /** Field delimiter */
    delimiter?: string;
    /** Quote character */
    quote?: string;
  } = {}
): ParseResult<CSVResult> {
  const {
    header = false,
    delimiter = ',',
    quote = '"',
  } = options;

  const lines = input.trim().split(/\r?\n/);
  const result: CSVResult = {
    headers: [],
    rows: [],
    raw: input,
  };

  if (lines.length === 0) {
    return {
      data: result,
      success: true,
    };
  }

  // Parse CSV row handling quotes
  const parseRow = (row: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === quote) {
        if (inQuotes && nextChar === quote) {
          // Escaped quote
          current += quote;
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // End of value
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last value
    values.push(current.trim());

    return values;
  };

  // Parse header if needed
  let startIndex = 0;
  if (header) {
    result.headers = parseRow(lines[0]!);
    startIndex = 1;
  }

  // Parse rows
  for (let i = startIndex; i < lines.length; i++) {
    const values = parseRow(lines[i]!);
    result.rows.push({
      values,
      raw: lines[i]!,
      index: i - startIndex,
    });
  }

  return {
    data: result,
    success: true,
  };
}

/**
 * Parse duration string (e.g., "1h 30m", "90s", "2d")
 */
export interface DurationResult {
  /** Duration in milliseconds */
  milliseconds: number;
  /** Duration in seconds */
  seconds: number;
  /** Duration in minutes */
  minutes: number;
  /** Duration in hours */
  hours: number;
  /** Duration in days */
  days: number;
}

export function parseDuration(input: string): ParseResult<DurationResult> {
  const trimmed = input.trim().toLowerCase();

  // Pattern: 1h 30m 45s
  const pattern = /(?:(\d+)\s*d)?\s*(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?/;
  const match = trimmed.match(pattern);

  if (match) {
    const days = parseInt(match[1] || '0');
    const hours = parseInt(match[2] || '0');
    const minutes = parseInt(match[3] || '0');
    const seconds = parseInt(match[4] || '0');

    const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
    const milliseconds = totalSeconds * 1000;

    return {
      data: {
        milliseconds,
        seconds: totalSeconds,
        minutes: totalSeconds / 60,
        hours: totalSeconds / 3600,
        days: totalSeconds / 86400,
      },
      success: true,
    };
  }

  // Try ISO 8601 duration (P1DT2H3M4S)
  const isoPattern = /P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const isoMatch = trimmed.match(isoPattern);

  if (isoMatch) {
    const days = parseInt(isoMatch[1] || '0');
    const hours = parseInt(isoMatch[2] || '0');
    const minutes = parseInt(isoMatch[3] || '0');
    const seconds = parseInt(isoMatch[4] || '0');

    const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
    const milliseconds = totalSeconds * 1000;

    return {
      data: {
        milliseconds,
        seconds: totalSeconds,
        minutes: totalSeconds / 60,
        hours: totalSeconds / 3600,
        days: totalSeconds / 86400,
      },
      success: true,
    };
  }

  return {
    data: null as unknown as DurationResult,
    success: false,
    error: `Invalid duration: ${input}`,
  };
}

/**
 * Parse version string (semantic versioning)
 */
export interface VersionResult {
  /** Major version */
  major: number;
  /** Minor version */
  minor: number;
  /** Patch version */
  patch: number;
  /** Pre-release identifier */
  prerelease?: string;
  /** Build metadata */
  build?: string;
  /** Original string */
  original: string;
}

export function parseVersion(input: string): ParseResult<VersionResult> {
  const trimmed = input.trim();

  // Semantic versioning pattern: 1.2.3-alpha.1+build.123
  const pattern = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  const match = trimmed.match(pattern);

  if (match) {
    return {
      data: {
        major: parseInt(match[1]!),
        minor: parseInt(match[2]!),
        patch: parseInt(match[3]!),
        prerelease: match[4],
        build: match[5],
        original: trimmed,
      },
      success: true,
    };
  }

  return {
    data: null as unknown as VersionResult,
    success: false,
    error: `Invalid version: ${input}`,
  };
}

/**
 * Parse color string (hex, rgb, hsl, named)
 */
export interface ColorResult {
  /** RGB values */
  rgb: { r: number; g: number; b: number };
  /** Alpha value */
  alpha?: number;
  /** HSL values */
  hsl?: { h: number; s: number; l: number };
  /** Original format */
  format: 'hex' | 'rgb' | 'hsl' | 'named';
  /** Original string */
  original: string;
}

export function parseColor(input: string): ParseResult<ColorResult> {
  const trimmed = input.trim().toLowerCase();

  // Hex: #RGB or #RRGGBB
  const hexMatch = trimmed.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch && hexMatch[1]) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      const h0 = hex[0]!, h1 = hex[1]!, h2 = hex[2]!;
      hex = h0 + h0 + h1 + h1 + h2 + h2;
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return {
      data: {
        rgb: { r, g, b },
        format: 'hex',
        original: trimmed,
      },
      success: true,
    };
  }

  // RGB: rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]!);
    const g = parseInt(rgbMatch[2]!);
    const b = parseInt(rgbMatch[3]!);
    const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined;

    return {
      data: {
        rgb: { r, g, b },
        alpha: a,
        format: 'rgb',
        original: trimmed,
      },
      success: true,
    };
  }

  // HSL: hsl(h, s%, l%) or hsla(h, s%, l%, a)
  const hslMatch = trimmed.match(/^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)$/);
  if (hslMatch) {
    return {
      data: {
        rgb: { r: 0, g: 0, b: 0 }, // Would need conversion
        hsl: {
          h: parseInt(hslMatch[1]!),
          s: parseInt(hslMatch[2]!),
          l: parseInt(hslMatch[3]!),
        },
        alpha: hslMatch[4] ? parseFloat(hslMatch[4]) : undefined,
        format: 'hsl',
        original: trimmed,
      },
      success: true,
    };
  }

  return {
    data: null as unknown as ColorResult,
    success: false,
    error: `Invalid color: ${input}`,
  };
}

/**
 * Parse email address
 */
export interface EmailResult {
  /** Local part */
  local: string;
  /** Domain */
  domain: string;
  /** Full email */
  email: string;
  /** Whether email is valid */
  valid: boolean;
}

export function parseEmail(input: string): ParseResult<EmailResult> {
  const trimmed = input.trim();
  const pattern = /^([^@]+)@([^@]+)$/;

  const match = trimmed.match(pattern);
  if (match) {
    const [, local, domain] = match;

    return {
      data: {
        local: local!,
        domain: domain!,
        email: trimmed,
        valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed),
      },
      success: true,
    };
  }

  return {
    data: null as unknown as EmailResult,
    success: false,
    error: `Invalid email: ${input}`,
  };
}

/**
 * Parse phone number
 */
export interface PhoneResult {
  /** Country code */
  countryCode?: string;
  /** Area code */
  areaCode?: string;
  /** Local number */
  localNumber: string;
  /** Full number */
  fullNumber: string;
  /** Format that matched */
  format: string;
}

export function parsePhone(input: string): ParseResult<PhoneResult> {
  const trimmed = input.trim();

  // E.164 format: +1234567890
  const e164Match = trimmed.match(/^\+(\d{1,3})(\d+)$/);
  if (e164Match) {
    return {
      data: {
        countryCode: e164Match[1],
        localNumber: e164Match[2]!,
        fullNumber: trimmed,
        format: 'E.164',
      },
      success: true,
    };
  }

  // US format: (123) 456-7890
  const usMatch = trimmed.match(/^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/);
  if (usMatch) {
    return {
      data: {
        areaCode: usMatch[1],
        localNumber: `${usMatch[2]!}${usMatch[3]!}`,
        fullNumber: `+1${usMatch[1]}${usMatch[2]!}${usMatch[3]!}`,
        format: 'US',
      },
      success: true,
    };
  }

  // International: +1 (123) 456-7890
  const intMatch = trimmed.match(/^\+(\d{1,3})\s?\(?(\d{1,4})\)?[-.\s]?(\d+)[-.\s]?(\d+)$/);
  if (intMatch) {
    return {
      data: {
        countryCode: intMatch[1],
        areaCode: intMatch[2],
        localNumber: `${intMatch[3]!}${intMatch[4]!}`,
        fullNumber: trimmed.replace(/[^\d+]/g, ''),
        format: 'international',
      },
      success: true,
    };
  }

  return {
    data: null as unknown as PhoneResult,
    success: false,
    error: `Invalid phone number: ${input}`,
  };
}

/**
 * Parse file path
 */
export interface PathResult {
  /** Directory path */
  dir: string;
  /** File name with extension */
  base: string;
  /** File name without extension */
  name: string;
  /** File extension */
  ext: string;
  /** Root path */
  root: string;
  /** Full path */
  path: string;
}

export function parsePath(input: string): ParseResult<PathResult> {
  const trimmed = input.trim();

  // Handle Windows paths
  const windowsMatch = trimmed.match(/^([A-Z]:)?(?:\\|\/)?(.*)/);
  if (windowsMatch) {
    const root = windowsMatch[1] ? `${windowsMatch[1]}\\` : '';
    const rest = windowsMatch[2] ?? '';
    const parts = rest.replace(/\\/g, '/').split('/');

    const base = parts[parts.length - 1] || '';
    const nameParts = base.lastIndexOf('.');
    const name = nameParts !== -1 ? base.slice(0, nameParts) : base;
    const ext = nameParts !== -1 ? base.slice(nameParts) : '';
    const dir = parts.slice(0, -1).join('/').replace(/\//g, '\\');

    return {
      data: {
        dir: root + dir,
        base,
        name,
        ext,
        root,
        path: trimmed,
      },
      success: true,
    };
  }

  // Handle Unix paths
  const parts = trimmed.split('/');
  const root = trimmed.startsWith('/') ? '/' : '';
  const base = parts[parts.length - 1] || '';
  const nameParts = base.lastIndexOf('.');
  const name = nameParts !== -1 ? base.slice(0, nameParts) : base;
  const ext = nameParts !== -1 ? base.slice(nameParts) : '';
  const dir = parts.slice(0, -1).join('/');

  return {
    data: {
      dir: root + dir,
      base,
      name,
      ext,
      root,
      path: trimmed,
    },
    success: true,
  };
}

/**
 * Parse byte size (e.g., "1KB", "5.2MB", "3GB")
 */
export interface SizeResult {
  /** Size in bytes */
  bytes: number;
  /** Numeric value */
  value: number;
  /** Unit */
  unit: string;
  /** Original string */
  original: string;
}

export function parseSize(input: string): ParseResult<SizeResult> {
  const trimmed = input.trim().toUpperCase();

  // Pattern: 1KB, 5.2MB, 3GB, etc.
  const pattern = /^([\d.]+)\s*([KMGT]?B?|B)$/i;
  const match = trimmed.match(pattern);

  if (match) {
    const value = parseFloat(match[1]!);
    const unit = match[2]!.toUpperCase();

    const multipliers: Record<string, number> = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 ** 2,
      'GB': 1024 ** 3,
      'TB': 1024 ** 4,
      'PB': 1024 ** 5,
    };

    const bytes = value * (multipliers[unit] || 1);

    return {
      data: {
        bytes,
        value,
        unit,
        original: trimmed,
      },
      success: true,
    };
  }

  return {
    data: null as unknown as SizeResult,
    success: false,
    error: `Invalid size: ${input}`,
  };
}

/**
 * Parse MIME type from string
 */
export interface MIMEResult {
  /** Type */
  type: string;
  /** Subtype */
  subtype: string;
  /** Parameters */
  parameters: Record<string, string>;
  /** Full MIME type */
  mime: string;
}

export function parseMIME(input: string): ParseResult<MIMEResult> {
  const trimmed = input.trim();

  // Pattern: type/subtype; param=value; param2=value2
  const parts = trimmed.split(';');
  const mime = (parts[0] ?? '').trim();
  const typeParts = mime.split('/');

  if (typeParts.length !== 2) {
    return {
      data: null as unknown as MIMEResult,
      success: false,
      error: `Invalid MIME type: ${input}`,
    };
  }

  const [type, subtype] = typeParts;
  const parameters: Record<string, string> = {};

  // Parse parameters
  for (let i = 1; i < parts.length; i++) {
    const param = parts[i]!.trim();
    const eqIndex = param.indexOf('=');

    if (eqIndex !== -1) {
      const key = param.slice(0, eqIndex).trim();
      const value = param.slice(eqIndex + 1).trim().replace(/^"|"$/g, '');
      parameters[key] = value;
    }
  }

  return {
    data: {
      type: type!,
      subtype: subtype!,
      parameters,
      mime: `${type}/${subtype}`,
    },
    success: true,
  };
}

/**
 * Default parser instance
 */
export const parse_default = {
  number: parseNumber,
  boolean: parseBoolean,
  date: parseDate,
  json: parseJSON,
  url: parseURL,
  queryString: parseQueryString,
  cli: parseCLI,
  csv: parseCSV,
  duration: parseDuration,
  version: parseVersion,
  color: parseColor,
  email: parseEmail,
  phone: parsePhone,
  path: parsePath,
  size: parseSize,
  mime: parseMIME,
};
