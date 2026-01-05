/**
 * WebSocket client module
 * Auto-reconnecting WebSocket with events and heartbeat
 */

export type WebSocketState = 'connecting' | 'open' | 'closing' | 'closed';

export type WebSocketEvent = 'open' | 'close' | 'error' | 'message' | 'reconnect' | 'reconnecting';

export interface WebSocketMessage {
  data: unknown;
  raw: string | ArrayBuffer;
  timestamp: number;
}

export interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectMaxRetries?: number;
  reconnectBackoff?: boolean;
  reconnectMaxInterval?: number;
  heartbeat?: boolean;
  heartbeatInterval?: number;
  heartbeatMessage?: string | (() => string);
  heartbeatTimeout?: number;
  binaryType?: 'blob' | 'arraybuffer';
}

export type MessageListener = (message: WebSocketMessage) => void;
export type EventListener = (...args: unknown[]) => void;

/**
 * WebSocket client with auto-reconnect and heartbeat
 */
export class WebSocketClient {
  private url: string;
  private protocols?: string | string[];
  private ws?: WebSocket;
  private state: WebSocketState = 'closed';
  private reconnectEnabled: boolean;
  private reconnectInterval: number;
  private reconnectMaxRetries: number;
  private reconnectBackoff: boolean;
  private reconnectMaxInterval: number;
  private reconnectAttempts = 0;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private heartbeatEnabled: boolean;
  private heartbeatInterval: number;
  private heartbeatMessage: string | (() => string);
  private heartbeatTimeout: number;
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private heartbeatTimeoutTimer?: ReturnType<typeof setTimeout>;
  private binaryType: 'blob' | 'arraybuffer';
  private listeners: Map<WebSocketEvent, Set<EventListener>> = new Map();
  private messageQueue: (string | ArrayBuffer | Blob)[] = [];
  private manualClose = false;

  constructor(options: WebSocketOptions) {
    this.url = options.url;
    this.protocols = options.protocols;
    this.reconnectEnabled = options.reconnect ?? true;
    this.reconnectInterval = options.reconnectInterval ?? 1000;
    this.reconnectMaxRetries = options.reconnectMaxRetries ?? 10;
    this.reconnectBackoff = options.reconnectBackoff ?? true;
    this.reconnectMaxInterval = options.reconnectMaxInterval ?? 30000;
    this.heartbeatEnabled = options.heartbeat ?? false;
    this.heartbeatInterval = options.heartbeatInterval ?? 30000;
    this.heartbeatMessage = options.heartbeatMessage ?? 'ping';
    this.heartbeatTimeout = options.heartbeatTimeout ?? 10000;
    this.binaryType = options.binaryType ?? 'blob';
  }

  /**
   * Get current connection state
   */
  getState(): WebSocketState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'open';
  }

  /**
   * Connect to WebSocket server
   */
  connect(): this {
    if (this.state === 'connecting' || this.state === 'open') {
      return this;
    }

    this.manualClose = false;
    this.createConnection();
    return this;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(code?: number, reason?: string): this {
    this.manualClose = true;
    this.stopReconnect();
    this.stopHeartbeat();

    if (this.ws) {
      this.state = 'closing';
      this.ws.close(code, reason);
    }

    return this;
  }

  /**
   * Send a message
   */
  send(data: string | object | ArrayBuffer | Blob): this {
    const message = typeof data === 'object' && !(data instanceof ArrayBuffer) && !(data instanceof Blob)
      ? JSON.stringify(data)
      : data;

    if (this.state === 'open' && this.ws) {
      this.ws.send(message);
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message);
    }

    return this;
  }

  /**
   * Add event listener
   */
  on(event: WebSocketEvent, listener: EventListener): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return this;
  }

  /**
   * Remove event listener
   */
  off(event: WebSocketEvent, listener: EventListener): this {
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  /**
   * Add one-time event listener
   */
  once(event: WebSocketEvent, listener: EventListener): this {
    const onceListener: EventListener = (...args) => {
      this.off(event, onceListener);
      listener(...args);
    };
    return this.on(event, onceListener);
  }

  /**
   * Wait for connection to be open
   */
  waitForOpen(timeout?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.state === 'open') {
        resolve();
        return;
      }

      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const cleanup = () => {
        this.off('open', onOpen);
        this.off('error', onError);
        if (timeoutId) clearTimeout(timeoutId);
      };

      const onOpen = () => {
        cleanup();
        resolve();
      };

      const onError = (error: unknown) => {
        cleanup();
        reject(error);
      };

      this.on('open', onOpen);
      this.on('error', onError);

      if (timeout) {
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error('Connection timeout'));
        }, timeout);
      }
    });
  }

  private createConnection(): void {
    this.state = 'connecting';

    try {
      this.ws = new WebSocket(this.url, this.protocols);
      this.ws.binaryType = this.binaryType;

      this.ws.onopen = () => {
        this.state = 'open';
        this.reconnectAttempts = 0;

        // Send queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift()!;
          this.ws!.send(message);
        }

        // Start heartbeat
        if (this.heartbeatEnabled) {
          this.startHeartbeat();
        }

        this.emit('open');
      };

      this.ws.onclose = (event) => {
        this.state = 'closed';
        this.stopHeartbeat();

        this.emit('close', event.code, event.reason);

        // Attempt reconnect if not manual close
        if (!this.manualClose && this.reconnectEnabled) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (event) => {
        this.emit('error', event);
      };

      this.ws.onmessage = (event) => {
        // Reset heartbeat timeout on any message
        this.resetHeartbeatTimeout();

        const message: WebSocketMessage = {
          data: this.parseMessage(event.data),
          raw: event.data,
          timestamp: Date.now(),
        };

        this.emit('message', message);
      };
    } catch (error) {
      this.state = 'closed';
      this.emit('error', error);

      if (!this.manualClose && this.reconnectEnabled) {
        this.scheduleReconnect();
      }
    }
  }

  private parseMessage(data: string | ArrayBuffer | Blob): unknown {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    return data;
  }

  private emit(event: WebSocketEvent, ...args: unknown[]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(...args);
        } catch {
          // Ignore listener errors
        }
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.reconnectMaxRetries) {
      this.emit('error', new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;

    let delay = this.reconnectInterval;
    if (this.reconnectBackoff) {
      delay = Math.min(
        this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
        this.reconnectMaxInterval
      );
    }

    this.emit('reconnecting', this.reconnectAttempts, delay);

    this.reconnectTimer = setTimeout(() => {
      this.emit('reconnect', this.reconnectAttempts);
      this.createConnection();
    }, delay);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.reconnectAttempts = 0;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.state === 'open' && this.ws) {
        const message = typeof this.heartbeatMessage === 'function'
          ? this.heartbeatMessage()
          : this.heartbeatMessage;
        this.ws.send(message);

        // Set timeout for response
        this.heartbeatTimeoutTimer = setTimeout(() => {
          // No response, reconnect
          this.ws?.close();
        }, this.heartbeatTimeout);
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = undefined;
    }
  }

  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = undefined;
    }
  }
}

