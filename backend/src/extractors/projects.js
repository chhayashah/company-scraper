const cheerio = require("cheerio");

// Heuristic: "case study / project / portfolio / initiative" headings
function extractProjects(html) {
  const $ = cheerio.load(html);
  const out = new Set();

  $("h1, h2, h3, h4, a").each((_, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim();
    const ctx = ($(el).attr("href") || "") + " " + t;

    if (
      t.length > 5 &&
      t.length < 90 &&
      !/^(read|learn|see|view|get|start|try)\b/i.test(t) &&
      /case[- ]study|project|portfolio|initiative|our work|launch/i.test(ctx)
    ) {
      out.add(t);
    }
  });

  return [...out].slice(0, 8);
}

module.exports = { extractProjects };
