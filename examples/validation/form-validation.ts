/**
 * Form Validation Example
 * Comprehensive form validation with custom rules
 */
import { validate, transform, sanitize } from '@oxog/kit/validation';

// Define a user registration schema
const registrationSchema = validate.object({
  username: validate.string()
    .required()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .pattern(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'),

  email: validate.string()
    .required()
    .email('Please enter a valid email address'),

  password: validate.string()
    .required()
    .min(8, 'Password must be at least 8 characters')
    .pattern(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .pattern(/[a-z]/, 'Password must contain at least one lowercase letter')
    .pattern(/[0-9]/, 'Password must contain at least one number'),

  confirmPassword: validate.string()
    .required(),

  age: validate.number()
    .optional()
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Invalid age'),

  website: validate.string()
    .optional()
    .url('Please enter a valid URL'),

  acceptTerms: validate.boolean()
    .required()
    .equals(true, 'You must accept the terms and conditions'),
});

// Example: Valid input
const validInput = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123',
  age: 25,
  website: 'https://example.com',
  acceptTerms: true,
};

console.log('=== Valid Input ===');
const validResult = registrationSchema.validate(validInput);
console.log('Valid:', validResult.valid);
if (validResult.valid) {
  console.log('Data:', validResult.data);
}

// Example: Invalid input with multiple errors
const invalidInput = {
  username: 'Jo', // Too short
  email: 'invalid-email', // Invalid email format
  password: 'weak', // Too short, missing uppercase and number
  confirmPassword: 'different', // Doesn't match
  age: 10, // Too young
  website: 'not-a-url', // Invalid URL
  acceptTerms: false, // Must be true
};

console.log('\n=== Invalid Input ===');
const invalidResult = registrationSchema.validate(invalidInput);
console.log('Valid:', invalidResult.valid);
if (!invalidResult.valid) {
  console.log('Errors:', invalidResult.errors);
}

// Using transform to sanitize input before validation
const userInput = {
  username: '  John_Doe  ',
  email: '  JOHN@EXAMPLE.COM  ',
  bio: '<script>alert("xss")</script>Hello World',
};

console.log('\n=== Sanitizing Input ===');
const sanitizedInput = {
  username: transform.lowercase(transform.trim(userInput.username)),
  email: transform.lowercase(transform.trim(userInput.email)),
  bio: sanitize.stripTags(userInput.bio),
};
console.log('Before:', userInput);
console.log('After:', sanitizedInput);

// Custom validation with compound rules
const passwordSchema = validate.string()
  .min(8)
  .custom((value) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);

    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (strength < 3) {
      return {
        valid: false,
        message: 'Password must contain at least 3 of: uppercase, lowercase, number, special character',
      };
    }
    return { valid: true };
  });

console.log('\n=== Password Strength Validation ===');
console.log('weak123:', passwordSchema.validate('weak123'));
console.log('Strong1!:', passwordSchema.validate('Strong1!'));

// Array validation
const tagsSchema = validate.array(
  validate.string().min(2).max(20)
).min(1).max(5);

console.log('\n=== Array Validation ===');
console.log('Valid tags:', tagsSchema.validate(['javascript', 'typescript', 'node']));
console.log('Too many tags:', tagsSchema.validate(['a', 'b', 'c', 'd', 'e', 'f']));

console.log('\n✅ Form validation example completed!');
