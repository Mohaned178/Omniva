const DAYS_IN_MONTH_OF_COMMON_YEAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
const FEBRUARY = 2;
const DAYS_IN_LEAP_YEAR_FEBRUARY = 29;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Number of days in a month, with `month` running 1–12. */
export function daysInMonth(year: number, month: number): number {
  if (month === FEBRUARY && isLeapYear(year)) return DAYS_IN_LEAP_YEAR_FEBRUARY;
  const days = DAYS_IN_MONTH_OF_COMMON_YEAR[month - 1];
  if (days === undefined) throw new RangeError(`month must be 1–12, got ${String(month)}`);
  return days;
}
