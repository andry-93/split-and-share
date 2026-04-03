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
    return { isValid: false, messageKey: 'people.validEmailRequired' } as const;
  }

  if (!isEmail && !PHONE_PATTERN.test(normalized)) {
    return { isValid: false, messageKey: 'people.validPhoneRequired' } as const;
  }

  return { isValid: true } as const;
}

export function validatePersonPhone(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return { isValid: true } as const;
  }

  if (!PHONE_PATTERN.test(normalized)) {
    return { isValid: false, messageKey: 'people.validPhoneRequired' } as const;
  }

  return { isValid: true } as const;
}

export function validatePersonEmail(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return { isValid: true } as const;
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return { isValid: false, messageKey: 'people.validEmailRequired' } as const;
  }

  return { isValid: true } as const;
}
