import type { TypeDefinition } from '@omniva/schemas';

/**
 * How many days ahead of a vehicle's registration expiry or inspection the default reminder
 * comes: "about 30 days before an annual renewal" (spec, D47). The built-in Type packs ticket
 * sets the final values for every Type.
 */
const ANNUAL_RENEWAL_REMINDER_DAYS = 30;

/** A car, motorbike or other vehicle someone owns: an Item, at home in Assets & Possessions. */
export const VEHICLE: TypeDefinition = {
  key: 'vehicle',
  block: 'item',
  homeModule: 'assets',
  fields: [
    { key: 'make', kind: 'text' },
    { key: 'model', kind: 'text' },
    { key: 'year', kind: 'number' },
    { key: 'registrationNumber', kind: 'text' },
    { key: 'purchasedOn', kind: 'date' },
    { key: 'registrationExpiresOn', kind: 'date' },
    { key: 'inspectionDueOn', kind: 'date' },
  ],
  keyDateFields: ['registrationExpiresOn', 'inspectionDueOn'],
  defaultReminderRules: [
    { keyDateField: 'registrationExpiresOn', daysBefore: ANNUAL_RENEWAL_REMINDER_DAYS },
    { keyDateField: 'inspectionDueOn', daysBefore: ANNUAL_RENEWAL_REMINDER_DAYS },
  ],
};
