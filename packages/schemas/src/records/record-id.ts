import { z } from 'zod';

/** Identifies a record: a random UUID, never guessable (spec, D4). */
export const RecordIdSchema = z.uuid().meta({ id: 'RecordId' });
