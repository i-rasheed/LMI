export function normalizeNigerianPhone(input: string): string {
  const compact = input.trim().replace(/[\s-]/g, '');

  if (compact.startsWith('+234')) {
    return compact;
  }

  if (compact.startsWith('234')) {
    return `+${compact}`;
  }

  if (compact.startsWith('0')) {
    return `+234${compact.slice(1)}`;
  }

  return `+234${compact}`;
}

export function maskPhone(phone: string): string {
  if (phone.length <= 4) {
    return phone;
  }

  return `${phone.slice(0, 4)}••••${phone.slice(-4)}`;
}
