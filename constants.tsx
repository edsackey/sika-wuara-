
import { Language } from './types';

export const AFRICAN_LANGUAGES: Language[] = [
  { code: 'ak', name: 'Akan (Twi)', isAfrican: true },
  { code: 'yo', name: 'Yoruba', isAfrican: true },
  { code: 'ig', name: 'Igbo', isAfrican: true },
  { code: 'sw', name: 'Swahili', isAfrican: true },
  { code: 'zu', name: 'Zulu', isAfrican: true },
  { code: 'ha', name: 'Hausa', isAfrican: true },
  { code: 'am', name: 'Amharic', isAfrican: true },
  { code: 'wo', name: 'Wolof', isAfrican: true },
];

export const FOREIGN_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', isAfrican: false },
  { code: 'zh', name: 'Chinese (Simplified)', isAfrican: false },
  { code: 'es', name: 'Spanish', isAfrican: false },
  { code: 'de', name: 'German', isAfrican: false },
];

export const ALL_LANGUAGES = [...AFRICAN_LANGUAGES, ...FOREIGN_LANGUAGES];
