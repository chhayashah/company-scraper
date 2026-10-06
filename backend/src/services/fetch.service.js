const axios = require("axios");
const robotsParser = require("robots-parser");
const logger = require("../utils/logger");

const UA = "CompanyScraperBot/1.0 (+assignment project)";
const DELAY = parseInt(process.env.REQUEST_DELAY_MS || "1000", 10);
const nextSlot = new Map(); // host -> next allowed timestamp (rate limit per domain)
const robotsCache = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function throttle(host) {
  const jitter = Math.random() * 500; // human-like delay
  const slot = Math.max(Date.now(), nextSlot.get(host) || 0);
  nextSlot.set(host, slot + DELAY + jitter);
  const wait = slot - Date.now();
  if (wait > 0) await sleep(wait);
}

async function allowedByRobots(url) {
  const { origin, host } = new URL(url);
  if (!robotsCache.has(host)) {
    try {
      const { data } = await axios.get(`${origin}/robots.txt`, {
        timeout: 5000,
        headers: { "User-Agent": UA },
      });
      robotsCache.set(host, robotsParser(`${origin}/robots.txt`, String(data)));
    } catch {
      robotsCache.set(host, null); // robots.txt nahi mila -> allowed
    }
  }
  const robots = robotsCache.get(host);
  return robots ? robots.isAllowed(url, UA) !== false : true;
}

async function fetchHtml(url, retries = 2) {
  if (!(await allowedByRobots(url)))
    throw new Error(`Blocked by robots.txt: ${url}`);
  const host = new URL(url).host;

  for (let i = 0; i <= retries; i++) {
    try {
      await throttle(host);
      const res = await axios.get(url, {
        timeout: 12000,
        maxRedirects: 5,
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml",
        },
        responseType: "text",
      });
      const type = res.headers["content-type"] || "";
      if (!type.includes("html")) throw new Error(`Not HTML (${type})`);
      return {
        html: res.data,
        headers: res.headers,
        finalUrl: res.request?.res?.responseUrl || url,
      };
    } catch (err) {
      const status = err.response?.status;
      if (status && status >= 400 && status < 500 && status !== 429)
        throw new Error(`HTTP ${status} for ${url}`);
      logger.warn(`Fetch attempt ${i + 1} failed for ${url}: ${err.message}`);
      if (i === retries)
        throw new Error(`Failed to fetch ${url}: ${err.message}`);
      await sleep(1000 * (i + 1)); // backoff
    }
  }
}

module.exports = { fetchHtml };
