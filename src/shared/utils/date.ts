const DEFAULT_LOCALE = 'en-US';
const DATE_TOKEN_SAMPLE = new Date(Date.UTC(2006, 10, 22)); // 22 Nov 2006

function resolveLocale(locale?: string): string {
  if (locale?.trim()) {
    return locale;
  }

  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().locale;
    if (resolved?.trim()) {
      return resolved;
    }
  } catch {
    // Use default locale when Intl is unavailable.
  }

  return DEFAULT_LOCALE;
}

export function formatDateLocalized(
  value: Date | string,
  options?: Intl.DateTimeFormatOptions,
  locale?: string,
): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(resolveLocale(locale), options).format(parsed);
}

export function formatShortEventDate(value?: string | null, locale?: string): string {
  if (!value) {
    return '';
  }

  return formatDateLocalized(
    value,
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
    locale,
  );
}

export function formatDateTimeLocalized(value?: string | null, locale?: string): string {
  if (!value) {
    return '—';
  }

  const formatted = formatDateLocalized(
    value,
    {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
    locale,
  );

  return formatted || '—';
}

export function getDateInputPlaceholder(locale?: string): string {
  const parts = new Intl.DateTimeFormat(resolveLocale(locale), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(DATE_TOKEN_SAMPLE);

  return parts
    .map((part) => {
      if (part.type === 'day') {
        return 'DD';
      }
      if (part.type === 'month') {
        return 'MM';
      }
      if (part.type === 'year') {
        return 'YYYY';
      }
      return part.value;
    })
    .join('');
}

