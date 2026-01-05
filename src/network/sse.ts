/**
 * Server-Sent Events client module
 * EventSource wrapper with auto-reconnect and custom events
 */

export type SSEState = 'connecting' | 'open' | 'closed';

export interface SSEEvent {
  type: string;
  data: unknown;
  id?: string;
  retry?: number;
  raw: string;
  timestamp: number;
}

export interface SSEOptions {
  url: string;
  withCredentials?: boolean;
  headers?: Record<string, string>;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectMaxRetries?: number;
  lastEventId?: string;
}

export type SSEEventListener = (event: SSEEvent) => void;

/**
 * Server-Sent Events client
 */
export class SSEClient {
  private url: string;
  private withCredentials: boolean;
  private customHeaders: Record<string, string>;
  private reconnectEnabled: boolean;
  private reconnectInterval: number;
  private reconnectMaxRetries: number;
  private state: SSEState = 'closed';
  private eventSource?: EventSource;
  private abortController?: AbortController;
  private reconnectAttempts = 0;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private lastEventId?: string;
  private listeners: Map<string, Set<SSEEventListener>> = new Map();
  private manualClose = false;

  constructor(options: SSEOptions) {
    this.url = options.url;
    this.withCredentials = options.withCredentials ?? false;
    this.customHeaders = options.headers ?? {};
    this.reconnectEnabled = options.reconnect ?? true;
    this.reconnectInterval = options.reconnectInterval ?? 3000;
    this.reconnectMaxRetries = options.reconnectMaxRetries ?? 10;
    this.lastEventId = options.lastEventId;
  }

