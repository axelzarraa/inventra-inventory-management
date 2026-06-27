"use client";

import AppShell from "@/components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardData = {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalStock: number;
  lowStockCount: number;
  lowStockProducts: {
    id: number;
    name: string;
    sku: string;
    stock: number;
    minStock: number;
  }[];
  recentTransactions: {
    id: number;
    type: "IN" | "OUT";
    quantity: number;
    note: string | null;
    createdAt: string;
    product: {
      id: number;
      name: string;
      sku: string;
    };
  }[];
  stockChartData: {
    name: string;
    stock: number;
  }[];
};

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchDashboard() {
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();

      if (result.success) {
        setDashboard(result.data);
      }
    } catch (error) {
      console.error("FETCH_DASHBOARD_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await fetch("/api/auth/me");
      const result = await response.json();

      if (result.success) {
        setCurrentUser(result.data);
      }
    } catch (error) {
      console.error("FETCH_CURRENT_USER_ERROR", error);
    }
  }

  useEffect(() => {
    fetchDashboard();
    fetchCurrentUser();
  }, []);

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  const isAdmin = currentUser?.role === "ADMIN";

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <main className="page-shell">
          <p className="loading-text">Loading dashboard...</p>
        </main>
      </AppShell>
    );
  }

  if (!dashboard) {
    return (
      <AppShell title="Dashboard">
        <main className="page-shell">
          <div className="empty-state">Gagal memuat dashboard.</div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell title="Dashboard">
      <main className="page-shell">
        <section className="hero-section">
          <div>
            <p className="eyebrow">Inventory Dashboard</p>
            <h1>Inventra Dashboard</h1>
            <p className="hero-description">
              Pantau total produk, stok barang, supplier, kategori, dan aktivitas
              keluar masuk stok dalam satu dashboard.
            </p>

            {currentUser && (
              <div className="user-chip">
                <span>{currentUser.name}</span>
                <strong>{currentUser.role}</strong>
              </div>
            )}
          </div>

          <div className="hero-actions">
            <Link href="/products" className="primary-link-button">
              View Products
            </Link>

            <Link href="/reports" className="secondary-button">
              Reports
            </Link>

            <Link href="/logs" className="secondary-button">
              Audit Logs
            </Link>

            {isAdmin && (
              <Link href="/products/create" className="secondary-button">
                Add Product
              </Link>
            )}
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Products</p>
            <h2>{dashboard.totalProducts}</h2>
            <span>Produk terdaftar</span>
          </div>

          <div className="stat-card">
            <p>Total Stock</p>
            <h2>{dashboard.totalStock}</h2>
            <span>Jumlah seluruh stok</span>
          </div>

          <div className="stat-card">
            <p>Categories</p>
            <h2>{dashboard.totalCategories}</h2>
            <span>Kategori produk</span>
          </div>

          <div className="stat-card">
            <p>Suppliers</p>
            <h2>{dashboard.totalSuppliers}</h2>
            <span>Partner supplier</span>
          </div>
        </section>

        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Analytics</p>
              <h2>Stock by Product</h2>
            </div>

            <span className="badge">{dashboard.stockChartData.length} item</span>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dashboard.stockChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="stock" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Warning</p>
                <h2>Low Stock Products</h2>
              </div>

              <span className="badge danger">
                {dashboard.lowStockCount} item
              </span>
            </div>

            {dashboard.lowStockProducts.length === 0 ? (
              <div className="empty-state">Semua stok masih aman.</div>
            ) : (
              <div className="low-stock-list">
                {dashboard.lowStockProducts.map((product) => (
                  <div key={product.id} className="low-stock-item">
                    <div>
                      <h4>{product.name}</h4>
                      <p>SKU: {product.sku}</p>
                    </div>

                    <span>
                      {product.stock} / min {product.minStock}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Activity</p>
                <h2>Recent Transactions</h2>
              </div>

              <span className="badge">
                {dashboard.recentTransactions.length}
              </span>
            </div>

            {dashboard.recentTransactions.length === 0 ? (
              <div className="empty-state">Belum ada transaksi stok.</div>
            ) : (
              <div className="transaction-list">
                {dashboard.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-left">
                      <span
                        className={
                          transaction.type === "IN"
                            ? "transaction-icon in"
                            : "transaction-icon out"
                        }
                      >
                        {transaction.type === "IN" ? "+" : "-"}
                      </span>

                      <div>
                        <h4>{transaction.product.name}</h4>
                        <p>
                          {transaction.type === "IN"
                            ? "Stock In"
                            : "Stock Out"}{" "}
                          • {transaction.quantity} item
                        </p>
                        <small>{transaction.note ?? "No note"}</small>
                      </div>
                    </div>

                    <span className="transaction-date">
                      {formatDate(transaction.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </AppShell>
  );
}