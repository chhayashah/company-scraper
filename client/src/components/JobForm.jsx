import { useState } from "react";

export default function JobForm({ onSubmit, disabled }) {
  const [query, setQuery] = useState("");
  const [urls, setUrls] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      query,
      urls: urls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={submit} className="card">
      <label>Search query</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="cloud computing startups in Europe"
      />
      <label>Or seed URLs (one per line)</label>
      <textarea
        rows={4}
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        placeholder={"https://example.com\nhttps://another.io"}
      />
      <button disabled={disabled || (!query.trim() && !urls.trim())}>
        Start Scraping
      </button>
    </form>
  );
}
