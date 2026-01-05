/**
 * MIME type utilities
 */

/**
 * Common MIME type mappings
 */
const MIME_MAP: Record<string, string> = {
  // Text
  'txt': 'text/plain',
  'html': 'text/html',
  'htm': 'text/html',
  'css': 'text/css',
  'js': 'text/javascript',
  'mjs': 'text/javascript',
  'json': 'application/json',
  'xml': 'application/xml',
  'csv': 'text/csv',
  'md': 'text/markdown',

  // Images
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'ico': 'image/x-icon',
  'webp': 'image/webp',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',

  // Audio
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'ogg': 'audio/ogg',
  'flac': 'audio/flac',
  'aac': 'audio/aac',
  'm4a': 'audio/mp4',
  'wma': 'audio/x-ms-wma',

  // Video
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'ogv': 'video/ogg',
  'avi': 'video/x-msvideo',
  'mov': 'video/quicktime',
  'wmv': 'video/x-ms-wmv',
  'flv': 'video/x-flv',
  'mkv': 'video/x-matroska',
  'm4v': 'video/mp4',

  // Documents
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'odt': 'application/vnd.oasis.opendocument.text',
  'ods': 'application/vnd.oasis.opendocument.spreadsheet',
  'odp': 'application/vnd.oasis.opendocument.presentation',

  // Archives
  'zip': 'application/zip',
  'rar': 'application/vnd.rar',
  'tar': 'application/x-tar',
  'gz': 'application/gzip',
  'bz2': 'application/x-bzip2',
  '7z': 'application/x-7z-compressed',
  'xz': 'application/x-xz',

  // Fonts
  'woff': 'font/woff',
  'woff2': 'font/woff2',
  'ttf': 'font/ttf',
  'otf': 'font/otf',
  'eot': 'application/vnd.ms-fontobject',

  // Other
  'bin': 'application/octet-stream',
  'exe': 'application/octet-stream',
  'dll': 'application/octet-stream',
  'so': 'application/octet-stream',
  'iso': 'application/x-iso9660-image',
};

/**
 * Extension to MIME type map
 */
const EXTENSION_MAP: Record<string, string> = {
  'text/plain': 'txt',
  'text/html': 'html',
  'text/css': 'css',
  'text/javascript': 'js',
  'application/json': 'json',
  'application/xml': 'xml',
  'text/csv': 'csv',
  'text/markdown': 'md',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
  'image/webp': 'webp',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/flac': 'flac',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/gzip': 'gz',
  'font/woff': 'woff',
  'font/woff2': 'woff2',
  'font/ttf': 'ttf',
  'font/otf': 'otf',
  'application/octet-stream': 'bin',
};

/**
 * Get MIME type from file extension
 *
 * @example
 * ```typescript
 * import { mime } from '@oxog/kit/utils';
 *
 * mime.getType('jpg') // 'image/jpeg'
 * mime.getType('pdf') // 'application/pdf'
 * ```
 */
export function getType(extension: string): string | undefined {
  const ext = extension.startsWith('.') ? extension.slice(1) : extension.toLowerCase();
  return MIME_MAP[ext];
}

/**
 * Get file extension from MIME type
 *
 * @example
 * ```typescript
 * import { mime } from '@oxog/kit/utils';
 *
 * mime.getExtension('image/jpeg') // 'jpg'
 * mime.getExtension('application/pdf') // 'pdf'
 * ```
 */
export function getExtension(mimeType: string): string | undefined {
  const type = mimeType.toLowerCase();
  return EXTENSION_MAP[type];
}

/**
 * Check if MIME type is text
 *
 * @example
 * ```typescript
 * import { mime } from '@oxog/kit/utils';
 *
 * mime.isText('text/html') // true
 * mime.isText('application/json') // true
 * mime.isText('image/png') // false
 * ```
 */
export function isText(mimeType: string): boolean {
  const type = mimeType.toLowerCase();
  return type.startsWith('text/') ||
    type === 'application/json' ||
    type === 'application/xml' ||
    type === 'application/javascript' ||
    type === 'application/x-www-form-urlencoded';
}

/**
 * Check if MIME type is image
 *
 * @example
 * ```typescript
 * import { mime } from '@oxog/kit/utils';
 *
 * mime.isImage('image/png') // true
 * mime.isImage('image/jpeg') // true
 * mime.isImage('application/pdf') // false
 * ```
 */
export function isImage(mimeType: string): boolean {
  return mimeType.toLowerCase().startsWith('image/');
}

/**
 * Check if MIME type is audio
 *
 * @example
 * ```typescript
 * import { mime } from '@oxog/kit/utils';
 *
 * mime.isAudio('audio/mpeg') // true
 * mime.isAudio('audio/wav') // true
 * mime.isAudio('image/png') // false
 * ```
 */
export function isAudio(mimeType: string): boolean {
  return mimeType.toLowerCase().startsWith('audio/');
}

/**
 * Check if MIME type is video
 *
 * @example
 * ```typescript
 * import { mime } from '@oxog/kit/utils';
 *
 * mime.isVideo('video/mp4') // true
 * mime.isVideo('video/webm') // true
 * mime.isVideo('image/png') // false
 * ```
 */
export function isVideo(mimeType: string): boolean {
  return mimeType.toLowerCase().startsWith('video/');
}

/**
 * Check if MIME type is application
 *
 * @example
 * ```typescript
 * import { mime } from '@oxog/kit/utils';
 *
 * mime.isApplication('application/json') // true
 * mime.isApplication('application/pdf') // true
 * mime.isApplication('text/html') // false
 * ```
 */
export function isApplication(mimeType: string): boolean {
  return mimeType.toLowerCase().startsWith('application/');
}

/**
 * Get MIME type from filename
 *
 * @example
 * ```typescript
 * import { mime } from '@oxog/kit/utils';
 *
 * mime.lookup('file.jpg') // 'image/jpeg'
 * mime.lookup('file.pdf') // 'application/pdf'
 * ```
 */
export function lookup(filename: string): string | undefined {
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.') + 1) : '';
  if (!ext) return undefined;
  return getType(ext);
}

/**
 * Check if filename is of given MIME type
 *
 * @example
 * ```typescript
 * import { mime } from '@oxog/kit/utils';
 *
 * mime.isType('file.jpg', 'image/jpeg') // true
 * mime.isType('file.pdf', 'image/png') // false
 * ```
 */
export function isType(filename: string, mimeType: string): boolean {
  const fileMime = lookup(filename);
  if (!fileMime) return false;
  return fileMime.toLowerCase() === mimeType.toLowerCase();
}

/**
 * Get charset for MIME type
 *
 * @example
 * ```typescript
 * import { mime } from '@oxog/kit/utils';
 *
 * mime.getCharset('text/html') // 'UTF-8'
 * mime.getCharset('image/png') // undefined
 * ```
 */
export function getCharset(mimeType: string): string | undefined {
  if (isText(mimeType)) {
    return 'UTF-8';
  }
  return undefined;
}
