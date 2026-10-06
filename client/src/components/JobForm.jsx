import { useState } from "react";

export default function JobForm({ onSubmit, disabled }) {
  const [query, setQuery] = useState("");
  const [urls, setUrls] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      query: query.trim(),
      urls: urls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean),
    });
  };

  const looksLikeUrl = /^(https?:\/\/|www\.)\S+$/i.test(query.trim());
  const empty = !query.trim() && !urls.trim();

  return (
    <form onSubmit={submit} className="card">
      <label>Search query</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="cloud computing startups in Europe"
      />
      {looksLikeUrl && (
        <p className="hint warn">
          Ye URL lag raha hai. URLs neeche wale box mein daalo.
        </p>
      )}

      <label>Or seed URLs (one per line)</label>
      <textarea
        rows={4}
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        placeholder={"https://example.com\nhttps://another.io"}
      />

      <div className="form-actions">
        <button disabled={disabled || empty}>
          {disabled ? "Scraping..." : "Start Scraping"}
        </button>
        {(query || urls) && !disabled && (
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setQuery("");
              setUrls("");
            }}
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
