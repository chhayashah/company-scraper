# Company Scraper (MERN)

Search query ya seed URLs se companies discover karke unki details extract karta hai.

## Features
- **Level 1 (Basic):** name, website, emails, phones
- **Level 2 (Medium):** social links, address, description, founded year, industry, products
- **Level 3 (light):** tech stack fingerprinting, projects, competitors, positioning (heuristic)
- Query -> URLs (SerpAPI ya DuckDuckGo), URL validation + reachability check
- Crawling: homepage + contact/about + relevant internal links (max 4 extra pages)
- robots.txt respect, per-domain rate limit + jitter, retries with backoff
- Optional Puppeteer fallback for JS-rendered pages
- Background jobs + progress polling, React dashboard, CSV/JSON export
- Winston logging (`scraper.log`), Jest unit tests

## Setup
1. MongoDB chalu rakho (local ya Atlas)
2. Server:
   cd server && cp .env.example .env && npm install && npm run dev
3. Client:
   cd client && npm install && npm run dev
4. Open http://localhost:5173

## Tests
cd server && npm test

## Design decisions / assumptions
- Extraction heuristics-based hai (regex, JSON-LD, meta tags), isliye competitors/industry/positioning 100% accurate nahi honge
- Job queue in-memory hai (production mein BullMQ + Redis better rahega)
- Social/aggregator sites search results se filter ki gayi hain
- robots.txt disallow wale pages skip hote hain
