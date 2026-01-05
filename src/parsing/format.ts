/**
 * Formatting utilities for converting data to strings
 */

/**
 * Number formatting options
 */
export interface NumberFormatOptions {
  /** Number of decimal places */
  decimals?: number;
  /** Thousands separator */
  thousandsSeparator?: string;
  /** Decimal separator */
  decimalSeparator?: string;
  /** Prefix */
  prefix?: string;
  /** Suffix */
  suffix?: string;
  /** Minimum integer digits */
  minIntegerDigits?: number;
}

/**
 * Date formatting options
 */
export interface DateFormatOptions {
  /** Format string */
  format?: string;
  /** Locale */
  locale?: string;
  /** Time zone */
  timeZone?: string;
}

/**
 * Byte size formatting options
 */
export interface SizeFormatOptions {
  /** Unit to use */
  unit?: 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'auto';
  /** Number of decimal places */
  decimals?: number;
  /** Use binary units (1024) or decimal (1000) */
  binary?: boolean;
}

/**
 * Duration formatting options
 */
export interface DurationFormatOptions {
  /** Unit to use */
  unit?: 'ms' | 's' | 'm' | 'h' | 'd' | 'auto';
  /** Number of decimal places */
  decimals?: number;
}

/**
 * Format number to string
 */
export function formatNumber(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const {
    decimals = 0,
    thousandsSeparator = ',',
    decimalSeparator = '.',
    prefix = '',
    suffix = '',
    minIntegerDigits = 1,
  } = options;

  // Handle negative numbers
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  // Round to specified decimals
  const rounded = Math.round(absValue * Math.pow(10, decimals)) / Math.pow(10, decimals);

  // Split into integer and decimal parts
  const parts = rounded.toString().split('.');
  let integerPart = parts[0] || '0';
  let decimalPart = parts[1] || '';

  // Pad with zeros if needed
  if (decimals > 0) {
    decimalPart = decimalPart.padEnd(decimals, '0');
  }

  // Add thousands separator (before padding with leading zeros)
  if (thousandsSeparator && integerPart.length > 3) {
    const groups: string[] = [];
    let i = integerPart.length;

    while (i > 0) {
      const start = Math.max(0, i - 3);
      groups.unshift(integerPart.slice(start, i));
      i = start;
    }

    integerPart = groups.join(thousandsSeparator);
  }

  // Add leading zeros after thousands separator
  // Calculate how many leading zeros we need
  const currentDigits = integerPart.replace(/[^0-9]/g, '').length;
  if (currentDigits < minIntegerDigits) {
    const zerosNeeded = minIntegerDigits - currentDigits;
    integerPart = '0'.repeat(zerosNeeded) + integerPart;
  }

  // Combine parts
  let result = integerPart;
  if (decimalPart) {
    result += decimalSeparator + decimalPart;
  }

  // Add negative sign
  if (isNegative) {
    result = '-' + result;
  }

  return prefix + result + suffix;
}

/**
 * Format number as percentage
 */
export function formatPercent(
  value: number,
  options: NumberFormatOptions & {
    /** Multiply by 100 */
    multiply?: boolean;
  } = {}
): string {
  const { multiply = true, decimals = 0, ...numberOptions } = options;

  const num = multiply ? value * 100 : value;
  return formatNumber(num, {
    decimals,
    suffix: '%',
    ...numberOptions,
  });
}

/**
 * Format number as currency
 */
export function formatCurrency(
  value: number,
  options: NumberFormatOptions & {
    /** Currency code */
    currency?: string;
    /** Symbol position */
    symbolPosition?: 'before' | 'after';
  } = {}
): string {
  const {
    currency = '$',
    symbolPosition = 'before',
    ...numberOptions
  } = options;

  const formatted = formatNumber(value, {
    decimals: 2,
    ...numberOptions,
  });

  return symbolPosition === 'before'
    ? currency + formatted
    : formatted + ' ' + currency;
}

/**
 * Format number as file size
 */
export function formatSize(
  bytes: number,
  options: SizeFormatOptions = {}
): string {
  const {
    unit = 'auto',
    decimals = 2,
    binary = true,
  } = options;

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const base = binary ? 1024 : 1000;

  if (unit === 'auto') {
    let unitIndex = 0;
    let size = bytes;

    while (size >= base && unitIndex < units.length - 1) {
      size /= base;
      unitIndex++;
    }

    return formatNumber(size, { decimals }) + ' ' + units[unitIndex];
  }

  const unitIndex = units.indexOf(unit);
  if (unitIndex === -1) {
    throw new Error(`Invalid unit: ${unit}`);
  }

  const size = bytes / Math.pow(base, unitIndex);
  return formatNumber(size, { decimals }) + ' ' + unit;
}

