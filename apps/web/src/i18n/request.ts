import { getRequestConfig } from 'next-intl/server';
import messages from '../../messages/en.json';

/** English only at launch; every string still comes from a translation file (spec, Web app). */
export const LAUNCH_LOCALE = 'en';

export default getRequestConfig(() => ({
  locale: LAUNCH_LOCALE,
  timeZone: 'UTC',
  messages,
}));
