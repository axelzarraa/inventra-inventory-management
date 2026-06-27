"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";

type AuditLog = {
  id: number;
  action: string;
  entity: string;
  entityId: number;
  message: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  } | null;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  async function fetchLogs() {
    try {
      const response = await fetch("/api/audit-logs");
      const result = await response.json();

      if (result.success) {
        setLogs(result.data);
      }
    } catch (error) {
      console.error("FETCH_LOGS_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function getActionLabel(action: string) {
    return action.replaceAll("_", " ");
  }

  function getActionClass(action: string) {
    if (action.includes("DELETE")) return "status-badge danger";
    if (action.includes("UPDATE")) return "status-badge warning";
    if (action.includes("STOCK_IN")) return "status-badge";
    if (action.includes("STOCK_OUT")) return "status-badge warning";

    return "status-badge";
  }

  const actionOptions = Array.from(new Set(logs.map((log) => log.action)));

  const filteredLogs = logs.filter((log) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      log.action.toLowerCase().includes(keyword) ||
      log.entity.toLowerCase().includes(keyword) ||
      String(log.entityId).includes(keyword) ||
      (log.message?.toLowerCase().includes(keyword) ?? false) ||
      (log.user?.name.toLowerCase().includes(keyword) ?? false) ||
      (log.user?.email.toLowerCase().includes(keyword) ?? false);

    const matchesAction =
      actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <AppShell title="Audit Logs">
      <main className="page-shell">
        <section className="page-header">
          <div>
            <p className="eyebrow">System Activity</p>
            <h1>Audit Logs</h1>
            <p className="hero-description">
              Riwayat aktivitas user di sistem Inventra, termasuk update produk,
              delete produk, dan transaksi stok.
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Activity Trail</p>
              <h2>System Logs</h2>
            </div>

            <span className="badge">{filteredLogs.length} log</span>
          </div>

          <div className="product-toolbar">
            <div className="search-wrapper">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search logs by action, user, entity, or message..."
                className="search-input"
              />
            </div>

            <div className="sort-wrapper">
              <select
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
                className="sort-select"
              >
                <option value="ALL">All Actions</option>

                {actionOptions.map((action) => (
                  <option key={action} value={action}>
                    {getActionLabel(action)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="loading-text">Loading logs...</p>
          ) : filteredLogs.length === 0 ? (
            <div className="empty-state">Belum ada aktivitas yang sesuai.</div>
          ) : (
            <div className="log-list">
              {filteredLogs.map((log) => (
                <div key={log.id} className="log-item">
                  <div>
                    <span className={getActionClass(log.action)}>
                      {getActionLabel(log.action)}
                    </span>

                    <p>{log.message ?? "No message"}</p>

                    <small>
                      {log.entity} #{log.entityId}
                    </small>
                  </div>

                  <div className="log-meta">
                    <span>{log.user?.name ?? "System"}</span>
                    <small>{log.user?.email ?? "-"}</small>
                    <small>{formatDate(log.createdAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}