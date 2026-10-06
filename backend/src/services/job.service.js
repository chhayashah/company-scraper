const pLimit = require("p-limit");
const Job = require("../models/Job");
const Company = require("../models/Company");
const { searchCompanies } = require("./search.service");
const { scrapeCompany } = require("./scraper.service");
const logger = require("../utils/logger");

async function runJob(jobId) {
  const job = await Job.findById(jobId);
  try {
    job.status = "running";
    let urls = job.seedUrls;
    if (job.query) {
      const found = await searchCompanies(job.query);
      urls = [...new Set([...urls, ...found])];
    }
    job.total = urls.length;
    await job.save();

    if (urls.length === 0) throw new Error("No URLs found to scrape");

    const limit = pLimit(parseInt(process.env.CONCURRENCY || "3", 10));
    await Promise.all(
      urls.map((url) =>
        limit(async () => {
          try {
            const data = await scrapeCompany(url);
            await Company.create({ ...data, jobId });
            logger.info(`Scraped ${url}`);
          } catch (err) {
            logger.error(`Failed ${url}: ${err.message}`);
            await Job.updateOne(
              { _id: jobId },
              {
                $inc: { failed: 1 },
                $push: { errors: { url, message: err.message } },
              },
            );
          } finally {
            await Job.updateOne({ _id: jobId }, { $inc: { processed: 1 } });
          }
        }),
      ),
    );

    await Job.updateOne(
      { _id: jobId },
      { status: "completed", finishedAt: new Date() },
    );
  } catch (err) {
    logger.error(`Job ${jobId} failed: ${err.message}`);
    await Job.updateOne(
      { _id: jobId },
      {
        status: "failed",
        finishedAt: new Date(),
        $push: { errors: { url: "-", message: err.message } },
      },
    );
  }
}

module.exports = { runJob };
