/**
 * HTTP Client Example
 * Make API requests with interceptors and retry
 */
import { createHttpClient, createAuthInterceptor, createLoggingInterceptor } from '@oxog/kit/network';

// Create an HTTP client with base URL
const api = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
});

// Add logging interceptor
const logging = createLoggingInterceptor({
  logger: console.log,
  logRequest: true,
  logResponse: true,
});
api.addRequestInterceptor(logging.request);
api.addResponseInterceptor(logging.response);

// Add auth interceptor (example with bearer token)
const auth = createAuthInterceptor({
  type: 'bearer',
  token: () => 'my-jwt-token', // Can be async function to refresh token
});
api.addRequestInterceptor(auth);

console.log('=== HTTP Client Example ===\n');

// GET request
console.log('--- GET Request ---');
try {
  const response = await api.get<{ id: number; title: string }[]>('/posts', {
    params: { _limit: 3 },
  });
  console.log('Posts:', response.data.map(p => ({ id: p.id, title: p.title.slice(0, 30) })));
} catch (error) {
  console.error('Error:', error);
}

// GET single item
console.log('\n--- GET Single Item ---');
try {
  const response = await api.get<{ id: number; title: string; body: string }>('/posts/1');
  console.log('Post:', {
    id: response.data.id,
    title: response.data.title,
    body: response.data.body.slice(0, 50) + '...',
  });
} catch (error) {
  console.error('Error:', error);
}

// POST request
console.log('\n--- POST Request ---');
try {
  const response = await api.post<{ id: number; title: string }>('/posts', {
    title: 'New Post',
    body: 'This is the post content',
    userId: 1,
  });
  console.log('Created post:', response.data);
} catch (error) {
  console.error('Error:', error);
}

// PUT request
console.log('\n--- PUT Request ---');
try {
  const response = await api.put<{ id: number; title: string }>('/posts/1', {
    id: 1,
    title: 'Updated Post Title',
    body: 'Updated content',
    userId: 1,
  });
  console.log('Updated post:', response.data);
} catch (error) {
  console.error('Error:', error);
}

// DELETE request
console.log('\n--- DELETE Request ---');
try {
  const response = await api.delete('/posts/1');
  console.log('Deleted, status:', response.status);
} catch (error) {
  console.error('Error:', error);
}

// Error handling
console.log('\n--- Error Handling ---');
try {
  await api.get('/nonexistent-endpoint-404');
} catch (error: any) {
  console.log('Error code:', error.code);
  console.log('Error message:', error.message);
  console.log('Response status:', error.response?.status);
}

// Create a new client instance with different config
console.log('\n--- Create Sub-Client ---');
const adminApi = api.create({
  headers: {
    'X-Admin': 'true',
  },
});
console.log('Admin client created with custom headers');

// Request with custom options
console.log('\n--- Custom Request Options ---');
try {
  const response = await api.request({
    url: '/users/1',
    method: 'GET',
    timeout: 5000,
    responseType: 'json',
  });
  console.log('User:', response.data);
} catch (error) {
  console.error('Error:', error);
}

console.log('\n✅ HTTP client example completed!');
