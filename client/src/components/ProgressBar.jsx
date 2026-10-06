export default function ProgressBar({ job }) {
  const pct = job.total ? Math.round((job.processed / job.total) * 100) : 0;
  const label = job.query
    ? `Query: "${job.query}"`
    : `${job.seedUrls?.length || 0} seed URLs`;

  return (
    <div className="card">
      <div className="row">
        <div>
          <span className={`badge ${job.status}`}>{job.status}</span>
          <span className="muted"> {label}</span>
        </div>
        <span className="muted">
          {job.processed}/{job.total} processed · {job.failed} failed
        </span>
      </div>
      <div className="bar">
        <div className="fill" style={{ width: `${pct}%` }} />
      </div>
      {job.errors?.length > 0 && (
        <details>
          <summary>Errors ({job.errors.length})</summary>
          <ul>
            {job.errors.map((e, i) => (
              <li key={i}>
                <code>{e.url}</code>: {e.message}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
