const cheerio = require("cheerio");
const { parsePhoneNumberFromString } = require("libphonenumber-js");

const EMAIL_RE =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}/g;
const JUNK =
  /\.(png|jpe?g|gif|svg|webp|css|js)$|example\.com|sentry|wixpress|domain\.com/i;

function extractContacts(html) {
  const $ = cheerio.load(html);
  const emails = new Set();
  const phones = new Set();

  $('a[href^="mailto:"]').each((_, el) => {
    emails.add(
      $(el)
        .attr("href")
        .replace(/^mailto:/i, "")
        .split("?")[0]
        .trim()
        .toLowerCase(),
    );
  });
  $("script, style").remove();
  const text = $.root().text();
  (text.match(EMAIL_RE) || []).forEach((e) => emails.add(e.toLowerCase()));

  $('a[href^="tel:"]').each((_, el) => {
    const raw = decodeURIComponent(
      $(el).attr("href").replace(/^tel:/i, ""),
    ).trim();
    const parsed =
      parsePhoneNumberFromString(raw, "IN") || parsePhoneNumberFromString(raw);
    phones.add(parsed && parsed.isValid() ? parsed.formatInternational() : raw);
  });
  // text mein international format numbers (+91 98765 43210 type)
  (text.match(/\+\d[\d\s().-]{8,16}\d/g) || []).forEach((raw) => {
    const parsed = parsePhoneNumberFromString(raw.trim());
    if (parsed && parsed.isValid()) phones.add(parsed.formatInternational());
  });

  return {
    emails: [...emails].filter((e) => !JUNK.test(e)),
    phones: [...phones],
  };
}

module.exports = { extractContacts };
