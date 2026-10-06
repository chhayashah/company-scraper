const cheerio = require("cheerio");

function readJsonLd($) {
  const items = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).contents().text());
      const arr = Array.isArray(json) ? json : json["@graph"] || [json];
      arr.forEach((i) => items.push(i));
    } catch {
      /* invalid JSON-LD ignore */
    }
  });
  return items;
}

function cleanName(title) {
  return (title || "").split(/[|\-–—:·•]/)[0].trim();
}

function guessIndustry(text) {
  const map = {
    "E-commerce": /e-?commerce|online store|marketplace|storefront/i,
    Fintech: /fintech|payments?|banking|lending/i,
    Cybersecurity: /cyber|security|encryption/i,
    Healthcare: /health|medical|clinic|pharma/i,
    Education: /edtech|education|learning platform|courses?/i,
    "Cloud Computing": /cloud|saas|devops|kubernetes|serverless/i,
    "Software Development":
      /software|web development|app development|it services/i,
    "Artificial Intelligence":
      /\bai\b|machine learning|artificial intelligence|llm/i,
  };
  for (const [name, re] of Object.entries(map)) if (re.test(text)) return name;
  return null;
}

function extractMeta(html, url) {
  const $ = cheerio.load(html);
  const ld = readJsonLd($);
  const org = ld.find((i) =>
    /Organization|Corporation|LocalBusiness/i.test(
      [].concat(i["@type"]).join(","),
    ),
  );

  const name =
    org?.name ||
    $('meta[property="og:site_name"]').attr("content") ||
    cleanName($("title").first().text()) ||
    new URL(url).hostname.replace(/^www\./, "");

  const description =
    org?.description ||
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    null;

  let address = null;
  if (org?.address) {
    const a = org.address;
    address =
      typeof a === "string"
        ? a
        : [
            a.streetAddress,
            a.addressLocality,
            a.addressRegion,
            a.postalCode,
            a.addressCountry,
          ]
            .filter(Boolean)
            .join(", ");
  }
  if (!address)
    address = $("address").first().text().replace(/\s+/g, " ").trim() || null;

  const body = $("body").text().replace(/\s+/g, " ");
  const founded =
    org?.foundingDate?.toString().slice(0, 4) ||
    (body.match(
      /(?:founded|established|since)\s+(?:in\s+)?((?:19|20)\d{2})/i,
    ) || [])[1] ||
    null;

  const products = [];
  $("nav a, header a").each((_, el) => {
    const t = $(el).text().trim();
    if (
      /product|solution|service|platform/i.test($(el).attr("href") || "") &&
      t &&
      t.length < 40
    )
      products.push(t);
  });

  const posText = `${description || ""} ${$("title").text()}`;
  const positioning =
    /world'?s (leading|best|largest|#1)|market leader|#1 |number one/i.test(
      posText,
    )
      ? "Leader"
      : /fastest[- ]growing|challenger|alternative to|next[- ]gen/i.test(
            posText,
          )
        ? "Challenger"
        : null;
  return {
    name,
    description: description?.slice(0, 300) || null,
    address: address?.slice(0, 200) || null,
    foundedYear: founded,
    industry: guessIndustry(`${description || ""} ${$("title").text()}`),
    products: [...new Set(products)].slice(0, 8),
    positioning,
  };
}

module.exports = { extractMeta };
