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
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    for (const [key, re] of Object.entries(PATTERNS)) {
      if (!out[key] && re.test(href)) out[key] = href.split("?")[0];
    }
  });
  return out;
}

module.exports = { extractSocials };
