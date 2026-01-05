/**
 * HTTP client module
 * Wrapper around fetch with interceptors, retry, and more
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface HttpRequestConfig {
  url?: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: unknown;
  timeout?: number;
  signal?: AbortSignal;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
  validateStatus?: (status: number) => boolean;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: HttpRequestConfig;
}

export interface HttpError extends Error {
  config: HttpRequestConfig;
  response?: HttpResponse;
  code?: string;
}

export type RequestInterceptor = (config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>;
export type ResponseInterceptor = (response: HttpResponse) => HttpResponse | Promise<HttpResponse>;
export type ErrorInterceptor = (error: HttpError) => HttpError | Promise<HttpError>;

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  validateStatus?: (status: number) => boolean;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
}

/**
 * Create an HTTP error
 */
function createHttpError(message: string, config: HttpRequestConfig, response?: HttpResponse, code?: string): HttpError {
  const error = new Error(message) as HttpError;
  error.name = 'HttpError';
  error.config = config;
  error.response = response;
  error.code = code;
  return error;
}

/**
 * HTTP Client with interceptors and configurable defaults
 */
export class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;
  private defaultValidateStatus: (status: number) => boolean;
  private defaultResponseType: 'json' | 'text' | 'blob' | 'arrayBuffer';
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL ?? '';
    this.defaultTimeout = config.timeout ?? 30000;
    this.defaultHeaders = config.headers ?? {};
    this.defaultValidateStatus = config.validateStatus ?? ((status) => status >= 200 && status < 300);
    this.defaultResponseType = config.responseType ?? 'json';
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index >= 0) this.requestInterceptors.splice(index, 1);
    };
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index >= 0) this.responseInterceptors.splice(index, 1);
    };
  }

  /**
   * Add an error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index >= 0) this.errorInterceptors.splice(index, 1);
    };
  }

  /**
   * Make an HTTP request
   */
  async request<T = unknown>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    // Apply request interceptors
    let finalConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    // Build URL
    let url = finalConfig.url ?? '';
    if (this.baseURL && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = this.baseURL + (url.startsWith('/') ? '' : '/') + url;
    }

    // Add query params
    if (finalConfig.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(finalConfig.params)) {
        searchParams.append(key, String(value));
      }
      const separator = url.includes('?') ? '&' : '?';
      url += separator + searchParams.toString();
    }

    // Merge headers
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...finalConfig.headers,
    };

    // Prepare body
    let body: BodyInit | undefined;
    if (finalConfig.body !== undefined) {
      if (typeof finalConfig.body === 'string' || finalConfig.body instanceof FormData || finalConfig.body instanceof Blob || finalConfig.body instanceof ArrayBuffer) {
        body = finalConfig.body as BodyInit;
      } else {
        body = JSON.stringify(finalConfig.body);
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeout = finalConfig.timeout ?? this.defaultTimeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combine signals
    let signal = controller.signal;
    if (finalConfig.signal) {
      // If user provided a signal, abort when either signal fires
      const userSignal = finalConfig.signal;
      if (userSignal.aborted) {
        clearTimeout(timeoutId);
        throw createHttpError('Request aborted', finalConfig, undefined, 'EABORTED');
      }
      userSignal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(url, {
        method: finalConfig.method ?? 'GET',
        headers,
        body,
        signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const responseType = finalConfig.responseType ?? this.defaultResponseType;
      let data: T;
      try {
        switch (responseType) {
          case 'text':
            data = (await response.text()) as T;
            break;
          case 'blob':
            data = (await response.blob()) as T;
            break;
          case 'arrayBuffer':
            data = (await response.arrayBuffer()) as T;
            break;
          case 'json':
          default:
            const text = await response.text();
            data = text ? JSON.parse(text) : null;
            break;
        }
      } catch {
        data = null as T;
      }

      let httpResponse: HttpResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: finalConfig,
      };

      // Check status
      const validateStatus = finalConfig.validateStatus ?? this.defaultValidateStatus;
      if (!validateStatus(response.status)) {
        throw createHttpError(
          `Request failed with status ${response.status}`,
          finalConfig,
          httpResponse as HttpResponse,
          'EHTTP'
        );
      }

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        httpResponse = (await interceptor(httpResponse as HttpResponse)) as HttpResponse<T>;
      }

      return httpResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      let httpError: HttpError;
      if ((error as HttpError).config) {
        httpError = error as HttpError;
      } else if (error instanceof Error && error.name === 'AbortError') {
        httpError = createHttpError('Request timeout', finalConfig, undefined, 'ETIMEOUT');
      } else {
        httpError = createHttpError(
          error instanceof Error ? error.message : 'Network error',
          finalConfig,
          undefined,
          'ENETWORK'
        );
      }

      // Apply error interceptors
      for (const interceptor of this.errorInterceptors) {
        httpError = await interceptor(httpError);
      }

      throw httpError;
    }
  }

  /**
   * GET request
   */
  get<T = unknown>(url: string, config?: Omit<HttpRequestConfig, 'url' | 'method'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  /**
   * POST request
   */
  post<T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequestConfig, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', body });
  }

  /**
   * PUT request
   */
  put<T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequestConfig, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  patch<T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequestConfig, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  delete<T = unknown>(url: string, config?: Omit<HttpRequestConfig, 'url' | 'method'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  /**
   * HEAD request
   */
  head<T = unknown>(url: string, config?: Omit<HttpRequestConfig, 'url' | 'method'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'HEAD' });
  }

  /**
   * OPTIONS request
   */
  options<T = unknown>(url: string, config?: Omit<HttpRequestConfig, 'url' | 'method'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'OPTIONS' });
  }

  /**
   * Create a new instance with modified config
   */
  create(config: HttpClientConfig): HttpClient {
    return new HttpClient({
      baseURL: config.baseURL ?? this.baseURL,
      timeout: config.timeout ?? this.defaultTimeout,
      headers: { ...this.defaultHeaders, ...config.headers },
      validateStatus: config.validateStatus ?? this.defaultValidateStatus,
      responseType: config.responseType ?? this.defaultResponseType,
    });
  }
}

