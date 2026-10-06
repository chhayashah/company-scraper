const cheerio = require("cheerio");

// Heuristic: "vs X", "alternative to X", "compare with X", "competitors" section
function extractCompetitors(html, ownName = "") {
  const $ = cheerio.load(html);
  $("script, style").remove();
  const text = $("body").text().replace(/\s+/g, " ");
  const found = new Set();

  const patterns = [
    /\bvs\.?\s+([A-Z][\w.&-]{2,25}(?:\s[A-Z][\w.&-]{2,25})?)/g,
    /alternatives? to\s+([A-Z][\w.&-]{2,25})/g,
    /compare(?:d)? (?:to|with)\s+([A-Z][\w.&-]{2,25})/g,
    /switch(?:ing)? from\s+([A-Z][\w.&-]{2,25})/g,
  ];
  patterns.forEach((re) => {
    let m;
    while ((m = re.exec(text)) !== null) found.add(m[1].trim());
  });

  $("a").each((_, el) => {
    const t = $(el).text().trim();
    const m = t.match(/^(?:.+\s)?vs\.?\s+(.+)$/i);
    if (m && m[1].length < 30) found.add(m[1].trim());
  });

  return [...found]
    .filter((c) => c.toLowerCase() !== ownName.toLowerCase())
    .slice(0, 10);
}

module.exports = { extractCompetitors };
