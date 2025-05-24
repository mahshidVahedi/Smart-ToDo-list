export function extractTitle(text, result) {
    let clean = text;
  
    clean = clean.replace(/(شنبه|یکشنبه|دوشنبه|سه‌شنبه|سه شنبه|چهارشنبه|پنج‌شنبه|پنجشنبه|جمعه)(\s*ی)?(\s*(هفته\s*بعد|هفته\s*آینده))?/g, '');
    clean = clean.replace(/\d{1,2}\s*(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)/g, '');
    clean = clean.replace(/ساعت\s*[\d۰-۹]{1,2}([:٫،\.]?\d{0,2})?/g, '');
    clean = clean.replace(/[\d۰-۹]{1,2}([:٫،\.]?\d{0,2})?\s*تا\s*[\d۰-۹]{1,2}([:٫،\.]?\d{0,2})?/g, '');
  
    const ignoreTokens = [
      'هر', 'در', 'با', 'ساعت', 'شب', 'صبح', 'ظهر', 'عصر', 'تا',
      'امروز', 'فردا', 'پسفردا', 'پس‌فردا', 'هفته', 'بعد', 'آینده', 'روز', 'ی'
    ];
  
    const tokens = clean.split(/\s+/);
    let filteredTokens = tokens.filter(token => !ignoreTokens.includes(token.trim()));
  
    if (result.priority) {
      const priorityTokens = ['مهم', 'فوری', 'خیلی', 'خیلی‌فوری', 'عادی'];
      filteredTokens = filteredTokens.filter(token => !priorityTokens.includes(token));
    }
  
    filteredTokens = filteredTokens.filter(token => !/^\d+$/.test(token));
  
    return filteredTokens.join(' ').trim();
  }