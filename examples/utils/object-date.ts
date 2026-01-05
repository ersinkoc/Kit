/**
 * Object and Date Utilities Example
 * Deep operations on objects and date manipulation
 */
import { object, date, clone } from '@oxog/kit/utils';

console.log('=== Object Utilities ===\n');

// Deep get/set
console.log('--- Deep Get/Set ---');
const user = {
  name: 'John',
  profile: {
    email: 'john@example.com',
    address: {
      city: 'New York',
      zip: '10001',
    },
  },
  settings: {
    notifications: true,
  },
};

console.log('Original:', user);
console.log('get(profile.email):', object.get(user, 'profile.email'));
console.log('get(profile.address.city):', object.get(user, 'profile.address.city'));
console.log('get(missing.path, default):', object.get(user, 'missing.path', 'default-value'));

const updated = object.set({ ...user }, 'profile.address.country', 'USA');
console.log('After set(profile.address.country):', object.get(updated, 'profile.address'));

// Object manipulation
console.log('\n--- Object Manipulation ---');
console.log('keys:', object.keys(user));
console.log('values:', object.values({ a: 1, b: 2, c: 3 }));
console.log('entries:', object.entries({ a: 1, b: 2 }));
console.log('fromEntries:', object.fromEntries([['a', 1], ['b', 2]]));

// Pick and omit
const fullUser = { id: 1, name: 'John', email: 'john@test.com', password: 'secret', role: 'admin' };
console.log('\n--- Pick & Omit ---');
console.log('pick:', object.pick(fullUser, ['id', 'name', 'email']));
console.log('omit:', object.omit(fullUser, ['password']));

// Merge
console.log('\n--- Merge ---');
const defaults = { theme: 'light', language: 'en', notifications: { email: true, push: false } };
const overrides = { theme: 'dark', notifications: { push: true } };
console.log('merge:', object.merge(defaults, overrides));

// Deep clone
console.log('\n--- Deep Clone ---');
const original = { a: { b: { c: 1 } }, arr: [1, 2, 3] };
const cloned = clone.deep(original);
cloned.a.b.c = 999;
cloned.arr.push(4);
console.log('Original:', original);
console.log('Cloned (modified):', cloned);
console.log('Are different:', original.a.b.c !== cloned.a.b.c);

// Flatten and unflatten
console.log('\n--- Flatten & Unflatten ---');
const nested = { a: { b: { c: 1 } }, d: [1, 2] };
const flat = object.flatten(nested);
console.log('flatten:', flat);
console.log('unflatten:', object.unflatten(flat));

// Compare
console.log('\n--- Compare ---');
const obj1 = { a: 1, b: { c: 2 } };
const obj2 = { a: 1, b: { c: 2 } };
const obj3 = { a: 1, b: { c: 3 } };
console.log('isEqual(obj1, obj2):', object.isEqual(obj1, obj2));
console.log('isEqual(obj1, obj3):', object.isEqual(obj1, obj3));
console.log('isEmpty({}):', object.isEmpty({}));
console.log('isEmpty({ a: 1 }):', object.isEmpty({ a: 1 }));

console.log('\n\n=== Date Utilities ===\n');

// Creating dates
console.log('--- Creating Dates ---');
const now = date.create();
console.log('now:', date.format(now, 'YYYY-MM-DD HH:mm:ss'));
console.log('parse:', date.format(date.parse('2024-06-15'), 'YYYY-MM-DD'));
console.log('fromUnix:', date.format(date.fromUnix(1718400000), 'YYYY-MM-DD'));

// Formatting
console.log('\n--- Formatting ---');
const testDate = new Date(2024, 5, 15, 14, 30, 45);
console.log('YYYY-MM-DD:', date.format(testDate, 'YYYY-MM-DD'));
console.log('DD/MM/YYYY:', date.format(testDate, 'DD/MM/YYYY'));
console.log('HH:mm:ss:', date.format(testDate, 'HH:mm:ss'));
console.log('Full:', date.format(testDate, 'YYYY-MM-DD HH:mm:ss'));

// Date math
console.log('\n--- Date Math ---');
const baseDate = new Date(2024, 0, 15);
console.log('Base:', date.format(baseDate, 'YYYY-MM-DD'));
console.log('addDays(7):', date.format(date.addDays(baseDate, 7), 'YYYY-MM-DD'));
console.log('subDays(7):', date.format(date.subDays(baseDate, 7), 'YYYY-MM-DD'));
console.log('addMonths(2):', date.format(date.addMonths(baseDate, 2), 'YYYY-MM-DD'));
console.log('addYears(1):', date.format(date.addYears(baseDate, 1), 'YYYY-MM-DD'));

// Start/End of period
console.log('\n--- Start/End of Period ---');
const midMonth = new Date(2024, 5, 15, 14, 30, 0);
console.log('Date:', date.format(midMonth, 'YYYY-MM-DD HH:mm:ss'));
console.log('startOfDay:', date.format(date.startOfDay(midMonth), 'YYYY-MM-DD HH:mm:ss'));
console.log('endOfDay:', date.format(date.endOfDay(midMonth), 'YYYY-MM-DD HH:mm:ss'));
console.log('startOfMonth:', date.format(date.startOfMonth(midMonth), 'YYYY-MM-DD'));
console.log('endOfMonth:', date.format(date.endOfMonth(midMonth), 'YYYY-MM-DD'));

// Comparisons
console.log('\n--- Comparisons ---');
const date1 = new Date(2024, 0, 15);
const date2 = new Date(2024, 0, 20);
console.log('diffDays:', date.diffDays(date2, date1));
console.log('compare:', date.compare(date2, date1));
console.log('isEqual:', date.isEqual(date1, date1));
console.log('isPast:', date.isPast(new Date(2020, 0, 1)));
console.log('isFuture:', date.isFuture(new Date(2030, 0, 1)));

// Relative time
console.log('\n--- Relative Time ---');
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
console.log('5 minutes ago:', date.relativeTime(fiveMinutesAgo, now));
console.log('2 hours ago:', date.relativeTime(twoHoursAgo, now));
console.log('3 days ago:', date.relativeTime(threeDaysAgo, now));

// Calendar info
console.log('\n--- Calendar Info ---');
console.log('weekdayName:', date.weekdayName(midMonth));
console.log('monthName:', date.monthName(midMonth));
console.log('dayOfYear:', date.dayOfYear(midMonth));
console.log('weekOfYear:', date.weekOfYear(midMonth));
console.log('quarterOfYear:', date.quarterOfYear(midMonth));
console.log('daysInMonth(2024, 2):', date.daysInMonth(2024, 2)); // February leap year
console.log('isLeapYear(2024):', date.isLeapYear(2024));

console.log('\n✅ Object and date utilities example completed!');