/**
 * Retry interceptor factory
 */
export function createRetryInterceptor(options: {
  retries?: number;
  retryDelay?: number | ((attempt: number) => number);
  retryCondition?: (error: HttpError) => boolean;
} = {}): ErrorInterceptor {
  const retries = options.retries ?? 3;
  const retryDelay = options.retryDelay ?? ((attempt) => Math.min(1000 * Math.pow(2, attempt), 30000));
  const retryCondition = options.retryCondition ?? ((error) => {
    // Retry on network errors or 5xx errors
    if (error.code === 'ENETWORK' || error.code === 'ETIMEOUT') return true;
    if (error.response && error.response.status >= 500) return true;
    return false;
  });

  let attemptCount = new WeakMap<HttpRequestConfig, number>();

  return async (error: HttpError): Promise<HttpError> => {
    const config = error.config;
    const attempt = (attemptCount.get(config) ?? 0) + 1;
    attemptCount.set(config, attempt);

    if (attempt <= retries && retryCondition(error)) {
      const delay = typeof retryDelay === 'function' ? retryDelay(attempt) : retryDelay;
      await new Promise(resolve => setTimeout(resolve, delay));

      // Re-throw to trigger retry (caller should catch and retry)
      throw error;
    }

    return error;
  };
}

/**
 * Auth interceptor factory
 */
export function createAuthInterceptor(options: {
  type: 'bearer' | 'basic' | 'custom';
  token?: string | (() => string | Promise<string>);
  username?: string;
  password?: string;
  header?: string;
}): RequestInterceptor {
  return async (config: HttpRequestConfig): Promise<HttpRequestConfig> => {
    const headers = { ...config.headers };

    switch (options.type) {
      case 'bearer': {
        const token = typeof options.token === 'function' ? await options.token() : options.token;
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        break;
      }
      case 'basic': {
        if (options.username && options.password) {
          const credentials = Buffer.from(`${options.username}:${options.password}`).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;
      }
      case 'custom': {
        const token = typeof options.token === 'function' ? await options.token() : options.token;
        const headerName = options.header ?? 'Authorization';
        if (token) {
          headers[headerName] = token;
        }
        break;
      }
    }

    return { ...config, headers };
  };
}

/**
 * Logging interceptor factory
 */
export function createLoggingInterceptor(options: {
  logger?: (message: string) => void;
  logRequest?: boolean;
  logResponse?: boolean;
} = {}): { request: RequestInterceptor; response: ResponseInterceptor } {
  const logger = options.logger ?? console.log;
  const logRequest = options.logRequest ?? true;
  const logResponse = options.logResponse ?? true;

  return {
    request: (config: HttpRequestConfig): HttpRequestConfig => {
      if (logRequest) {
        logger(`[HTTP] ${config.method ?? 'GET'} ${config.url}`);
      }
      return config;
    },
    response: (response: HttpResponse): HttpResponse => {
      if (logResponse) {
        logger(`[HTTP] ${response.status} ${response.config.url}`);
      }
      return response;
    },
  };
}

// Factory function
export function createHttpClient(config?: HttpClientConfig): HttpClient {
  return new HttpClient(config);
}

// Default instance
export const http = createHttpClient();
