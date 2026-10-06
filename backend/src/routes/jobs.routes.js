const router = require("express").Router();
const Job = require("../models/Job");
const { normalizeUrl, isReachable } = require("../utils/validateUrl");
const { runJob } = require("../services/job.service");

// POST /api/jobs   body: { query?: string, urls?: string[] }
router.post("/", async (req, res, next) => {
  try {
    const { query, urls = [] } = req.body;
    if (!query?.trim() && urls.length === 0) {
      return res
        .status(400)
        .json({ error: "Provide a search query or at least one URL" });
    }

    const valid = [];
    const invalid = [];
    for (const raw of urls) {
      const url = normalizeUrl(raw);
      if (!url) {
        invalid.push({ url: raw, reason: "Invalid URL format" });
        continue;
      }
      if (!(await isReachable(url))) {
        invalid.push({ url: raw, reason: "Not reachable" });
        continue;
      }
      valid.push(url);
    }
    if (!query?.trim() && valid.length === 0) {
      return res.status(400).json({ error: "No valid URLs", invalid });
    }

    const job = await Job.create({ query: query?.trim(), seedUrls: valid });
    runJob(job._id); // background mein chalega
    res.status(201).json({ job, invalid });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res) => {
  res.json(await Job.find().sort({ createdAt: -1 }).limit(20));
});

router.get("/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

module.exports = router;
