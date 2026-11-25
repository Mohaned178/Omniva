import { z } from 'zod';

const MAX_TITLE_LENGTH = 200;

/** What the user calls a record, such as "Family car". */
export const RecordTitleSchema = z.string().trim().min(1).max(MAX_TITLE_LENGTH);
