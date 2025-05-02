import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with k suffix for thousands
 * @param count - number to format
 * @returns formatted string
 */
export function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

/**
 * Format a date in a user-friendly way
 * @param date - date to format
 * @returns formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = new Date(date);
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Generate an image placeholder URL when image loading fails
 * @param name - name to display in the placeholder
 * @returns placeholder URL
 */
export function generatePlaceholderImage(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}
