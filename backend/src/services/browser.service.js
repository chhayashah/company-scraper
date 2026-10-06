// Optional: JS-rendered (SPA) pages ke liye headless browser fallback
const logger = require("../utils/logger");

async function renderWithBrowser(url) {
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    throw new Error("puppeteer not installed");
  }
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForSelector("body", { timeout: 5000 });
    logger.info(`Rendered with browser: ${url}`);
    return await page.content();
  } finally {
    await browser.close();
  }
}

module.exports = { renderWithBrowser };
