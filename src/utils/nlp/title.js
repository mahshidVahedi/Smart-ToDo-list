export function extractTitle(text, result) {
  let clean = text;

  // حذف روزها و هفته‌ها
  clean = clean.replace(/(شنبه|یکشنبه|دوشنبه|سه‌شنبه|سه شنبه|چهارشنبه|پنج‌شنبه|پنجشنبه|جمعه)(\s*ی)?(\s*(هفته\s*بعد|هفته\s*آینده))?/g, '');

  // حذف تاریخ شمسی
  clean = clean.replace(/\d{1,2}\s*(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)/g, '');

  // حذف بازه‌های زمانی و ساعات
  clean = clean.replace(/[\d۰-۹]{1,2}([:٫،\.]?\d{0,2})?\s*تا\s*[\d۰-۹]{1,2}([:٫،\.]?\d{0,2})?\s*(صبح|ظهر|عصر|شب)?/g, '');
  clean = clean.replace(/ساعت\s*[\d۰-۹]{1,2}([:٫،\.]?\d{0,2})?\s*(صبح|ظهر|عصر|شب)?/g, '');
  clean = clean.replace(/\s*از\s*(?=ساعت|[\d۰-۹])/g, ' ');

  // حذف علائم نگارشی
  clean = clean.replace(/[!،٫؛؟:«»"'.…]/g, '');

  // حذف افعال ابتدایی خاص
  clean = clean.replace(/^(برگزاری|انجام|ثبت)\s+/g, '');

  clean = clean.trim();

  // حذف توکن‌های بی‌اهمیت
  const ignoreTokens = [
    'هر', 'ساعت', 'شب', 'صبح', 'ظهر', 'عصر', 'تا', 'امروز', 'فردا',
    'پسفردا', 'پس‌فردا', 'هفته', 'بعد', 'آینده', 'روز', 'ی'
  ];
  let tokens = clean.split(/\s+/);

  let filteredTokens = tokens.filter(token => !ignoreTokens.includes(token));
  filteredTokens = filteredTokens.filter(token => token !== 'از' && token !== 'در');

  // اگر priority داره، توکن‌های مربوط به اولویت رو حذف کن
  if (result.priority) {
    const priorityTokens = ['مهم', 'فوری', 'خیلی', 'خیلی‌فوری', 'عادی'];
    filteredTokens = filteredTokens.filter(token => !priorityTokens.includes(token));
  }

  // حذف اعداد تنها
  filteredTokens = filteredTokens.filter(token => !/^\d+$/.test(token));

  const finalTitle = filteredTokens.join(' ').trim();
  return finalTitle.length > 0 ? finalTitle : text.trim();
}
