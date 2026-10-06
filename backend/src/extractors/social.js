const cheerio = require("cheerio");

const PATTERNS = {
  linkedin: /linkedin\.com\/(company|in|school)\//i,
  twitter: /(twitter\.com|x\.com)\/(?!share|intent|home)[\w]+/i,
  facebook: /facebook\.com\/(?!sharer|share)[\w.\-]+/i,
  instagram: /instagram\.com\/[\w.]+/i,
  youtube: /youtube\.com\/(c\/|channel\/|user\/|@)[\w\-]+/i,
  github: /github\.com\/[\w\-]+\/?$/i,
};

function extractSocials(html) {
  const $ = cheerio.load(html);
  const out = {};

  // 1. normal <a href> links
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    for (const [key, re] of Object.entries(PATTERNS)) {
      if (!out[key] && re.test(href)) out[key] = href.split("?")[0];
    }
  });

  // 2. raw HTML / embedded JSON mein chhupe links
  const raw =
    html.match(
      /https?:\/\/(?:www\.)?(?:linkedin|twitter|x|facebook|instagram|youtube)\.com\/[^\s"'<>\\)]+/gi,
    ) || [];
  raw.forEach((u) => {
    for (const [key, re] of Object.entries(PATTERNS)) {
      if (!out[key] && re.test(u)) out[key] = u.split("?")[0];
    }
  });

  return out;
}

module.exports = { extractSocials };
