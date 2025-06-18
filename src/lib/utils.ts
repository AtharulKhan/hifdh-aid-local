import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a short snippet from a text.
 * @param text The full text.
 * @param wordCount The number of words to include in the snippet.
 * @returns A string snippet ending with "...".
 */
export const getVerseSnippet = (text: string, wordCount: number = 10): string => {
  if (!text) return "";
  const words = text.split(' ');
  if (words.length <= wordCount) {
    return text;
  }
  return words.slice(0, wordCount).join(' ') + '...';
};
