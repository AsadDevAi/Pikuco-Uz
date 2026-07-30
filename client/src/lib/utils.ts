import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'hozir';
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  if (hours < 24) return `${hours} soat oldin`;
  if (days < 7) return `${days} kun oldin`;
  return formatDate(date);
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '...';
}

export function getAvatarFallback(username: string): string {
  return username.charAt(0).toUpperCase();
}

export function getRatingColor(rating: number): string {
  if (rating >= 4) return 'text-green-500';
  if (rating >= 3) return 'text-yellow-500';
  if (rating >= 2) return 'text-orange-500';
  return 'text-red-500';
}

export const TEST_TYPE_LABELS: Record<string, string> = {
  quiz: 'Viktorina',
  identification: 'Identifikatsiya',
  tournament: 'Turnir',
  tree: 'Daraxt',
};

export const TEST_TYPE_COLORS: Record<string, string> = {
  quiz: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  identification: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  tournament: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  tree: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
};
