import { useEffect, useState } from "react";
import JobForm from "./components/JobForm";
import ProgressBar from "./components/ProgressBar";
import StatsCards from "./components/StatsCards";
import CompanyTable from "./components/CompanyTable";
import JobHistory from "./components/JobHistory";
import { createJob, getJob, getCompanies, exportUrl } from "./api";

const isDone = (job) => job && ["completed", "failed"].includes(job.status);

export default function App() {
  const [tab, setTab] = useState("new");
  const [job, setJob] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");

  const start = async (payload) => {
    setError("");
    setCompanies([]);
    try {
      const { job, invalid } = await createJob(payload);
      if (invalid?.length) {
        setError(
          "Skipped: " + invalid.map((i) => `${i.url} (${i.reason})`).join(", "),
        );
      }
      setJob(job);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  const openJob = async (id) => {
    setError("");
    try {
      const [j, c] = await Promise.all([getJob(id), getCompanies(id)]);
      setJob(j);
      setCompanies(c);
      setTab("new");
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  // job chalte waqt har 2 sec poll karo
  useEffect(() => {
    if (!job || isDone(job)) return;
    const t = setInterval(async () => {
      try {
        const [j, c] = await Promise.all([
          getJob(job._id),
          getCompanies(job._id),
        ]);
        setJob(j);
        setCompanies(c);
      } catch {
        /* next tick retry */
      }
    }, 2000);
    return () => clearInterval(t);
  }, [job]);

  const running = job && !isDone(job);

  return (
    <div className="container">
      <header className="topbar">
        <h1>Company Scraper</h1>
        <nav className="tabs">
          <button
            className={tab === "new" ? "tab active" : "tab"}
            onClick={() => setTab("new")}
          >
            New Scrape
          </button>
          <button
            className={tab === "history" ? "tab active" : "tab"}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </nav>
      </header>

      {tab === "history" ? (
        <JobHistory onOpen={openJob} />
      ) : (
        <>
          <JobForm onSubmit={start} disabled={running} />
          {error && <div className="card error">{error}</div>}
          {job && <ProgressBar job={job} />}

          {job && isDone(job) && companies.length > 0 && (
            <div className="actions">
              <a className="btn" href={exportUrl("csv", job._id)}>
                Download CSV
              </a>
              <a className="btn secondary" href={exportUrl("json", job._id)}>
                Download JSON
              </a>
            </div>
          )}

          {companies.length > 0 && <StatsCards companies={companies} />}
          <CompanyTable companies={companies} />
        </>
      )}
    </div>
  );
}
