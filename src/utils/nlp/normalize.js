export function normalizeText(text) {
  return text
    .replace(/[٠-٩۰-۹]/g, d =>
      '۰۱۲۳۴۵۶۷۸۹'.includes(d)
        ? '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()
        : '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()
    )
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[ـ]+/g, '')
    .replace(/\s+/g, ' ')
    // .replace(/\u200c/g, ' ')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim()
}
