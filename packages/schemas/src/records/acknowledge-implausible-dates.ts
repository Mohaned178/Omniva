import { z } from 'zod';

/**
 * Set when the user has seen that a date looks like a typo and wants it saved as given (spec
 * D45): they decide, so a real 1960 purchase is never blocked.
 */
export const AcknowledgeImplausibleDatesSchema = z.boolean().optional();
