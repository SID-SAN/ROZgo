import { en } from './en';
import { hi } from './hi';
import { ta } from './ta';
import { te } from './te';
import { kn } from './kn';
import { ml } from './ml';
import { bn } from './bn';
import { gu } from './gu';
import { Language } from '../types';

export const translations: Record<Language, any> = {
  en,
  hi,
  ta,
  te,
  kn,
  ml,
  bn,
  gu,
};

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
];

/**
 * Safe translation resolver with nested dot-notation access and fallback to English.
 */
export function getTranslation(
  lang: Language,
  path: string,
  params?: Record<string, string | number>
): string {
  const keys = path.split('.');
  let current: any = translations[lang];

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      current = undefined;
      break;
    }
  }

  // Fallback to English if missing in target language
  if (!current && lang !== 'en') {
    let fallback: any = translations['en'];
    for (const key of keys) {
      if (fallback && typeof fallback === 'object' && key in fallback) {
        fallback = fallback[key];
      } else {
        fallback = undefined;
        break;
      }
    }
    current = fallback;
  }

  if (typeof current !== 'string') {
    return path; // Return key path if not found
  }

  if (params) {
    return Object.entries(params).reduce((str, [paramKey, value]) => {
      return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    }, current);
  }

  return current;
}

