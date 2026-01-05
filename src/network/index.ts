/**
 * Network modules - HTTP, WebSocket, and SSE clients
 */

// Placeholder exports - modules will be implemented
export const HttpClient = class {};
export const WebSocketClient = class {};
export const SSEClient = class {};

export const createHttp = () => new HttpClient();
export const createWebSocket = () => new WebSocketClient();
export const createSSE = () => new SSEClient();

export const http = createHttp();
export const ws = createWebSocket();
export const sse = createSSE();