/**
 * Create a WebSocket client
 */
export function createWebSocket(options: WebSocketOptions): WebSocketClient {
  return new WebSocketClient(options);
}

/**
 * Create and connect a WebSocket client
 */
export function connectWebSocket(options: WebSocketOptions): WebSocketClient {
  const client = new WebSocketClient(options);
  client.connect();
  return client;
}

/**
 * JSON-RPC WebSocket client
 */
export class JsonRpcWebSocket {
  private ws: WebSocketClient;
  private requestId = 0;
  private pendingRequests: Map<number, {
    resolve: (result: unknown) => void;
    reject: (error: Error) => void;
    timeout?: ReturnType<typeof setTimeout>;
  }> = new Map();
  private notificationHandlers: Map<string, (params: unknown) => void> = new Map();

  constructor(ws: WebSocketClient) {
    this.ws = ws;
    this.ws.on('message', (msg) => this.handleMessage(msg as WebSocketMessage));
  }

  /**
   * Call a JSON-RPC method
   */
  async call<T = unknown>(method: string, params?: unknown, timeout?: number): Promise<T> {
    const id = ++this.requestId;

    return new Promise<T>((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      const pending: {
        resolve: (result: unknown) => void;
        reject: (error: Error) => void;
        timeout?: ReturnType<typeof setTimeout>;
      } = {
        resolve: resolve as (result: unknown) => void,
        reject,
      };

      if (timeout) {
        pending.timeout = setTimeout(() => {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }, timeout);
      }

      this.pendingRequests.set(id, pending);
      this.ws.send(request);
    });
  }

  /**
   * Send a notification (no response expected)
   */
  notify(method: string, params?: unknown): void {
    const notification = {
      jsonrpc: '2.0',
      method,
      params,
    };
    this.ws.send(notification);
  }

  /**
   * Register a handler for incoming notifications
   */
  onNotification(method: string, handler: (params: unknown) => void): () => void {
    this.notificationHandlers.set(method, handler);
    return () => this.notificationHandlers.delete(method);
  }

  private handleMessage(msg: WebSocketMessage): void {
    const data = msg.data as { jsonrpc?: string; id?: number; method?: string; params?: unknown; result?: unknown; error?: { code: number; message: string } };

    if (data.jsonrpc !== '2.0') return;

    // Response to a request
    if (data.id !== undefined) {
      const pending = this.pendingRequests.get(data.id);
      if (pending) {
        this.pendingRequests.delete(data.id);
        if (pending.timeout) clearTimeout(pending.timeout);

        if (data.error) {
          pending.reject(new Error(`${data.error.code}: ${data.error.message}`));
        } else {
          pending.resolve(data.result);
        }
      }
      return;
    }

    // Notification
    if (data.method) {
      const handler = this.notificationHandlers.get(data.method);
      if (handler) {
        handler(data.params);
      }
    }
  }
}

/**
 * Create a JSON-RPC WebSocket client
 */
export function createJsonRpcWebSocket(options: WebSocketOptions): JsonRpcWebSocket {
  const ws = new WebSocketClient(options);
  return new JsonRpcWebSocket(ws);
}
