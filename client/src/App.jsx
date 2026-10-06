import { useEffect, useState } from "react";
import JobForm from "./components/JobForm";
import ProgressBar from "./components/ProgressBar";
import CompanyTable from "./components/CompanyTable";
import { createJob, getJob, getCompanies, exportUrl } from "./api";

export default function App() {
  const [job, setJob] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");

  const start = async (payload) => {
    setError("");
    setCompanies([]);
    try {
      const { job, invalid } = await createJob(payload);
      if (invalid?.length)
        setError(
          "Skipped: " + invalid.map((i) => `${i.url} (${i.reason})`).join(", "),
        );
      setJob(job);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  // har 2 sec poll karo jab tak job complete na ho
  useEffect(() => {
    if (!job || ["completed", "failed"].includes(job.status)) return;
    const t = setInterval(async () => {
      const [j, c] = await Promise.all([
        getJob(job._id),
        getCompanies(job._id),
      ]);
      setJob(j);
      setCompanies(c);
    }, 2000);
    return () => clearInterval(t);
  }, [job]);

  const running = job && !["completed", "failed"].includes(job.status);

  return (
    <div className="container">
      <h1>Company Scraper</h1>
      <JobForm onSubmit={start} disabled={running} />
      {error && <div className="card error">{error}</div>}
      {job && <ProgressBar job={job} />}
      {job?.status === "completed" && (
        <div className="row">
          <a className="btn" href={exportUrl("csv", job._id)}>
            Download CSV
          </a>
          <a className="btn" href={exportUrl("json", job._id)}>
            Download JSON
          </a>
        </div>
      )}
      <CompanyTable companies={companies} />
    </div>
  );
}
