import { useTranslations } from 'next-intl';

/**
 * The words for built-in Types, which are keyed by the Type's key in the translation files
 * (`types.<typeKey>`). Keys come from the API, so each lookup checks the key exists and falls
 * back to the key itself rather than failing.
 */
export function useTypeWording() {
  const t = useTranslations('types');
  // Type and field keys are data from the API, so they can't be checked against the messages
  // at compile time; `t.has` checks them at run time instead.
  const wording = (key: string): string => (t.has(key as never) ? t(key as never) : key);
  return {
    typeName: (typeKey: string) => wording(`${typeKey}.name`),
    addType: (typeKey: string) => wording(`${typeKey}.add`),
    newType: (typeKey: string) => wording(`${typeKey}.new`),
    fieldLabel: (typeKey: string, fieldKey: string) => wording(`${typeKey}.fields.${fieldKey}`),
  };
}
