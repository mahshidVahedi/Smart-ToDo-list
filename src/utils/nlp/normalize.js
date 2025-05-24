export function normalizeText(text) {
    return text
      .replace(/[٠-٩۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()) // Persian & Arabic digits to Latin
      .replace(/[\u064B-\u0652]/g, '')         // Remove Arabic diacritics
      .replace(/[ـ]+/g, '')                    // Remove Tatweel (kashida)
      .replace(/\s+/g, ' ')                    // Collapse multiple spaces
      .replace(/\u200c/g, ' ')                 // Remove Zero Width Non-Joiner (ZWNJ)
      .replace(/[^\S\r\n]+/g, ' ')             // Remove non-breaking spaces etc.
      .trim()
  }
  