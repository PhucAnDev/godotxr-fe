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
