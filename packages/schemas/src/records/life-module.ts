import { LIFE_MODULES } from '@omniva/domain-types';
import { z } from 'zod';

/** One of the twelve life areas that give records a home (GLOSSARY.md, Module). */
export const LifeModuleSchema = z.enum(LIFE_MODULES).meta({ id: 'LifeModule' });
