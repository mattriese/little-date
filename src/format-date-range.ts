import {
  differenceInDays,
  endOfDay,
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
  startOfDay,
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

  const yearSuffix = thisYear ? '' : `, ${format(from, 'yyyy')}`;

  const formatTime = createFormatTime(locale);

  const formatDateWithYear = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, "LLL d ''yy");
  };

  const formatDateWithoutYear = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE LLL d');
  };

  // Check if the range covers exact full days
  const isFullDays =
    isSameMinute(from, startOfDay(from)) && isSameMinute(to, startOfDay(to));
  if (isFullDays) {
    const days = differenceInDays(to, from);
    if (days === 1) {
      return formatDateWithoutYear(from) + yearSuffix;
    } else if (days > 1) {
      return `${formatDateWithoutYear(
        from
      )} ${separator} ${formatDateWithoutYear(
        endOfDay(new Date(to.getTime() - 1))
      )}${yearSuffix}`;
    }
  }

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
      return `${format(from, 'LLLL yyyy')}`;
    }
    return `${format(from, 'LLL')} ${separator} ${format(to, 'LLL yyyy')}`;
  }

  // Range across years
  // Example: Tomorrow - Feb 12 '24
  if (!sameYear) {
    const fromFormatted = formatDateWithoutYear(from);
    const toFormatted = formatDateWithYear(to);

    return `${fromFormatted}${
      includeTime ? `, ${formatTime(from)}` : ''
    } ${separator} ${toFormatted}${includeTime ? `, ${formatTime(to)}` : ''}`;
  }

  // Same day, different times
  if (sameDay && includeTime) {
    return `${formatDateWithoutYear(from)}, ${formatTime(
      from
    )} ${separator} ${formatTime(to)}${yearSuffix}`;
  }

  // Range across months or days within the same year
  // Example: Today - Mon Oct 7[, 2023]
  return `${formatDateWithoutYear(from)}${
    includeTime ? `, ${formatTime(from)}` : ''
  } ${separator} ${formatDateWithoutYear(to)}${
    includeTime ? `, ${formatTime(to)}` : ''
  }${yearSuffix}`;
};

const from = new Date('2024-01-01T08:00:00.000Z');
const to = new Date('2024-01-01T09:00:00.000Z');

console.log(formatDateRange(from, to));
