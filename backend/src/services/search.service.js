const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("../utils/logger");

const BLOCKED = [
  "linkedin.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "youtube.com",
  "wikipedia.org",
  "crunchbase.com",
  "glassdoor.com",
  "indeed.com",
  "reddit.com",
  "quora.com",
  "medium.com",
  "g2.com",
  "clutch.co",
  "gartner.com",
  "forbes.com",
  "github.com",
];

function usable(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return !BLOCKED.some((b) => host === b || host.endsWith("." + b));
  } catch {
    return false;
  }
}

async function viaSerpApi(query, max) {
  const { data } = await axios.get("https://serpapi.com/search.json", {
    params: { q: query, api_key: process.env.SERPAPI_KEY, num: max * 2 },
    timeout: 15000,
  });
  return (data.organic_results || []).map((r) => r.link);
}

async function viaDuckDuckGo(query) {
  const { data } = await axios.get("https://html.duckduckgo.com/html/", {
    params: { q: query },
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; CompanyScraperBot/1.0)",
    },
    timeout: 15000,
  });
  const $ = cheerio.load(data);
  const links = [];
  $("a.result__a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const m = href.match(/uddg=([^&]+)/);
    links.push(m ? decodeURIComponent(m[1]) : href);
  });
  return links;
}

async function searchCompanies(query) {
  const max = parseInt(process.env.MAX_RESULTS || "10", 10);
  let links = [];
  try {
    links = process.env.SERPAPI_KEY
      ? await viaSerpApi(query, max)
      : await viaDuckDuckGo(query);
  } catch (err) {
    throw new Error(`Search failed: ${err.message}`);
  }
  // sirf homepage (origin) rakho, duplicates hatao
  const seen = new Set();
  const out = [];
  for (const l of links.filter(usable)) {
    const origin = new URL(l).origin;
    if (!seen.has(origin)) {
      seen.add(origin);
      out.push(origin);
    }
    if (out.length >= max) break;
  }
  logger.info(`Search "${query}" -> ${out.length} sites`);
  return out;
}

module.exports = { searchCompanies };