/**
 * Format duration
 */
export function formatDuration(
  milliseconds: number,
  options: DurationFormatOptions = {}
): string {
  const { unit = 'auto', decimals = 0 } = options;

  const units = [
    { name: 'ms', value: 1 },
    { name: 's', value: 1000 },
    { name: 'm', value: 60000 },
    { name: 'h', value: 3600000 },
    { name: 'd', value: 86400000 },
  ];

  if (unit === 'auto') {
    // Find the largest unit that fits
    let bestUnit = units[0];
    for (const u of units) {
      if (milliseconds >= u.value) {
        bestUnit = u;
      }
    }

    const value = milliseconds / bestUnit!.value;
    return formatNumber(value, { decimals }) + bestUnit!.name;
  }

  const unitInfo = units.find((u) => u.name === unit);
  if (!unitInfo) {
    throw new Error(`Invalid unit: ${unit}`);
  }

  const value = milliseconds / unitInfo.value;
  return formatNumber(value, { decimals }) + unitInfo.name;
}

/**
 * Format date to string
 */
export function formatDate(
  date: Date | string | number,
  options: DateFormatOptions = {}
): string {
  const {
    format = 'ISO',
    locale = 'en-US',
    timeZone,
  } = options;

  const d = typeof date === 'object' ? date : new Date(date);

  switch (format) {
    case 'ISO':
      return d.toISOString();

    case 'locale':
      return d.toLocaleString(locale, timeZone ? { timeZone } : undefined);

    case 'date':
      return d.toLocaleDateString(locale, timeZone ? { timeZone } : undefined);

    case 'time':
      return d.toLocaleTimeString(locale, timeZone ? { timeZone } : undefined);

    case 'YYYY-MM-DD':
      return d.toISOString().slice(0, 10);

    case 'MM/DD/YYYY': {
      const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = d.getUTCDate().toString().padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${m}/${day}/${year}`;
    }

    case 'DD.MM.YYYY': {
      const day = d.getUTCDate().toString().padStart(2, '0');
      const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}.${m}.${year}`;
    }

    case 'HH:mm:ss': {
      const h = d.getUTCHours().toString().padStart(2, '0');
      const m = d.getUTCMinutes().toString().padStart(2, '0');
      const s = d.getUTCSeconds().toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    }

    case 'relative':
      return formatRelativeTime(d);

    default:
      // Use format as a template
      return formatDateTemplate(d, format);
  }
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === 'object' ? date : new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const absDiff = Math.abs(diff);

  // Units from largest to smallest
  const units = [
    { name: 'year', value: 31536000000 },
    { name: 'month', value: 2592000000 },
    { name: 'week', value: 604800000 },
    { name: 'day', value: 86400000 },
    { name: 'hour', value: 3600000 },
    { name: 'minute', value: 60000 },
    { name: 'second', value: 1000 },
  ];

  for (const unit of units) {
    const count = Math.floor(absDiff / unit.value);
    if (count >= 1) {
      const suffix = diff > 0 ? 'ago' : 'from now';
      const plural = count === 1 ? '' : 's';
      return `${count} ${unit.name}${plural} ${suffix}`;
    }
  }

  return 'just now';
}

/**
 * Format date using template string (uses UTC for consistency)
 */
function formatDateTemplate(date: Date, template: string): string {
  const replacements: Record<string, string> = {
    'YYYY': date.getUTCFullYear().toString(),
    'YY': date.getUTCFullYear().toString().slice(-2),
    'MM': (date.getUTCMonth() + 1).toString().padStart(2, '0'),
    'M': (date.getUTCMonth() + 1).toString(),
    'DD': date.getUTCDate().toString().padStart(2, '0'),
    'D': date.getUTCDate().toString(),
    'HH': date.getUTCHours().toString().padStart(2, '0'),
    'H': date.getUTCHours().toString(),
    'mm': date.getUTCMinutes().toString().padStart(2, '0'),
    'm': date.getUTCMinutes().toString(),
    'ss': date.getUTCSeconds().toString().padStart(2, '0'),
    's': date.getUTCSeconds().toString(),
    'SSS': date.getUTCMilliseconds().toString().padStart(3, '0'),
  };

  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }

  return result;
}

/**
 * Format date to time ago
 */
