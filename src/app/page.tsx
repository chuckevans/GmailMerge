const milestones = [
  "1. Gmail OAuth and Sheets connection",
  "2. Data model and CSV import",
  "3. Send screen and reliable worker",
  "4. Reply and bounce handling",
  "5. Reviewed follow-up pipeline (+14/+28/+40 days)",
  "6. Dashboard and acceptance testing",
];
export default function Home() {
  return <section className="container">
    <p className="eyebrow">MVP project bootstrap</p>
    <h1>Email Outreach Manager</h1>
    <p className="notice">Scaffold only. Gmail sending, CSV import and persistent storage are <strong>not yet implemented</strong>.</p>
    <nav aria-label="Planned screens"><span>Send (planned)</span><span>Dashboard (planned)</span><span>Settings (planned)</span></nav>
    <h2>Build sequence</h2><ol>{milestones.map((m) => <li key={m}>{m}</li>)}</ol>
    <p>Start with <code>PROJECT_MANIFEST.md</code> before creating or changing files.</p>
  </section>;
}
