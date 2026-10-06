const router = require("express").Router();
const Company = require("../models/Company");

const flat = (c) => ({
  name: c.name,
  website: c.website,
  emails: (c.emails || []).join("; "),
  phones: (c.phones || []).join("; "),
  linkedin: c.socials?.linkedin || "",
  twitter: c.socials?.twitter || "",
  facebook: c.socials?.facebook || "",
  instagram: c.socials?.instagram || "",
  address: c.address || "",
  description: c.description || "",
  foundedYear: c.foundedYear || "",
  industry: c.industry || "",
  products: (c.products || []).join("; "),
  techStack: (c.techStack || []).join("; "),
  projects: (c.projects || []).join("; "),
  competitors: (c.competitors || []).join("; "),
  positioning: c.positioning || "",
});

const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;

// GET /api/companies?jobId=...
router.get("/", async (req, res) => {
  const filter = req.query.jobId ? { jobId: req.query.jobId } : {};
  res.json(await Company.find(filter).sort({ scrapedAt: -1 }).lean());
});

// GET /api/companies/export?format=csv|json&jobId=...
router.get("/export", async (req, res) => {
  const filter = req.query.jobId ? { jobId: req.query.jobId } : {};
  const companies = await Company.find(filter).lean();

  if (req.query.format === "csv") {
    const rows = companies.map(flat);
    const headers = rows[0] ? Object.keys(rows[0]) : Object.keys(flat({}));
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(",")),
    ].join("\n");
    res.header("Content-Type", "text/csv");
    res.attachment("companies.csv");
    return res.send(csv);
  }
  res.attachment("companies.json");
  res.json(companies);
});

module.exports = router;
