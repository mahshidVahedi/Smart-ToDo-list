export function extractTitle(text, result) {
  let clean = text;

clean = clean.replace(/(شنبه|یکشنبه|دوشنبه|سه‌شنبه|سه شنبه|چهارشنبه|پنج‌شنبه|پنجشنبه|جمعه)(‌?ها)?(\s*ی)?(\s*(هفته\s*بعد|هفته\s*آینده))?/g, '');

  clean = clean.replace(/\d{1,2}\s*(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)/g, '');

  clean = clean.replace(/[\d۰-۹]{1,2}([:٫،\.]?\d{0,2})?\s*تا\s*[\d۰-۹]{1,2}([:٫،\.]?\d{0,2})?\s*(صبح|ظهر|عصر|شب)?/g, '');
  clean = clean.replace(/ساعت\s*[\d۰-۹]{1,2}([:٫،\.]?\d{0,2})?\s*(صبح|ظهر|عصر|شب)?/g, '');
  clean = clean.replace(/\s*از\s*(?=ساعت|[\d۰-۹])/g, ' ');

  clean = clean.replace(/[!،٫؛؟:«»"'.…]/g, '');

  clean = clean.replace(/^(برگزاری|انجام|ثبت)\s+/g, '');

  clean = clean.trim();

  const ignoreTokens = [
    'هر', 'ساعت', 'شب', 'صبح', 'ظهر', 'عصر', 'تا', 'امروز', 'فردا', 'امشب','فرداشب','خیلی',
    'پسفردا', 'پس‌فردا', 'هفته', 'بعد', 'آینده', 'روز', 'ی'
  ];
  let tokens = clean.split(/\s+/);

  let filteredTokens = tokens.filter(token => !ignoreTokens.includes(token));
  filteredTokens = filteredTokens.filter(token => token !== 'از' && token !== 'در');

  const priorityTokens = ['مهم', 'فوری', 'متوسط', 'عادی'];
filteredTokens = filteredTokens.filter(token => !priorityTokens.includes(token));


  filteredTokens = filteredTokens.filter(token => !/^\d+$/.test(token));

  const finalTitle = filteredTokens.join(' ').trim();
  return finalTitle.length > 0 ? finalTitle : text.trim();
}
