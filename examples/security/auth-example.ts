/**
 * Authentication Example
 * JWT tokens, password hashing, and encryption
 */
import { jwt, hash, crypto } from '@oxog/kit/security';

// JWT Token Example
console.log('=== JWT Token Example ===');

const jwtService = jwt.create({
  secret: 'my-super-secret-key-that-is-very-long',
  expiresIn: '1h',
  issuer: 'my-app',
});

// Create a token for a user
const payload = {
  userId: '12345',
  email: 'user@example.com',
  roles: ['user', 'admin'],
};

const token = jwtService.sign(payload);
console.log('JWT Token:', token);

// Verify the token
const decoded = jwtService.verify(token);
console.log('Decoded payload:', decoded);

// Check if token is expired
console.log('Is valid:', decoded.valid);

// Password Hashing Example
console.log('\n=== Password Hashing Example ===');

const password = 'MySecurePassword123!';

// Hash the password
const hashedPassword = await hash.password(password);
console.log('Hashed password:', hashedPassword);

// Verify the password
const isValid = await hash.verify(password, hashedPassword);
console.log('Password valid:', isValid);

// Wrong password
const isWrongValid = await hash.verify('WrongPassword', hashedPassword);
console.log('Wrong password valid:', isWrongValid);

// Encryption Example
console.log('\n=== Encryption Example ===');

const encryptionKey = crypto.generateKey(32); // 256-bit key
console.log('Encryption key:', encryptionKey.toString('hex'));

// Encrypt sensitive data
const sensitiveData = JSON.stringify({
  creditCard: '4111-1111-1111-1111',
  cvv: '123',
});

const encrypted = crypto.encrypt(sensitiveData, encryptionKey);
console.log('Encrypted:', encrypted);

// Decrypt the data
const decrypted = crypto.decrypt(encrypted, encryptionKey);
console.log('Decrypted:', JSON.parse(decrypted));

// HMAC for data integrity
console.log('\n=== HMAC Example ===');

const message = 'Important message that needs integrity verification';
const hmacKey = 'my-hmac-secret-key';

const signature = crypto.hmac(message, hmacKey);
console.log('HMAC signature:', signature);

// Verify HMAC
const isValidHmac = crypto.hmac(message, hmacKey) === signature;
console.log('HMAC valid:', isValidHmac);

// Hashing Example
console.log('\n=== Hashing Example ===');

const data = 'Hello, World!';
const sha256 = hash.sha256(data);
const sha512 = hash.sha512(data);
const md5 = hash.md5(data);

console.log('SHA-256:', sha256);
console.log('SHA-512:', sha512);
console.log('MD5:', md5);

// Generate secure random tokens
console.log('\n=== Secure Random Tokens ===');

const apiKey = crypto.randomHex(32);
const sessionId = crypto.randomBase64(24);
const otp = crypto.randomDigits(6);

console.log('API Key:', apiKey);
console.log('Session ID:', sessionId);
console.log('OTP:', otp);

// Constant-time comparison (prevent timing attacks)
console.log('\n=== Secure Comparison ===');

const secret1 = 'my-secret-token';
const secret2 = 'my-secret-token';
const secret3 = 'different-token';

console.log('Same secrets:', crypto.timingSafeEqual(secret1, secret2));
console.log('Different secrets:', crypto.timingSafeEqual(secret1, secret3));

console.log('\n✅ Authentication example completed!');
