const { extractContacts } = require("../src/extractors/contact");
const { extractSocials } = require("../src/extractors/social");
const { extractMeta } = require("../src/extractors/meta");
const { detectTechStack } = require("../src/extractors/techstack");
const { extractCompetitors } = require("../src/extractors/competitors");
const { normalizeUrl } = require("../src/utils/validateUrl");

const html = `
<html><head>
<title>Acme Cloud | Cloud Computing Platform</title>
<meta name="description" content="Acme builds cloud infrastructure.">
<script src="/_next/static/chunks/main.js"></script>
<script type="application/ld+json">{"@type":"Organization","name":"Acme Cloud","foundingDate":"2015-01-01"}</script>
</head><body>
<a href="mailto:hello@acme.io">Mail</a>
<a href="tel:+919876543210">Call</a>
<a href="https://www.linkedin.com/company/acme">LinkedIn</a>
<a href="https://twitter.com/acme">Twitter</a>
<p>Acme vs Rivalco - see why teams switch. Alternative to Contoso.</p>
</body></html>`;

test("extracts email and phone", () => {
  const c = extractContacts(html);
  expect(c.emails).toContain("hello@acme.io");
  expect(c.phones.length).toBeGreaterThan(0);
});

test("extracts socials", () => {
  const s = extractSocials(html);
  expect(s.linkedin).toContain("linkedin.com/company/acme");
  expect(s.twitter).toContain("twitter.com/acme");
});

test("extracts meta from JSON-LD", () => {
  const m = extractMeta(html, "https://acme.io");
  expect(m.name).toBe("Acme Cloud");
  expect(m.foundedYear).toBe("2015");
  expect(m.industry).toBe("Cloud Computing");
});

test("detects tech stack", () => {
  expect(detectTechStack(html, { server: "nginx" })).toEqual(
    expect.arrayContaining(["Next.js", "Server: nginx"]),
  );
});

test("finds competitors", () => {
  const c = extractCompetitors(html, "Acme Cloud");
  expect(c).toEqual(expect.arrayContaining(["Rivalco", "Contoso"]));
});

test("validates urls", () => {
  expect(normalizeUrl("example.com")).toBe("https://example.com");
  expect(normalizeUrl("not a url")).toBeNull();
});
