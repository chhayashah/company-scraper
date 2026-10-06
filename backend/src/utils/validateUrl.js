const validator = require("validator");
const axios = require("axios");

function normalizeUrl(input) {
  let url = String(input || "").trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  return validator.isURL(url, {
    require_protocol: true,
    protocols: ["http", "https"],
  })
    ? url
    : null;
}

async function isReachable(url) {
  try {
    await axios.head(url, {
      timeout: 8000,
      maxRedirects: 5,
      validateStatus: (s) => s < 500,
    });
    return true;
  } catch {
    try {
      await axios.get(url, { timeout: 8000, validateStatus: (s) => s < 500 });
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = { normalizeUrl, isReachable };