export function formatTimeAgo(date: Date | string | number): string {
  return formatRelativeTime(date);
}

/**
 * Format phone number
 */
export function formatPhone(
  phone: string,
  format: 'E.164' | 'US' | 'international' = 'US'
): string {
  const digits = phone.replace(/\D/g, '');

  switch (format) {
    case 'E.164':
      if (digits.startsWith('1')) {
        return '+1' + digits.slice(1);
      }
      return '+' + digits;

    case 'US':
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      if (digits.length === 11 && digits.startsWith('1')) {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      }
      return phone;

    case 'international':
      if (digits.startsWith('1') && digits.length === 11) {
        return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
      }
      return phone;

    default:
      return phone;
  }
}

/**
 * Format credit card number
 */
export function formatCreditCard(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');

  // Add spaces every 4 digits
  const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  return formatted.trim();
}

/**
 * Format SSN (Social Security Number)
 */
export function formatSSN(ssn: string): string {
  const digits = ssn.replace(/\D/g, '');

  if (digits.length === 9) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }

  return ssn;
}

/**
 * Format email (mask for privacy)
 */
export function formatEmail(
  email: string,
  options: {
    /** Mask email */
    mask?: boolean;
    /** Mask character */
    maskChar?: string;
    /** Show characters at start */
    showStart?: number;
    /** Show characters at end */
    showEnd?: number;
  } = {}
): string {
  const {
    mask = false,
    maskChar = '*',
    showStart = 2,
    showEnd = 0,
  } = options;

  if (!mask) return email;

  const [local, domain] = email.split('@');
  if (!local || !domain) return email;

  const localLength = local.length;
  const maskedLocal =
    local.slice(0, showStart) +
    maskChar.repeat(Math.max(0, localLength - showStart - showEnd)) +
    local.slice(localLength - showEnd);

  return `${maskedLocal}@${domain}`;
}

/**
 * Format URL
 */
export function formatURL(
  url: string,
  options: {
    /** Remove protocol */
    removeProtocol?: boolean;
    /** Remove www */
    removeWWW?: boolean;
    /** Remove trailing slash */
    removeTrailingSlash?: boolean;
  } = {}
): string {
  const {
    removeProtocol = false,
    removeWWW = false,
    removeTrailingSlash = false,
  } = options;

  let formatted = url;

  if (removeProtocol) {
    formatted = formatted.replace(/^https?:\/\//, '');
  }

  if (removeWWW) {
    formatted = formatted.replace(/^www\./, '');
  }

  if (removeTrailingSlash) {
    formatted = formatted.replace(/\/$/, '');
  }

  return formatted;
}

/**
 * Format JSON with indentation
 */
export function formatJSON(
  obj: unknown,
  options: {
    /** Indentation */
    indent?: number | string;
    /** Sort keys */
    sortKeys?: boolean;
  } = {}
): string {
  const { indent = 2, sortKeys = false } = options;

  const replacer = sortKeys
    ? (_key: string, value: unknown) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return Object.keys(value)
            .sort()
            .reduce((sorted: Record<string, unknown>, key) => {
              sorted[key] = (value as Record<string, unknown>)[key];
              return sorted;
            }, {});
        }
        return value;
      }
    : undefined;

  return JSON.stringify(obj, replacer, indent);
}

/**
 * Format query string from object
 */
export function formatQueryString(
  obj: Record<string, string | number | boolean | undefined>,
  options: {
    /** Add leading ? */
    leadingQuestionMark?: boolean;
  } = {}
): string {
  const { leadingQuestionMark = false } = options;

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();

  if (leadingQuestionMark && queryString) {
    return '?' + queryString;
  }

  return queryString;
}

/**
 * Format template string with variables
 */
export function formatTemplate(
  template: string,
  variables: Record<string, unknown>,
  options: {
    /** Open delimiter */
    open?: string;
    /** Close delimiter */
    close?: string;
  } = {}
): string {
  const { open = '${', close = '}' } = options;

  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = open + key + close;
    result = result.replace(new RegExp(placeholder, 'g'), String(value ?? ''));
  }

  return result;
}

/**
 * Format list with conjunction
 */
export function formatList(
  items: string[],
  options: {
    /** Conjunction */
    conjunction?: string;
    /** Oxford comma */
    oxfordComma?: boolean;
  } = {}
): string {
  const { conjunction = 'and', oxfordComma = true } = options;

  if (items.length === 0) return '';
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return items.join(` ${conjunction} `);

  const last = items[items.length - 1]!;
  const rest = items.slice(0, -1);

  const separator = oxfordComma ? `, ${conjunction} ` : ` ${conjunction} `;
  return rest.join(', ') + separator + last;
}

