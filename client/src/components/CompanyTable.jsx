import { Fragment, useMemo, useState } from "react";

const SOCIAL_LABELS = {
  linkedin: "LinkedIn",
  twitter: "Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  github: "GitHub",
};

function Socials({ socials }) {
  const entries = Object.entries(socials || {}).filter(([, v]) => v);
  if (!entries.length) return <span className="muted">-</span>;
  return (
    <div className="chips">
      {entries.map(([k, v]) => (
        <a
          key={k}
          className="chip link"
          href={v}
          target="_blank"
          rel="noreferrer"
        >
          {SOCIAL_LABELS[k] || k}
        </a>
      ))}
    </div>
  );
}

function List({ items, limit = 2 }) {
  if (!items?.length) return <span className="muted">-</span>;
  const shown = items.slice(0, limit);
  return (
    <div>
      {shown.map((i) => (
        <div key={i} className="cell-line">
          {i}
        </div>
      ))}
      {items.length > limit && (
        <span className="muted">+{items.length - limit} more</span>
      )}
    </div>
  );
}

function Detail({ label, children }) {
  return (
    <div className="detail">
      <div className="detail-label">{label}</div>
      <div>{children}</div>
    </div>
  );
}

const chips = (arr) =>
  arr?.length ? (
    <div className="chips">
      {arr.map((x) => (
        <span className="chip" key={x}>
          {x}
        </span>
      ))}
    </div>
  ) : (
    <span className="muted">-</span>
  );

export default function CompanyTable({ companies }) {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("all");
  const [sortKey, setSortKey] = useState("name");
  const [dir, setDir] = useState("asc");
  const [open, setOpen] = useState(null);

  const industries = useMemo(
    () => [...new Set(companies.map((c) => c.industry).filter(Boolean))].sort(),
    [companies],
  );

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = companies.filter((c) => {
      if (industry !== "all" && c.industry !== industry) return false;
      if (!term) return true;
      return [
        c.name,
        c.website,
        c.industry,
        ...(c.emails || []),
        ...(c.techStack || []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
    const val = (c) => {
      if (sortKey === "emails") return c.emails?.length || 0;
      if (sortKey === "techStack") return c.techStack?.length || 0;
      return (c[sortKey] || "").toString().toLowerCase();
    };
    list.sort(
      (a, b) =>
        (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) *
        (dir === "asc" ? 1 : -1),
    );
    return list;
  }, [companies, q, industry, sortKey, dir]);

  const sortBy = (key) => {
    if (key === sortKey) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setDir("asc");
    }
  };
  const arrow = (key) => (key === sortKey ? (dir === "asc" ? " ▲" : " ▼") : "");

  if (!companies.length) return null;

  return (
    <div className="card">
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search name, website, email, tech..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="all">All industries</option>
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <span className="muted">
          {rows.length} of {companies.length}
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="sortable" onClick={() => sortBy("name")}>
                Name{arrow("name")}
              </th>
              <th>Website</th>
              <th className="sortable" onClick={() => sortBy("emails")}>
                Emails{arrow("emails")}
              </th>
              <th>Phones</th>
              <th>Socials</th>
              <th className="sortable" onClick={() => sortBy("industry")}>
                Industry{arrow("industry")}
              </th>
              <th className="sortable" onClick={() => sortBy("foundedYear")}>
                Founded{arrow("foundedYear")}
              </th>
              <th className="sortable" onClick={() => sortBy("techStack")}>
                Tech{arrow("techStack")}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <Fragment key={c._id}>
                <tr
                  className="row-click"
                  onClick={() => setOpen(open === c._id ? null : c._id)}
                >
                  <td>
                    <b>{c.name}</b>
                  </td>
                  <td>
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.website?.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  </td>
                  <td>
                    <List items={c.emails} />
                  </td>
                  <td>
                    <List items={c.phones} />
                  </td>
                  <td>
                    <Socials socials={c.socials} />
                  </td>
                  <td>{c.industry || <span className="muted">-</span>}</td>
                  <td>{c.foundedYear || <span className="muted">-</span>}</td>
                  <td>
                    <List items={c.techStack} limit={3} />
                  </td>
                  <td className="muted">{open === c._id ? "▲" : "▼"}</td>
                </tr>
                {open === c._id && (
                  <tr className="detail-row">
                    <td colSpan={9}>
                      <div className="detail-grid">
                        <Detail label="Description">
                          {c.description || <span className="muted">-</span>}
                        </Detail>
                        <Detail label="Address">
                          {c.address || <span className="muted">-</span>}
                        </Detail>
                        <Detail label="Positioning">
                          {c.positioning || <span className="muted">-</span>}
                        </Detail>
                        <Detail label="All emails">{chips(c.emails)}</Detail>
                        <Detail label="All phones">{chips(c.phones)}</Detail>
                        <Detail label="Products">{chips(c.products)}</Detail>
                        <Detail label="Tech stack">{chips(c.techStack)}</Detail>
                        <Detail label="Projects">{chips(c.projects)}</Detail>
                        <Detail label="Competitors">
                          {chips(c.competitors)}
                        </Detail>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="muted center">Koi result match nahi hua.</p>
        )}
      </div>
    </div>
  );
}
