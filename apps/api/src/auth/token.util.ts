import ms from 'ms';

/** Resolves a duration string like "30d" or "15m" to an absolute expiry Date. */
export function expiryDateFromNow(duration: string): Date {
  const millis = ms(duration as ms.StringValue);
  return new Date(Date.now() + millis);
}
