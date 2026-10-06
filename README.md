# Company Scraper (MERN)

Discovers companies from a **search query** or **seed URLs** and extracts contact info, socials, company overview, tech stack, projects and competitors. Results are shown in a React dashboard and exported as CSV/JSON.

**Stack:** MongoDB, Express, React (Vite), Node.js, Cheerio, Axios, Winston, Jest.

## Features

**Core (Level 1)**
- Input: search query or seed URLs, with URL format + reachability validation
- Extracts name, website, emails, phones
- Output: dashboard table, CSV and JSON export
- Error handling: network errors, 4xx/5xx, non-HTML pages. Errors are logged and shown in the UI, and one failed site never stops the job

**Optional**
- **Level 2:** socials, address, description, founded year, industry, products
- **Level 3 (heuristic):** tech stack, projects, competitors, positioning
- Crawls homepage + contact/about + relevant internal links
- Rate limiting (per-domain delay + jitter), concurrency limit, retries, robots.txt support
- Optional Puppeteer fallback for JS-rendered pages
- Dashboard: live progress, stats, search, filter, sort, expandable rows, job history
- Winston logging, Jest tests

## Setup

**Requirements:** Node.js 18+, MongoDB (local or Atlas)

```bash
# Backend
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5000/api/health

# Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

Tip: skip the Chromium download with `PUPPETEER_SKIP_DOWNLOAD=true npm install` (PowerShell: `$env:PUPPETEER_SKIP_DOWNLOAD="true"`).

**`backend/.env`**

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | 5000 | API port |
| `MONGO_URI` | mongodb://127.0.0.1:27017/company_scraper | Database |
| `SERPAPI_KEY` | empty | Optional. Empty means DuckDuckGo search |
| `MAX_RESULTS` | 10 | Max sites per query |
| `CONCURRENCY` | 3 | Parallel scrapes |
| `REQUEST_DELAY_MS` | 1000 | Delay per domain |
| `USE_BROWSER_FALLBACK` | false | Enable Puppeteer fallback |

## Usage

- **Seed URLs:** paste one per line, leave the query box empty
- **Query:** e.g. `cloud computing startups in Europe`, leave the URL box empty
- Click **Start Scraping**, then search/sort/expand rows or download CSV/JSON. The **History** tab reopens old jobs.

**API**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs` | `{ "query": "...", "urls": [...] }` starts a job |
| GET | `/api/jobs`, `/api/jobs/:id` | Job list / status and errors |
| GET | `/api/companies?jobId=` | Extracted companies |
| GET | `/api/companies/export?format=csv\|json&jobId=` | Download results |

## Sample output

`sample_output/companies.csv` and `sample_output/companies.json` (Stripe, Shopify, HubSpot, Zoho).

## Tests

```bash
cd backend && npm test
```

## Design decisions

- Cheerio first, Puppeteer only as an optional fallback for pages with little server-rendered text
- Name/address prefer JSON-LD, then meta tags, then `<title>`. Industry, projects, competitors and positioning are keyword heuristics (best-effort)
- Industry is guessed from title and description only, to avoid false matches
- Search uses SerpAPI if a key is set, otherwise DuckDuckGo. Social and aggregator sites are filtered out
- Jobs run in-process and the client polls every 2s (no Redis needed)
- Seed URLs are normalized to the site origin

## Limitations

- Bot-protected sites may return HTTP 403 (e.g. Freshworks)
- Large companies often hide emails behind forms, so emails can be empty
- JS-only content can be missed without the Puppeteer fallback
- Competitors, industry, projects and positioning can be empty or imprecise
- DuckDuckGo may block automated queries, so use a SerpAPI key for reliable search
- Jobs do not resume after a server restart
- Respect each site's terms of service

## Future improvements

BullMQ + Redis, proxy rotation, sitemap crawling, enrichment APIs (Hunter/Clearbit), config-file selectors, scheduling, Docker Compose.