export interface FileValidationResult {
  valid: boolean;
  sanitizedFileName: string;
  mimeType: string;
  sizeBytes: number;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validates uploaded files server-side to prevent malware, path traversal, or unpermitted types.
 */
export function validateEvidenceFile(fileName: string, mimeType: string, sizeBytes: number): FileValidationResult {
  // Sanitize filename to prevent directory traversal
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      sanitizedFileName: sanitized,
      mimeType,
      sizeBytes,
      error: 'File size exceeds 10MB limit. Please upload a smaller photo or PDF document.'
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      sanitizedFileName: sanitized,
      mimeType,
      sizeBytes,
      error: 'Invalid file format. Only JPG, PNG, WEBP images and PDF documents are permitted for case evidence.'
    };
  }

  return {
    valid: true,
    sanitizedFileName: sanitized,
    mimeType,
    sizeBytes
  };
}
