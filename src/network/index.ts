/**
 * Network modules - HTTP, WebSocket, and SSE clients
 */

// HTTP exports
export {
  HttpClient,
  createHttpClient,
  http,
  createRetryInterceptor,
  createAuthInterceptor,
  createLoggingInterceptor,
} from './http.js';

export type {
  HttpMethod,
  HttpRequestConfig,
  HttpResponse,
  HttpError,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  HttpClientConfig,
} from './http.js';

// WebSocket exports
export {
  WebSocketClient,
  createWebSocket,
  connectWebSocket,
  JsonRpcWebSocket,
  createJsonRpcWebSocket,
} from './ws.js';

export type {
  WebSocketState,
  WebSocketEvent,
  WebSocketMessage,
  WebSocketOptions,
  MessageListener,
  EventListener,
} from './ws.js';

// SSE exports
export {
  SSEClient,
  createSSE,
  connectSSE,
  subscribeSSE,
} from './sse.js';

export type {
  SSEState,
  SSEEvent,
  SSEOptions,
  SSEEventListener,
} from './sse.js';
