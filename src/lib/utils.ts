import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveAvatarUrl(
  avatar: string | null | undefined,
  fallbackSeed: string,
  style: 'adventurer' | 'bottts' | 'open-peeps' | 'avataaars' = 'adventurer'
): string {
  if (!avatar || avatar === 'default') {
    const seed = encodeURIComponent(fallbackSeed || 'default');
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  }
  if (
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('/') ||
    avatar.startsWith('./') ||
    avatar.startsWith('data:')
  ) {
    return avatar;
  }
  const seed = encodeURIComponent(avatar);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}

export function parseUtcDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  let str = value.trim();
  if (!str) return null;

  // If already ends with Z or timezone offset (+07:00, -05:00, etc.)
  if (/Z$|[+\-]\d{2}(?::?\d{2})?$/i.test(str)) {
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // If format is date-time without timezone (e.g., 2026-09-23T15:57:52 or 2026-09-23 15:57:52)
  if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/.test(str)) {
    str = str.replace(' ', 'T') + 'Z';
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatVietnamDateTime(
  value: string | Date | null | undefined,
  includeTime = true
): string {
  if (!value) return '';
  const d = typeof value === 'string' ? parseUtcDate(value) : value;
  if (!d || Number.isNaN(d.getTime())) return typeof value === 'string' ? value : '';

  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(includeTime
        ? {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }
        : {}),
    });
    const parts = formatter.formatToParts(d);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';
    const day = getPart('day');
    const month = getPart('month');
    const year = getPart('year');
    if (!includeTime) {
      return `${day}/${month}/${year}`;
    }
    const hour = getPart('hour');
    const minute = getPart('minute');
    const second = getPart('second');
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  } catch {
    const utcMs = d.getTime();
    const vnDate = new Date(utcMs + 7 * 60 * 60 * 1000);
    const day = String(vnDate.getUTCDate()).padStart(2, '0');
    const month = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
    const year = vnDate.getUTCFullYear();
    if (!includeTime) {
      return `${day}/${month}/${year}`;
    }
    const hour = String(vnDate.getUTCHours()).padStart(2, '0');
    const minute = String(vnDate.getUTCMinutes()).padStart(2, '0');
    const second = String(vnDate.getUTCSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  }
}

