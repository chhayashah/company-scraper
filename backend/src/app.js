const express = require("express");
const cors = require("cors");
const jobsRoutes = require("./routes/jobs.routes");
const companiesRoutes = require("./routes/companies.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/jobs", jobsRoutes);
app.use("/api/companies", companiesRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

module.exports = app;
