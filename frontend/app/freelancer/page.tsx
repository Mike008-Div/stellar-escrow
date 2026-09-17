"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  type EscrowStatus,
  type EscrowItem,
  getStatusBadgeStyle,
  truncateAddress,
} from "./helpers.ts";

const MOCK_ESCROWS: EscrowItem[] = [
  {
    id: "1",
    client: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    freelancer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    arbiter: "GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXNX7C4AS4P",
    tokenSymbol: "USDC",
    amount: 2500,
    deadline: "2026-10-15T18:00:00Z",
    status: "Funded",
    createdAt: "2026-09-10T12:00:00Z",
  },
  {
    id: "2",
    client: "GCOLAX77F6QWE7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLOP9",
    freelancer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    arbiter: "GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXNX7C4AS4P",
    tokenSymbol: "XLM",
    amount: 15000,
    deadline: "2026-09-28T23:59:59Z",
    status: "Released",
    createdAt: "2026-09-01T09:30:00Z",
  },
  {
    id: "3",
    client: "GD7K47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLZZ11",
    freelancer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    arbiter: "GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXNX7C4AS4P",
    tokenSymbol: "USDC",
    amount: 800,
    deadline: "2026-10-01T12:00:00Z",
    status: "Disputed",
    createdAt: "2026-09-05T14:20:00Z",
  },
  {
    id: "4",
    client: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    freelancer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    arbiter: "GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXNX7C4AS4P",
    tokenSymbol: "USDC",
    amount: 5000,
    deadline: "2026-11-01T00:00:00Z",
    status: "Created",
    createdAt: "2026-09-16T18:40:00Z",
  },
];

export default function FreelancerDashboard() {
  const [escrows, setEscrows] = useState<EscrowItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // Simulate SDK data fetch
    const timer = setTimeout(() => {
      try {
        setEscrows(MOCK_ESCROWS);
        setLoading(false);
      } catch (err: any) {
        setError("Failed to load freelancer escrows. Please try again.");
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredEscrows = useMemo(() => {
    return escrows.filter((item) => {
      const matchesStatus =
        filterStatus === "ALL" || item.status.toUpperCase() === filterStatus.toUpperCase();
      const matchesSearch =
        item.id.includes(searchQuery) ||
        item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [escrows, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const active = escrows.filter((e) => e.status === "Funded").length;
    const completed = escrows.filter((e) => e.status === "Released" || e.status === "Resolved").length;
    const disputed = escrows.filter((e) => e.status === "Disputed").length;
    const totalEarnedUsd = escrows
      .filter((e) => e.status === "Released" && e.tokenSymbol === "USDC")
      .reduce((sum, e) => sum + e.amount, 0);

    return { active, completed, disputed, totalEarnedUsd };
  }, [escrows]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", fontFamily: "system-ui, -apple-system, sans-serif", color: "#0f172a" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Freelancer Escrow Dashboard</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 14 }}>
            Monitor milestone payments, locked funds, and release authorizations in real time.
          </p>
        </div>
        <a href="/" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", textDecoration: "none", color: "#334155", fontSize: 14, fontWeight: 500 }}>
          Back to Portal
        </a>
      </header>

      {/* Metrics Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        <div style={{ padding: 20, borderRadius: 12, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Active Contracts</span>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: "#2563eb" }}>{stats.active}</div>
        </div>
        <div style={{ padding: 20, borderRadius: 12, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Completed Escrows</span>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: "#16a34a" }}>{stats.completed}</div>
        </div>
        <div style={{ padding: 20, borderRadius: 12, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>In Dispute</span>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: "#d97706" }}>{stats.disputed}</div>
        </div>
        <div style={{ padding: 20, borderRadius: 12, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Released Earnings (USDC)</span>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: "#0f172a" }}>${stats.totalEarnedUsd.toLocaleString()}</div>
        </div>
      </section>

      {/* Controls: Search and Filter Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {["ALL", "FUNDED", "RELEASED", "DISPUTED", "CREATED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: filterStatus === tab ? "1px solid #2563eb" : "1px solid #e2e8f0",
                backgroundColor: filterStatus === tab ? "#eff6ff" : "#ffffff",
                color: filterStatus === tab ? "#1d4ed8" : "#64748b",
              }}
            >
              {tab === "ALL" ? "All Escrows" : tab}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by ID, client or token..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            minWidth: 260,
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>

      {/* Content States */}
      {loading && (
        <div style={{ padding: 48, textAlign: "center", color: "#64748b", backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Loading escrows from Stellar ledger...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: 24, textAlign: "center", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 12, border: "1px solid #fecaca", marginBottom: 24 }}>
          <p style={{ margin: "0 0 12px 0", fontWeight: 600 }}>{error}</p>
          <button onClick={() => { setLoading(true); setError(null); }} style={{ padding: "6px 14px", backgroundColor: "#dc2626", color: "#ffffff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filteredEscrows.length === 0 && (
        <div style={{ padding: 48, textAlign: "center", color: "#64748b", backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#334155", margin: "0 0 8px 0" }}>No Escrows Found</h3>
          <p style={{ margin: 0, fontSize: 14 }}>There are no escrows matching your filter or search query.</p>
        </div>
      )}

      {!loading && !error && filteredEscrows.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", overflowX: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>
                <th style={{ padding: "14px 20px" }}>ID</th>
                <th style={{ padding: "14px 20px" }}>Client</th>
                <th style={{ padding: "14px 20px" }}>Amount</th>
                <th style={{ padding: "14px 20px" }}>Deadline</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEscrows.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "#1e293b" }}>#{item.id}</td>
                  <td style={{ padding: "16px 20px", fontFamily: "monospace", color: "#334155" }} title={item.client}>
                    {truncateAddress(item.client)}
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "#0f172a" }}>
                    {item.amount.toLocaleString()} {item.tokenSymbol}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#64748b" }}>
                    {new Date(item.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 600,
                        border: "1px solid",
                        ...getStatusBadgeStyle(item.status),
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <button
                      onClick={() => alert(`Viewing Escrow #${item.id} details`)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#334155",
                        cursor: "pointer",
                      }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
