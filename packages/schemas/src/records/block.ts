import { BLOCKS } from '@omniva/domain-types';
import { z } from 'zod';

/** The building block a Type is built on (GLOSSARY.md). Never shown to users as words. */
export const BlockSchema = z.enum(BLOCKS).meta({ id: 'Block' });
