import {
  addDays,
  addHours,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  getQuarter,
  isSameDay,
  isSameMinute,
  isSameMonth,
  isSameYear,
  isToday,
  isTomorrow,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from 'date-fns';

const shortenAmPm = (text: string): string => {
  const shortened = (text || '').replace(/ AM/g, 'am').replace(/ PM/g, 'pm');
  const withoutDoubleZero = shortened.includes('m')
    ? shortened.replace(/:00/g, '')
    : shortened;
  return withoutDoubleZero;
};

const removeLeadingZero = (text: string): string => text.replace(/^0/, '');

export const formatTime = (date: Date, locale?: string): string => {
  return removeLeadingZero(
    shortenAmPm(
      date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }) || ''
    )
  );
};

const createFormatTime =
  (locale?: string) =>
  (date: Date): string =>
    formatTime(date, locale);

const getNavigatorLanguage = (): string => {
  if (typeof window === 'undefined') {
    return 'en-US';
  }
  return window.navigator.language;
};

export interface DateRangeFormatOptions {
  today?: Date;
  locale?: string;
  includeTime?: boolean;
  separator?: string;
}

export const formatDateRange = (
  from: Date,
  to: Date,
  {
    today = new Date(),
    locale = getNavigatorLanguage(),
    includeTime = true,
    separator = '-',
  }: DateRangeFormatOptions = {}
): string => {
  const sameYear = isSameYear(from, to);
  const sameMonth = isSameMonth(from, to);
  const sameDay = isSameDay(from, to);
  const thisYear = isSameYear(from, today);

  const yearSuffix = thisYear ? '' : `, ${format(to, 'yyyy')}`;

  const formatTime = createFormatTime(locale);

  const formatDate = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE LLL d');
  };

  const formatDateWithTime = (date: Date): string => {
    return `${formatDate(date)}${includeTime ? `, ${formatTime(date)}` : ''}`;
  };

  // Check if the range is the entire year
  if (
    isSameMinute(startOfYear(from), from) &&
    isSameMinute(endOfYear(to), to)
  ) {
    return `${format(from, 'yyyy')}`;
  }

  // Check if the range is an entire quarter
  if (
    isSameMinute(startOfQuarter(from), from) &&
    isSameMinute(endOfQuarter(to), to) &&
    getQuarter(from) === getQuarter(to)
  ) {
    return `Q${getQuarter(from)} ${format(from, 'yyyy')}`;
  }

  // Check if the range is across entire month
  if (
    isSameMinute(startOfMonth(from), from) &&
    isSameMinute(endOfMonth(to), to)
  ) {
    if (sameMonth && sameYear) {
      // Example: January 2023
      return `${format(from, 'LLLL yyyy')}`;
    }
    // Example: Jan - Feb 2023
    return `${format(from, 'LLL')} ${separator} ${format(to, 'LLL yyyy')}`;
  }
  const formatDateWithYear = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, "LLL d ''yy");
  };

  const formatDateWithoutYear = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'LLL d');
  };

  // Range across years
  // Example: Tomorrow - Feb 12 '24
  if (!sameYear) {
    const fromFormatted = formatDateWithoutYear(from);
    const toFormatted = formatDateWithYear(to);

    return `${fromFormatted}${
      includeTime ? `, ${formatTime(from)}` : ''
    } ${separator} ${toFormatted}${includeTime ? `, ${formatTime(to)}` : ''}`;
  }

  // Range across months
  // Example: Jan 1 - Feb 12[, 2023]
  if (!sameMonth) {
    return `${formatDateWithoutYear(from)}${
      includeTime ? `, ${formatTime(from)}` : ''
    } ${separator} ${formatDateWithoutYear(to)}${
      includeTime ? `, ${formatTime(to)}` : ''
    }${yearSuffix}`;
  }

  // Range across days or within a day
  if (sameDay) {
    return `${formatDateWithoutYear(from)}${
      includeTime ? `, ${formatTime(from)} ${separator} ${formatTime(to)}` : ''
    }${yearSuffix}`;
  } else {
    return `${formatDateWithoutYear(from)}${
      includeTime ? `, ${formatTime(from)}` : ''
    } ${separator} ${formatDateWithoutYear(to)}${
      includeTime ? `, ${formatTime(to)}` : ''
    }${yearSuffix}`;
  }
};

/**
 * from ISO:  2024-10-10T07:00:00.000Z
formatTimePeriodsForCommitmentCard.tsx:24 to ISO:  2024-10-10T19:00:00.000Z
formatTimePeriodsForCommitmentCard.tsx:26 formatted:  Oct 10 - 12pm
 */

console.log(formatDateRange(addHours(new Date(), 26), addDays(new Date(), 50)));

console.log(formatDateRange(addHours(new Date(), 1), addDays(new Date(), 2)));