  /**
   * Get current connection state
   */
  getState(): SSEState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'open';
  }

  /**
   * Get last event ID
   */
  getLastEventId(): string | undefined {
    return this.lastEventId;
  }

  /**
   * Connect to SSE endpoint
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
   * Disconnect from SSE endpoint
   */
  disconnect(): this {
    this.manualClose = true;
    this.stopReconnect();
    this.closeConnection();
    return this;
  }

  /**
   * Add event listener
   */
  on(event: string, listener: SSEEventListener): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // If using native EventSource and already connected, add listener
    if (this.eventSource && event !== 'message' && event !== 'open' && event !== 'error') {
      this.eventSource.addEventListener(event, (e: MessageEvent) => {
        this.handleEvent(event, e);
      });
    }

    return this;
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: SSEEventListener): this {
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  /**
   * Add one-time event listener
   */
  once(event: string, listener: SSEEventListener): this {
    const onceListener: SSEEventListener = (e) => {
      this.off(event, onceListener);
      listener(e);
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

      const onError = (event: SSEEvent) => {
        cleanup();
        reject(new Error(String(event.data)));
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

    // Check if we need custom headers (requires fetch-based implementation)
    if (Object.keys(this.customHeaders).length > 0) {
      this.createFetchConnection();
    } else {
      this.createNativeConnection();
    }
  }

  private createNativeConnection(): void {
    let url = this.url;
    if (this.lastEventId) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}lastEventId=${encodeURIComponent(this.lastEventId)}`;
    }

    this.eventSource = new EventSource(url, {
      withCredentials: this.withCredentials,
    });

    this.eventSource.onopen = () => {
      this.state = 'open';
      this.reconnectAttempts = 0;
      this.emit('open', {
        type: 'open',
        data: null,
        raw: '',
        timestamp: Date.now(),
      });
    };

    this.eventSource.onerror = () => {
      const wasOpen = this.state === 'open';
      this.state = 'closed';

      this.emit('error', {
        type: 'error',
        data: 'Connection error',
        raw: '',
        timestamp: Date.now(),
      });

      if (wasOpen && !this.manualClose && this.reconnectEnabled) {
        this.scheduleReconnect();
      }
    };

    this.eventSource.onmessage = (e) => {
      this.handleEvent('message', e);
    };

    // Add custom event listeners
    for (const event of this.listeners.keys()) {
      if (event !== 'message' && event !== 'open' && event !== 'error') {
        this.eventSource.addEventListener(event, (e: MessageEvent) => {
          this.handleEvent(event, e);
        });
      }
    }
  }

  private createFetchConnection(): void {
    this.abortController = new AbortController();

    let url = this.url;
    if (this.lastEventId) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}lastEventId=${encodeURIComponent(this.lastEventId)}`;
    }

    const headers: Record<string, string> = {
      ...this.customHeaders,
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
    };

    if (this.lastEventId) {
      headers['Last-Event-ID'] = this.lastEventId;
    }

    fetch(url, {
      method: 'GET',
      headers,
      credentials: this.withCredentials ? 'include' : 'same-origin',
      signal: this.abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        this.state = 'open';
        this.reconnectAttempts = 0;
        this.emit('open', {
          type: 'open',
          data: null,
          raw: '',
          timestamp: Date.now(),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            this.handleDisconnect();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const events = this.parseSSE(buffer);
          buffer = events.remaining;

          for (const event of events.events) {
            this.emit(event.type, event);
          }
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;

        this.state = 'closed';
        this.emit('error', {
          type: 'error',
          data: error.message,
          raw: '',
          timestamp: Date.now(),
        });

        if (!this.manualClose && this.reconnectEnabled) {
          this.scheduleReconnect();
        }
      });
  }

  private parseSSE(buffer: string): { events: SSEEvent[]; remaining: string } {
    const events: SSEEvent[] = [];
    const lines = buffer.split('\n');
    let remaining = '';
    let currentEvent: Partial<SSEEvent> & { dataLines: string[] } = { dataLines: [] };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;

      // Check if this might be an incomplete line (last line without double newline)
      if (i === lines.length - 1 && line !== '') {
        remaining = line;
        break;
      }

      if (line === '') {
        // End of event
        if (currentEvent.dataLines.length > 0) {
          const event: SSEEvent = {
            type: currentEvent.type ?? 'message',
            data: this.parseData(currentEvent.dataLines.join('\n')),
            id: currentEvent.id,
            retry: currentEvent.retry,
            raw: currentEvent.dataLines.join('\n'),
            timestamp: Date.now(),
          };

          if (event.id) {
            this.lastEventId = event.id;
          }

          events.push(event);
        }
        currentEvent = { dataLines: [] };
        continue;
      }

      if (line.startsWith(':')) {
        // Comment, ignore
        continue;
      }

      const colonIndex = line.indexOf(':');
      let field: string;
      let value: string;

      if (colonIndex === -1) {
        field = line;
        value = '';
      } else {
        field = line.slice(0, colonIndex);
        value = line.slice(colonIndex + 1);
        if (value.startsWith(' ')) {
          value = value.slice(1);
        }
      }

      switch (field) {
        case 'event':
          currentEvent.type = value;
          break;
        case 'data':
          currentEvent.dataLines.push(value);
          break;
        case 'id':
          currentEvent.id = value;
          break;
        case 'retry':
          const retry = parseInt(value, 10);
          if (!isNaN(retry)) {
            currentEvent.retry = retry;
            this.reconnectInterval = retry;
          }
          break;
      }
    }

    return { events, remaining };
  }

  private parseData(data: string): unknown {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  private handleEvent(type: string, e: MessageEvent): void {
    const event: SSEEvent = {
      type,
      data: this.parseData(e.data),
      id: e.lastEventId || undefined,
      raw: e.data,
      timestamp: Date.now(),
    };

    if (e.lastEventId) {
      this.lastEventId = e.lastEventId;
    }

    this.emit(type, event);
  }

  private handleDisconnect(): void {
    this.state = 'closed';

    this.emit('close', {
      type: 'close',
      data: null,
      raw: '',
      timestamp: Date.now(),
    });

    if (!this.manualClose && this.reconnectEnabled) {
      this.scheduleReconnect();
    }
  }

  private emit(event: string, data: SSEEvent): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data);
        } catch {
          // Ignore listener errors
        }
      }
    }
  }

  private closeConnection(): void {
    this.state = 'closed';

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.reconnectMaxRetries) {
      this.emit('error', {
        type: 'error',
        data: 'Max reconnection attempts reached',
        raw: '',
        timestamp: Date.now(),
      });
      return;
    }

    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.createConnection();
    }, this.reconnectInterval);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.reconnectAttempts = 0;
  }
}

/**
 * Create an SSE client
 */
export function createSSE(options: SSEOptions): SSEClient {
  return new SSEClient(options);
}

/**
 * Create and connect an SSE client
 */
export function connectSSE(options: SSEOptions): SSEClient {
  const client = new SSEClient(options);
  client.connect();
  return client;
}

/**
 * Simple SSE subscription helper
 */
export function subscribeSSE(
  url: string,
  onMessage: (data: unknown) => void,
  options?: Omit<SSEOptions, 'url'>
): () => void {
  const client = new SSEClient({ url, ...options });

  client.on('message', (event) => {
    onMessage(event.data);
  });

  client.connect();

  return () => client.disconnect();
}
