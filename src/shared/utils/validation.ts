const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[(]?[0-9]{1,4}[)]?[0-9\s-]{5,}$/;

export function normalizeOptionalText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function validatePersonContact(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return { isValid: true } as const;
  }

  const isEmail = normalized.includes('@');
  if (isEmail && !EMAIL_PATTERN.test(normalized)) {
    return { isValid: false, message: 'Please enter a valid email.' } as const;
  }

  if (!isEmail && !PHONE_PATTERN.test(normalized)) {
    return { isValid: false, message: 'Please enter a valid phone number.' } as const;
  }

  return { isValid: true } as const;
}

