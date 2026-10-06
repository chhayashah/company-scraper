const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  query: String,
  seedUrls: [String],
  status: {
    type: String,
    enum: ["pending", "running", "completed", "failed"],
    default: "pending",
  },
  total: { type: Number, default: 0 },
  processed: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  errors: [{ url: String, message: String }],
  createdAt: { type: Date, default: Date.now },
  finishedAt: Date,
});

module.exports = mongoose.model("Job", jobSchema);