/**
 * Format ordinal number (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = num % 100;
  const suffix =
    value > 10 && value < 20
      ? 'th'
      : suffixes[value % 10] || 'th';

  return num + suffix;
}

/**
 * Format roman numeral
 */
export function formatRoman(num: number): string {
  if (num < 1 || num > 3999) {
    throw new Error('Number must be between 1 and 3999');
  }

  const romanNumerals = [
    { value: 1000, symbol: 'M' },
    { value: 900, symbol: 'CM' },
    { value: 500, symbol: 'D' },
    { value: 400, symbol: 'CD' },
    { value: 100, symbol: 'C' },
    { value: 90, symbol: 'XC' },
    { value: 50, symbol: 'L' },
    { value: 40, symbol: 'XL' },
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 1, symbol: 'I' },
  ];

  let result = '';
  let remaining = num;

  for (const { value, symbol } of romanNumerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }

  return result;
}

/**
 * Format text with word wrap
 */
export function formatWordWrap(
  text: string,
  options: {
    /** Max line width */
    width?: number;
    /** Break on word boundaries */
    breakWords?: boolean;
    /** Line separator */
    separator?: string;
  } = {}
): string {
  const { width = 80, breakWords = false, separator = '\n' } = options;

  if (width <= 0) return text;

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= width) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // Handle long words if breakWords is true
  if (breakWords) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      while (line.length > width) {
        const breakPoint = width;
        const before = line.slice(0, breakPoint);
        const after = line.slice(breakPoint);
        lines[i] = before;
        lines.splice(i + 1, 0, after);
      }
    }
  }

  return lines.join(separator);
}

/**
 * Format text with truncation
 */
export function formatTruncate(
  text: string,
  options: {
    /** Max length */
    length?: number;
    /** Suffix */
    suffix?: string;
    /** Break words */
    breakWords?: boolean;
  } = {}
): string {
  const { length = 50, suffix = '...', breakWords = false } = options;

  if (text.length <= length) return text;

  if (breakWords) {
    return text.slice(0, length - suffix.length) + suffix;
  }

  // Find last space before length
  const truncated = text.slice(0, length - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace === -1) {
    return truncated + suffix;
  }

  return truncated.slice(0, lastSpace) + suffix;
}

/**
 * Format string case
 */
export const formatCase = {
  /** Capitalize first letter */
  capitalize: (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),

  /** Capitalize each word */
  titleCase: (str: string): string =>
    str.replace(/\b\w/g, (char) => char.toUpperCase()),

  /** camelCase */
  camelCase: (str: string): string =>
    str
      .replace(/[-_]+/g, ' ')
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, ''),

  /** PascalCase */
  pascalCase: (str: string): string =>
    str
      .replace(/[-_]+/g, ' ')
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, ''),

  /** snake_case */
  snakeCase: (str: string): string =>
    str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase(),

  /** kebab-case */
  kebabCase: (str: string): string =>
    str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase(),

  /** CONSTANT_CASE */
  constantCase: (str: string): string =>
    str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toUpperCase(),

  /** Sentence case */
  sentenceCase: (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
};

/**
 * Format indent for multi-line text
 */
export function formatIndent(
  text: string,
  options: {
    /** Indentation string */
    indent?: string;
    /** Indent first line */
    firstLine?: boolean;
  } = {}
): string {
  const { indent = '  ', firstLine = true } = options;

  const lines = text.split('\n');

  if (firstLine) {
    return lines.map((line) => indent + line).join('\n');
  }

  const [first, ...rest] = lines;
  return first + '\n' + rest.map((line) => indent + line).join('\n');
}

/**
 * Default formatter instance
 */
export const format_default = {
  number: formatNumber,
  percent: formatPercent,
  currency: formatCurrency,
  size: formatSize,
  duration: formatDuration,
  date: formatDate,
  relativeTime: formatRelativeTime,
  timeAgo: formatTimeAgo,
  phone: formatPhone,
  creditCard: formatCreditCard,
  ssn: formatSSN,
  email: formatEmail,
  url: formatURL,
  json: formatJSON,
  queryString: formatQueryString,
  template: formatTemplate,
  list: formatList,
  ordinal: formatOrdinal,
  roman: formatRoman,
  wordWrap: formatWordWrap,
  truncate: formatTruncate,
  case: formatCase,
  indent: formatIndent,
};
