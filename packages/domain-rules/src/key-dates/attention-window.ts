/**
 * How far ahead of today a Key date joins the attention list: two months, so what is coming is
 * seen early without filling the list with the whole year.
 */
export const ATTENTION_LOOKAHEAD_DAYS = 60;

/**
 * How far back a Key date that has passed stays on the attention list, so a lapsed expiry is
 * not forgotten at once. Handling and snoozing come with reminders.
 */
export const ATTENTION_LOOKBACK_DAYS = 30;
