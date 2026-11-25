/**
 * The twelve life areas that give records a home (GLOSSARY.md, Module; Product Definition
 * scope). A record's home module comes from its Type.
 */
export const LIFE_MODULES = [
  'productivity',
  'finance',
  'health',
  'knowledge',
  'career',
  'assets',
  'social',
  'travel',
  'home',
  'subscriptions',
  'documents',
  'entertainment',
] as const;

export type LifeModule = (typeof LIFE_MODULES)[number];
