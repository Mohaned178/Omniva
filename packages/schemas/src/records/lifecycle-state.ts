import { LIFECYCLE_STATES } from '@omniva/domain-types';
import { z } from 'zod';

/** Where a record stands in its own life, by building block (GLOSSARY.md). */
export const LifecycleStateSchema = z.enum(LIFECYCLE_STATES).meta({ id: 'LifecycleState' });
