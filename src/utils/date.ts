/**
 * Date manipulation utilities
 */

/**
 * Get current timestamp
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.now() // 1699900000000
 * ```
 */
export function now(): number {
  return Date.now();
}

/**
 * Create date from timestamp
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.create(1699900000000) // Date object
 * ```
 */
export function create(timestamp?: number): Date {
  return timestamp ? new Date(timestamp) : new Date();
}

/**
 * Parse date from string
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.parse('2024-01-01') // Date object
 * ```
 */
export function parse(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Format date to string
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.format(new Date('2024-01-01'), 'YYYY-MM-DD') // '2024-01-01'
 * ```
 */
export function format(date: Date, pattern = 'YYYY-MM-DD HH:mm:ss'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return pattern
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
    .replace('SSS', milliseconds);
}

/**
 * Add days to date
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.addDays(new Date('2024-01-01'), 7) // 2024-01-08
 * ```
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from date
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.subDays(new Date('2024-01-08'), 7) // 2024-01-01
 * ```
 */
export function subDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Add months to date
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.addMonths(new Date('2024-01-01'), 2) // 2024-03-01
 * ```
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Subtract months from date
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.subMonths(new Date('2024-03-01'), 2) // 2024-01-01
 * ```
 */
export function subMonths(date: Date, months: number): Date {
  return addMonths(date, -months);
}

/**
 * Add years to date
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.addYears(new Date('2024-01-01'), 1) // 2025-01-01
 * ```
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Subtract years from date
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.subYears(new Date('2025-01-01'), 1) // 2024-01-01
 * ```
 */
export function subYears(date: Date, years: number): Date {
  return addYears(date, -years);
}

/**
 * Get start of day
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.startOfDay(new Date('2024-01-01T15:30:00')) // 2024-01-01T00:00:00
 * ```
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.endOfDay(new Date('2024-01-01T15:30:00')) // 2024-01-01T23:59:59
 * ```
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of week
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.startOfWeek(new Date('2024-01-03')) // 2023-12-31 (Monday)
 * ```
 */
export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of week
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.endOfWeek(new Date('2024-01-03')) // 2024-01-07 (Sunday)
 * ```
 */
export function endOfWeek(date: Date): Date {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of month
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.startOfMonth(new Date('2024-01-15')) // 2024-01-01
 * ```
 */
export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of month
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.endOfMonth(new Date('2024-01-15')) // 2024-01-31
 * ```
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of year
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.startOfYear(new Date('2024-06-15')) // 2024-01-01
 * ```
 */
export function startOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of year
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.endOfYear(new Date('2024-06-15')) // 2024-12-31
 * ```
 */
export function endOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get difference in days between two dates
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.diffDays(new Date('2024-01-08'), new Date('2024-01-01')) // 7
 * ```
 */
export function diffDays(dateLeft: Date, dateRight: Date): number {
  const diff = dateLeft.getTime() - dateRight.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get difference in hours between two dates
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.diffHours(new Date('2024-01-01T12:00'), new Date('2024-01-01T08:00')) // 4
 * ```
 */
export function diffHours(dateLeft: Date, dateRight: Date): number {
  const diff = dateLeft.getTime() - dateRight.getTime();
  return Math.floor(diff / (1000 * 60 * 60));
}

/**
 * Get difference in minutes between two dates
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.diffMinutes(new Date('2024-01-01T08:30'), new Date('2024-01-01T08:00')) // 30
 * ```
 */
export function diffMinutes(dateLeft: Date, dateRight: Date): number {
  const diff = dateLeft.getTime() - dateRight.getTime();
  return Math.floor(diff / (1000 * 60));
}

/**
 * Get difference in seconds between two dates
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.diffSeconds(new Date('2024-01-01T08:00:30'), new Date('2024-01-01T08:00:00')) // 30
 * ```
 */
export function diffSeconds(dateLeft: Date, dateRight: Date): number {
  const diff = dateLeft.getTime() - dateRight.getTime();
  return Math.floor(diff / 1000);
}

/**
 * Get difference in milliseconds between two dates
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.diffMs(new Date('2024-01-01T08:00:00.500'), new Date('2024-01-01T08:00:00.000')) // 500
 * ```
 */
export function diffMs(dateLeft: Date, dateRight: Date): number {
  return dateLeft.getTime() - dateRight.getTime();
}

/**
 * Check if date is today
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.isToday(new Date()) // true
 * ```
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is in the past
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.isPast(new Date('2020-01-01')) // true
 * ```
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if date is in the future
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.isFuture(new Date('2030-01-01')) // true
 * ```
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Check if year is leap year
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.isLeapYear(2024) // true
 * date.isLeapYear(2023) // false
 * ```
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get days in month
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.daysInMonth(2024, 1) // 29 (February in leap year)
 * date.daysInMonth(2024, 3) // 31 (March)
 * ```
 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Get day of year
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.dayOfYear(new Date('2024-01-01')) // 1
 * date.dayOfYear(new Date('2024-12-31')) // 366
 * ```
 */
export function dayOfYear(date: Date): number {
  const start = startOfYear(date);
  return Math.ceil(diffDays(date, start)) + 1;
}

/**
 * Get week of year
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.weekOfYear(new Date('2024-01-01')) // 1
 * ```
 */
export function weekOfYear(date: Date): number {
  const start = startOfYear(date);
  const days = diffDays(date, start);
  return Math.ceil((days + 1) / 7);
}

/**
 * Get quarter of year
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.quarterOfYear(new Date('2024-01-15')) // 1
 * date.quarterOfYear(new Date('2024-06-15')) // 2
 * ```
 */
export function quarterOfYear(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

/**
 * Get age from birthdate
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.age(new Date('1990-01-01')) // Age in years
 * ```
 */
export function age(birthDate: Date): number {
  const today = new Date();
  let ageValue = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    ageValue--;
  }
  return ageValue;
}

/**
 * Compare two dates
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.compare(new Date('2024-01-02'), new Date('2024-01-01')) // 1
 * date.compare(new Date('2024-01-01'), new Date('2024-01-01')) // 0
 * date.compare(new Date('2024-01-01'), new Date('2024-01-02')) // -1
 * ```
 */
export function compare(dateLeft: Date, dateRight: Date): number {
  const diff = dateLeft.getTime() - dateRight.getTime();
  return diff === 0 ? 0 : diff > 0 ? 1 : -1;
}

/**
 * Check if two dates are equal
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.isEqual(new Date('2024-01-01'), new Date('2024-01-01')) // true
 * date.isEqual(new Date('2024-01-01'), new Date('2024-01-02')) // false
 * ```
 */
export function isEqual(dateLeft: Date, dateRight: Date): boolean {
  return dateLeft.getTime() === dateRight.getTime();
}

/**
 * Get minimum date
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.min(new Date('2024-01-02'), new Date('2024-01-01')) // 2024-01-01
 * ```
 */
export function min(...dates: Date[]): Date {
  return new Date(Math.min(...dates.map((d) => d.getTime())));
}

/**
 * Get maximum date
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.max(new Date('2024-01-02'), new Date('2024-01-01')) // 2024-01-02
 * ```
 */
export function max(...dates: Date[]): Date {
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

/**
 * Clamp date between min and max
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.clamp(new Date('2024-06-01'), new Date('2024-01-01'), new Date('2024-12-31')) // 2024-06-01
 * date.clamp(new Date('2023-06-01'), new Date('2024-01-01'), new Date('2024-12-31')) // 2024-01-01
 * ```
 */
export function clamp(date: Date, min: Date, max: Date): Date {
  const time = date.getTime();
  const minTime = min.getTime();
  const maxTime = max.getTime();
  return new Date(Math.min(Math.max(time, minTime), maxTime));
}

/**
 * Get timezone offset
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.timezoneOffset(new Date()) // Offset in minutes
 * ```
 */
export function timezoneOffset(date: Date): number {
  return date.getTimezoneOffset();
}

/**
 * Convert to UTC
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.toUTC(new Date('2024-01-01T00:00:00+03:00')) // 2023-12-31T21:00:00Z
 * ```
 */
export function toUTC(date: Date): Date {
  return new Date(date.toUTCString());
}

/**
 * Format date to ISO string
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.toISOString(new Date('2024-01-01')) // '2024-01-01T00:00:00.000Z'
 * ```
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Format date to locale string
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.toLocaleString(new Date(), 'en-US') // '1/1/2024, 12:00:00 AM'
 * ```
 */
export function toLocaleString(date: Date, locale = 'en-US'): string {
  return date.toLocaleString(locale);
}

/**
 * Format date to locale date string
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.toLocaleDateString(new Date(), 'en-US') // '1/1/2024'
 * ```
 */
export function toLocaleDateString(date: Date, locale = 'en-US'): string {
  return date.toLocaleDateString(locale);
}

/**
 * Format date to locale time string
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.toLocaleTimeString(new Date(), 'en-US') // '12:00:00 AM'
 * ```
 */
export function toLocaleTimeString(date: Date, locale = 'en-US'): string {
  return date.toLocaleTimeString(locale);
}

/**
 * Get Unix timestamp
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.toUnix(new Date('2024-01-01')) // 1704067200
 * ```
 */
export function toUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Create date from Unix timestamp
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.fromUnix(1704067200) // 2024-01-01T00:00:00Z
 * ```
 */
export function fromUnix(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Get relative time string
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.relativeTime(new Date(Date.now() - 60000)) // '1 minute ago'
 * ```
 */
export function relativeTime(date: Date, baseDate: Date = new Date()): string {
  const diff = baseDate.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Check if date is valid
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.isValid(new Date('2024-01-01')) // true
 * date.isValid(new Date('invalid')) // false
 * ```
 */
export function isValid(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get days between two dates
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.daysBetween(new Date('2024-01-08'), new Date('2024-01-01')) // [Date objects]
 * ```
 */
export function daysBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let current = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (current <= end) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }

  return dates;
}

/**
 * Get weekday name
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.weekdayName(new Date('2024-01-01')) // 'Monday'
 * date.weekdayName(new Date('2024-01-01'), 'short') // 'Mon'
 * ```
 */
export function weekdayName(date: Date, format: 'long' | 'short' = 'long'): string {
  const options: Intl.DateTimeFormatOptions = { weekday: format };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get month name
 *
 * @example
 * ```typescript
 * import { date } from '@oxog/kit/utils';
 *
 * date.monthName(new Date('2024-01-01')) // 'January'
 * date.monthName(new Date('2024-01-01'), 'short') // 'Jan'
 * ```
 */
export function monthName(date: Date, format: 'long' | 'short' = 'long'): string {
  const options: Intl.DateTimeFormatOptions = { month: format };
  return date.toLocaleDateString('en-US', options);
}
