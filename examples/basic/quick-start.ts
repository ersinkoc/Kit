/**
 * Quick Start Example
 * Basic usage of @oxog/kit utilities
 */
import { array, string, object, date, random } from '@oxog/kit/utils';
import { validate, transform } from '@oxog/kit/validation';
import { log, config, events } from '@oxog/kit/core';

// String utilities
const slug = string.slugify('Hello World Example');
console.log('Slug:', slug); // hello-world-example

const truncated = string.truncate('This is a very long string', 20);
console.log('Truncated:', truncated); // This is a very lon...

// Array utilities
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const chunks = array.chunk(numbers, 3);
console.log('Chunks:', chunks); // [[1,2,3], [4,5,6], [7,8,9], [10]]

const unique = array.unique([1, 2, 2, 3, 3, 3]);
console.log('Unique:', unique); // [1, 2, 3]

const shuffled = array.shuffle([1, 2, 3, 4, 5]);
console.log('Shuffled:', shuffled);

// Object utilities
const user = { name: 'John', address: { city: 'NYC', zip: '10001' } };
const city = object.get(user, 'address.city');
console.log('City:', city); // NYC

const cloned = object.clone(user);
console.log('Cloned:', cloned);

// Date utilities
const now = date.create();
const formatted = date.format(now, 'YYYY-MM-DD HH:mm:ss');
console.log('Formatted date:', formatted);

const nextWeek = date.addDays(now, 7);
console.log('Next week:', date.format(nextWeek, 'YYYY-MM-DD'));

// Random utilities
const uuid = random.uuid();
console.log('UUID:', uuid);

const randomInt = random.int(1, 100);
console.log('Random int:', randomInt);

// Validation
const schema = validate.object({
  name: validate.string().required().min(2),
  email: validate.string().required().email(),
  age: validate.number().optional().min(0).max(150),
});

const result = schema.validate({ name: 'John', email: 'john@example.com', age: 30 });
console.log('Validation result:', result);

// Transform
const sanitizedInput = transform.trim('  hello world  ');
console.log('Sanitized:', sanitizedInput);

const upper = transform.uppercase('hello');
console.log('Uppercase:', upper);

// Logging
log.info('Application started', { version: '1.0.0' });
log.debug('Debug message');
log.warn('Warning message');

// Config
config.set('app.name', 'MyApp');
config.set('app.port', 3000);
console.log('App name:', config.get('app.name'));
console.log('App port:', config.get('app.port'));

// Events
const emitter = events.create();
emitter.on('user:created', (user) => {
  console.log('User created:', user);
});
emitter.emit('user:created', { id: 1, name: 'John' });

console.log('\n✅ Quick start example completed!');
