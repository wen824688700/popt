import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Validate file type
export function validateFileType(file: File): boolean {
  const allowedTypes = ['.txt', '.md', '.pdf'];
  const fileName = file.name.toLowerCase();
  return allowedTypes.some(type => fileName.endsWith(type));
}

// Validate file size (max 5MB)
export function validateFileSize(file: File): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  return file.size <= maxSize;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Validate input length (minimum 10 characters)
export function validateInputLength(input: string): boolean {
  return input.trim().length >= 10;
}
