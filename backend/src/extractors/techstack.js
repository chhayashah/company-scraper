const SIGNATURES = [
  { name: "React", test: /react(\.|-dom)|data-reactroot|__REACT/i },
  { name: "Next.js", test: /_next\/static|__NEXT_DATA__/i },
  {
    name: "Vue.js",
    test: /vue(\.runtime)?(\.min)?\.js|data-v-[a-f0-9]{6}|__VUE__/i,
  },
  { name: "Nuxt", test: /_nuxt\//i },
  { name: "Angular", test: /ng-version|angular(\.min)?\.js/i },
  { name: "Svelte", test: /svelte/i },
  { name: "jQuery", test: /jquery[.-]?[\d.]*(min)?\.js/i },
  { name: "Bootstrap", test: /bootstrap(\.min)?\.(css|js)/i },
  { name: "Tailwind CSS", test: /tailwind/i },
  { name: "WordPress", test: /wp-content|wp-includes/i },
  { name: "Shopify", test: /cdn\.shopify\.com|Shopify\.theme/i },
  { name: "Wix", test: /wixstatic\.com/i },
  { name: "Webflow", test: /webflow/i },
  {
    name: "Google Analytics",
    test: /google-analytics\.com|gtag\(|googletagmanager\.com/i,
  },
  { name: "HubSpot", test: /hs-scripts\.com|hubspot/i },
  { name: "Intercom", test: /intercom/i },
  { name: "Stripe", test: /js\.stripe\.com/i },
  { name: "Cloudflare", test: /cloudflare/i },
];

function detectTechStack(html, headers = {}) {
  const found = new Set();
  SIGNATURES.forEach((s) => {
    if (s.test.test(html)) found.add(s.name);
  });

  const server = headers["server"];
  const powered = headers["x-powered-by"];
  if (server) found.add(`Server: ${server}`);
  if (powered) found.add(powered);
  if (headers["cf-ray"]) found.add("Cloudflare");
  if (headers["x-vercel-id"]) found.add("Vercel");
  if (headers["x-amz-cf-id"]) found.add("AWS CloudFront");

  const gen = html.match(
    /<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i,
  );
  if (gen) found.add(gen[1]);

  return [...found];
}

module.exports = { detectTechStack };
