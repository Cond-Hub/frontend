const DAY_MS = 24 * 60 * 60 * 1000;

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MIDNIGHT_UTC_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.0+)?(?:Z|[+-]00:00)?$/i;

const toLocalCalendarDate = (year: number, month: number, day: number) =>
  new Date(year, month - 1, day, 12, 0, 0, 0);

const parseCalendarDate = (value: string): Date | undefined => {
  const normalized = value.trim();
  const match = DATE_ONLY_PATTERN.exec(normalized) ?? MIDNIGHT_UTC_PATTERN.exec(normalized);
  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return toLocalCalendarDate(year, month, day);
};

export const toDate = (value: string) => {
  const calendarDate = parseCalendarDate(value);
  if (calendarDate) {
    return calendarDate;
  }

  return new Date(value);
};

export const formatDateBR = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(toDate(value));

export const formatMonthYearBR = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
  }).format(toDate(value));

export const isWithinDays = (value: string, days: number) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = toDate(value);
  target.setHours(0, 0, 0, 0);
  const delta = target.getTime() - now.getTime();
  return delta >= 0 && delta <= days * DAY_MS;
};

export const isToday = (value: string) => {
  const now = new Date();
  const target = toDate(value);
  return (
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth() &&
    now.getDate() === target.getDate()
  );
};

export const isThisWeek = (value: string) => {
  const now = new Date();
  const weekday = (now.getDay() + 6) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - weekday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const target = toDate(value);
  return target >= start && target < end;
};

export const groupByMonth = <T extends { dateISO: string }>(items: T[]) => {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = formatMonthYearBR(item.dateISO);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
};

export const groupNotifications = <T extends { createdAtISO: string }>(items: T[]) => {
  return items.reduce<Record<'Hoje' | 'Esta semana' | 'Anteriores', T[]>>(
    (acc, item) => {
      if (isToday(item.createdAtISO)) {
        acc.Hoje.push(item);
      } else if (isThisWeek(item.createdAtISO)) {
        acc['Esta semana'].push(item);
      } else {
        acc.Anteriores.push(item);
      }
      return acc;
    },
    { Hoje: [], 'Esta semana': [], Anteriores: [] }
  );
};
