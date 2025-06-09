export function extractRepeat(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();

  const isOneTime = /\b(شنبه|یکشنبه|دوشنبه|سه‌شنبه|چهارشنبه|پنج‌شنبه|پنجشنبه|جمعه)\b.*\b(هفته\s*(آینده|بعد))\b/.test(normalized);
  if (isOneTime) return null;

  if (/هر ?روز/.test(normalized)) return 'daily';

  if (/هفته.?ای( یک ?بار)?|هر ?هفته/.test(normalized)) return 'weekly';

  if (/هر (شنبه|یکشنبه|دوشنبه|سه‌شنبه|چهارشنبه|پنج‌شنبه|پنجشنبه|جمعه)/.test(normalized)) {
    return 'weekly';
  }

  return null;
}
