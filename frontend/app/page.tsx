export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px", fontFamily: "system-ui, -apple-system, sans-serif", color: "#0f172a" }}>
      <header style={{ marginBottom: 48, textAlign: "center" }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: "0 0 12px 0", letterSpacing: "-0.03em" }}>
          Stellar Escrow Protocol
        </h1>
        <p style={{ fontSize: 18, color: "#64748b", maxWidth: 600, margin: "0 auto" }}>
          Decentralized escrow infrastructure for freelance milestones, international trade, and dispute arbitration on Soroban.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
        <a
          href="/freelancer"
          style={{
            display: "block",
            padding: 28,
            borderRadius: 16,
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            textDecoration: "none",
            color: "inherit",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
            💼
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px 0" }}>Freelancer Dashboard</h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
            View active contracts, verify client funding, monitor deadlines, and track completed milestone payouts.
          </p>
        </a>

        <div
          style={{
            padding: 28,
            borderRadius: 16,
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#64748b",
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
            👤
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px 0", color: "#334155" }}>Client Portal</h2>
          <p style={{ fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            Create and fund new escrow agreements, update arbiters, release funds upon milestone approval, or claim refunds.
          </p>
        </div>

        <div
          style={{
            padding: 28,
            borderRadius: 16,
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#64748b",
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
            ⚖️
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px 0", color: "#334155" }}>Arbiter Resolution</h2>
          <p style={{ fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            Review disputed escrows, inspect contract evidence, and execute decisive settlement payouts.
          </p>
        </div>
      </div>
    </main>
  );
}
