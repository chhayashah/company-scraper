const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },
  // Level 1
  name: String,
  website: String,
  emails: [String],
  phones: [String],
  // Level 2
  socials: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String,
    github: String,
  },
  address: String,
  description: String,
  foundedYear: String,
  industry: String,
  products: [String],
  // Level 3
  techStack: [String],
  projects: [String],
  competitors: [String],
  positioning: String,
  scrapedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Company", companySchema);
