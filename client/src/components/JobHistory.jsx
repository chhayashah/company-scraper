import { useEffect, useState } from "react";
import { getJobs } from "../api";

export default function JobHistory({ onOpen }) {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="card error">{error}</div>;
  if (!jobs) return <div className="card muted">Loading...</div>;
  if (!jobs.length)
    return <div className="card muted">Abhi tak koi job nahi chali.</div>;

  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>Input</th>
            <th>Status</th>
            <th>Processed</th>
            <th>Failed</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j._id}>
              <td>
                {j.query
                  ? `"${j.query}"`
                  : `${j.seedUrls?.length || 0} seed URLs`}
              </td>
              <td>
                <span className={`badge ${j.status}`}>{j.status}</span>
              </td>
              <td>
                {j.processed}/{j.total}
              </td>
              <td>{j.failed}</td>
              <td className="muted">
                {new Date(j.createdAt).toLocaleString()}
              </td>
              <td>
                <button className="small" onClick={() => onOpen(j._id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
