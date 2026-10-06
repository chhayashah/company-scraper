export default function CompanyTable({ companies }) {
  if (!companies.length) return null;
  const link = (u) =>
    u ? (
      <a href={u} target="_blank" rel="noreferrer">
        link
      </a>
    ) : (
      "-"
    );
  return (
    <div className="card" style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Website</th>
            <th>Emails</th>
            <th>Phones</th>
            <th>Socials</th>
            <th>Industry</th>
            <th>Founded</th>
            <th>Tech Stack</th>
            <th>Competitors</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>
                <a href={c.website} target="_blank" rel="noreferrer">
                  {c.website}
                </a>
              </td>
              <td>{c.emails?.join(", ") || "-"}</td>
              <td>{c.phones?.join(", ") || "-"}</td>
              <td>
                {link(c.socials?.linkedin)} {link(c.socials?.twitter)}
              </td>
              <td>{c.industry || "-"}</td>
              <td>{c.foundedYear || "-"}</td>
              <td>{c.techStack?.join(", ") || "-"}</td>
              <td>{c.competitors?.join(", ") || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
