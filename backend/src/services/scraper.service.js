const cheerio = require("cheerio");
const { fetchHtml } = require("./fetch.service");
const { renderWithBrowser } = require("./browser.service");
const { extractContacts } = require("../extractors/contact");
const { extractSocials } = require("../extractors/social");
const { extractMeta } = require("../extractors/meta");
const { detectTechStack } = require("../extractors/techstack");
const { extractCompetitors } = require("../extractors/competitors");
const { extractProjects } = require("../extractors/projects");
const logger = require("../utils/logger");

const EXTRA_PATHS = ["/contact", "/contact-us", "/about", "/about-us"];

function findInternalLinks(html, base) {
  const $ = cheerio.load(html);
  const links = new Set();
  $("a[href]").each((_, el) => {
    try {
      const u = new URL($(el).attr("href"), base);
      if (
        u.origin === new URL(base).origin &&
        /contact|about|company|solutions|products|customers|case/i.test(
          u.pathname,
        )
      ) {
        links.add(u.origin + u.pathname);
      }
    } catch {
      /* ignore */
    }
  });
  return [...links];
}

async function scrapeCompany(url) {
  const origin = new URL(url).origin;
  const home = await fetchHtml(origin); // homepage fail hua to error throw hoga (job isko log karega)
  let homeHtml = home.html;

  // SPA fallback
  const textLen = cheerio
    .load(homeHtml)("body")
    .text()
    .replace(/\s+/g, " ")
    .trim().length;
  if (textLen < 500 && process.env.USE_BROWSER_FALLBACK === "true") {
    try {
      homeHtml = await renderWithBrowser(origin);
    } catch (e) {
      logger.warn(`Browser fallback failed for ${origin}: ${e.message}`);
    }
  }

  // extra pages: contact/about (+ homepage se mile relevant links), max 4 pages
  const candidates = [
    ...new Set([
      ...EXTRA_PATHS.map((p) => origin + p),
      ...findInternalLinks(homeHtml, origin),
    ]),
  ]
    .filter((u) => u !== origin && u !== origin + "/")
    .slice(0, 4);
  const pages = [homeHtml];
  for (const p of candidates) {
    try {
      pages.push((await fetchHtml(p, 1)).html);
    } catch (e) {
      logger.info(`Skipped ${p}: ${e.message}`);
    }
  }

  const combined = pages.join("\n");
  const meta = extractMeta(homeHtml, origin);
  const contacts = extractContacts(combined);
  const socials = extractSocials(combined);

  return {
    name: meta.name,
    website: origin,
    emails: contacts.emails.slice(0, 10),
    phones: contacts.phones.slice(0, 5),
    socials,
    address: meta.address,
    description: meta.description,
    foundedYear: meta.foundedYear,
    industry: meta.industry,
    products: meta.products,
    techStack: detectTechStack(homeHtml, home.headers),
    projects: extractProjects(combined),
    competitors: extractCompetitors(combined, meta.name),
    positioning: meta.positioning,
  };
}

module.exports = { scrapeCompany };
