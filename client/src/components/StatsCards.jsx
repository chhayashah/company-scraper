export default function StatsCards({ companies }) {
  const has = (arr) => arr?.length > 0;
  const stats = [
    { label: "Companies", value: companies.length },
    {
      label: "With email",
      value: companies.filter((c) => has(c.emails)).length,
    },
    {
      label: "With phone",
      value: companies.filter((c) => has(c.phones)).length,
    },
    {
      label: "With socials",
      value: companies.filter((c) =>
        Object.values(c.socials || {}).some(Boolean),
      ).length,
    },
    {
      label: "Tech detected",
      value: companies.filter((c) => has(c.techStack)).length,
    },
  ];

  return (
    <div className="stats">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
