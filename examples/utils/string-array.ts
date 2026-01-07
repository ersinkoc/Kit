/**
 * String and Array Utilities Example
 * Common string and array manipulation functions
 */
import { string, array } from '@oxog/kit/utils';

console.log('=== String Utilities ===\n');

// Case transformations
console.log('--- Case Transformations ---');
console.log('camelCase:', string.camelCase('hello world example'));
console.log('pascalCase:', string.pascalCase('hello world example'));
console.log('snakeCase:', string.snakeCase('helloWorldExample'));
console.log('kebabCase:', string.kebabCase('HelloWorldExample'));
console.log('titleCase:', string.titleCase('hello world'));
console.log('capitalize:', string.capitalize('hello'));

// String manipulation
console.log('\n--- String Manipulation ---');
console.log('trim:', `"${string.trim('  hello  ')}"`);
console.log('trimStart:', `"${string.trimStart('  hello  ')}"`);
console.log('trimEnd:', `"${string.trimEnd('  hello  ')}"`);
console.log('pad:', `"${string.pad('hi', 10, '-')}"`);
console.log('padStart:', `"${string.padStart('5', 3, '0')}"`);
console.log('padEnd:', `"${string.padEnd('5', 3, '0')}"`);

// Text operations
console.log('\n--- Text Operations ---');
console.log('truncate:', string.truncate('This is a very long string that needs truncation', 30));
console.log('wordCount:', string.wordCount('Hello world, how are you?'));
console.log('reverse:', string.reverse('Hello'));
console.log('slugify:', string.slugify('Hello World! @2025'));
console.log('escape:', string.escapeHtml('<script>alert("xss")</script>'));
console.log('unescape:', string.unescapeHtml('&lt;div&gt;'));

// Pattern matching
console.log('\n--- Pattern Matching ---');
console.log('startsWith:', string.startsWith('Hello World', 'Hello'));
console.log('endsWith:', string.endsWith('Hello World', 'World'));
console.log('contains:', string.contains('Hello World', 'lo Wo'));
console.log('matches:', string.matches('test@email.com', /^[\w-]+@[\w-]+\.\w+$/));

// Extraction
console.log('\n--- Extraction ---');
console.log('extractNumbers:', string.extractNumbers('abc123def456'));
console.log('extractEmails:', string.extractEmails('Contact john@example.com or jane@test.org'));
console.log('extractUrls:', string.extractUrls('Visit https://example.com or http://test.org'));

// Template
console.log('\n--- Template ---');
console.log('template:', string.template('Hello {{name}}, you have {{count}} messages', { name: 'John', count: 5 }));

console.log('\n\n=== Array Utilities ===\n');

// Basic operations
console.log('--- Basic Operations ---');
const numbers = [1, 2, 3, 4, 5];
console.log('first:', array.first(numbers));
console.log('last:', array.last(numbers));
console.log('nth(2):', array.nth(numbers, 2));
console.log('take(3):', array.take(numbers, 3));
console.log('drop(2):', array.drop(numbers, 2));

// Unique and deduplication
console.log('\n--- Unique & Deduplication ---');
console.log('unique:', array.unique([1, 2, 2, 3, 3, 3, 4]));
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 1, name: 'John Doe' },
];
console.log('uniqueBy(id):', array.uniqueBy(users, 'id'));

// Chunking and grouping
console.log('\n--- Chunking & Grouping ---');
console.log('chunk:', array.chunk([1, 2, 3, 4, 5, 6, 7], 3));
const items = [
  { category: 'fruit', name: 'apple' },
  { category: 'vegetable', name: 'carrot' },
  { category: 'fruit', name: 'banana' },
];
console.log('groupBy:', array.groupBy(items, 'category'));

// Sorting
console.log('\n--- Sorting ---');
const people = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 35 },
];
console.log('sortBy(age):', array.sortBy(people, 'age'));
console.log('sortBy(name):', array.sortBy(people, 'name'));

// Filtering and finding
console.log('\n--- Filtering & Finding ---');
console.log('compact:', array.compact([0, 1, false, 2, '', 3, null, 4, undefined, 5]));
console.log('without:', array.without([1, 2, 3, 4, 5], 2, 4));
console.log('findIndex:', array.findIndex(people, p => p.name === 'Bob'));

// Set operations
console.log('\n--- Set Operations ---');
const a = [1, 2, 3, 4];
const b = [3, 4, 5, 6];
console.log('intersection:', array.intersection(a, b));
console.log('difference:', array.difference(a, b));
console.log('union:', array.union(a, b));

// Transformation
console.log('\n--- Transformation ---');
console.log('flatten:', array.flatten([[1, 2], [3, [4, 5]], 6]));
console.log('flattenDeep:', array.flattenDeep([[1, [2, [3, [4]]]]]]));
console.log('zip:', array.zip(['a', 'b', 'c'], [1, 2, 3]));
console.log('unzip:', array.unzip([['a', 1], ['b', 2], ['c', 3]]));

// Aggregation
console.log('\n--- Aggregation ---');
const nums = [1, 2, 3, 4, 5];
console.log('sum:', array.sum(nums));
console.log('avg:', array.average(nums));
console.log('min:', array.min(nums));
console.log('max:', array.max(nums));

// Shuffle and sample
console.log('\n--- Shuffle & Sample ---');
console.log('shuffle:', array.shuffle([1, 2, 3, 4, 5]));
console.log('sample:', array.sample([1, 2, 3, 4, 5]));
console.log('sampleSize(3):', array.sampleSize([1, 2, 3, 4, 5], 3));

console.log('\n✅ String and array utilities example completed!');
