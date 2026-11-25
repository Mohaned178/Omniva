import type { TypeDefinition } from '@omniva/schemas';
import { VEHICLE } from './vehicle.js';

/** Assets & Possessions: the built-in Types whose home it is (ADR 0007). */
export const ASSETS_PACK: readonly TypeDefinition[] = [VEHICLE];
