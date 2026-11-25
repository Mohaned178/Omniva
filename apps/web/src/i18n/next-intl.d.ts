import type messages from '../../messages/en.json';
import type { LAUNCH_LOCALE } from './request';

// Type-checks every translation key against the English messages.
declare module 'next-intl' {
  interface AppConfig {
    Locale: typeof LAUNCH_LOCALE;
    Messages: typeof messages;
  }
}
