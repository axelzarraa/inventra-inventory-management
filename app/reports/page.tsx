"use client";

import AppShell from "@/components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";

type ReportItem = {
  id: number;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  price: number;
  stock: number;
  minStock: number;
  stockValue: number;
  status: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";
};

type ReportData = {
  summary: {
    totalProducts: number;
    totalStock: number;
    totalInventoryValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  items: ReportItem[];
};

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NAME_ASC");

  async function fetchReport() {
    try {
      const response = await fetch("/api/reports");
      const result = await response.json();

      if (result.success) {
        setReport(result.data);
      }
    } catch (error) {
      console.error("FETCH_REPORT_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, []);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  }

  function getStatusLabel(status: ReportItem["status"]) {
    if (status === "OUT_OF_STOCK") return "Out of Stock";
    if (status === "LOW_STOCK") return "Low Stock";
    return "Available";
  }

  function getStatusClass(status: ReportItem["status"]) {
    if (status === "OUT_OF_STOCK") return "status-badge danger";
    if (status === "LOW_STOCK") return "status-badge warning";
    return "status-badge";
  }

  const filteredItems =
    report?.items
      .filter((item) => {
        const keyword = search.toLowerCase();

        const matchesSearch =
          item.name.toLowerCase().includes(keyword) ||
          item.sku.toLowerCase().includes(keyword) ||
          item.category.toLowerCase().includes(keyword) ||
          item.supplier.toLowerCase().includes(keyword);

        const matchesStatus =
          statusFilter === "ALL" || item.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "NAME_ASC":
            return a.name.localeCompare(b.name);
          case "NAME_DESC":
            return b.name.localeCompare(a.name);
          case "PRICE_ASC":
            return a.price - b.price;
          case "PRICE_DESC":
            return b.price - a.price;
          case "STOCK_ASC":
            return a.stock - b.stock;
          case "STOCK_DESC":
            return b.stock - a.stock;
          case "VALUE_ASC":
            return a.stockValue - b.stockValue;
          case "VALUE_DESC":
            return b.stockValue - a.stockValue;
          default:
            return 0;
        }
      }) ?? [];

  function handleExportCSV() {
    if (!report) return;

    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Supplier",
      "Price",
      "Stock",
      "Minimum Stock",
      "Stock Value",
      "Status",
    ];

    const rows = filteredItems.map((item) => [
      item.name,
      item.sku,
      item.category,
      item.supplier,
      item.price,
      item.stock,
      item.minStock,
      item.stockValue,
      getStatusLabel(item.status),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inventra-inventory-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <AppShell title="Reports">
        <main className="page-shell">
          <p className="loading-text">Loading report...</p>
        </main>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell title="Reports">
        <main className="page-shell">
          <div className="empty-state">Gagal memuat laporan inventory.</div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell title="Reports">
      <main className="page-shell">
        <section className="page-header">
          <div>
            <p className="eyebrow">Inventory Report</p>
            <h1>Reports</h1>
            <p className="hero-description">
              Laporan ringkas nilai inventory, status stok, dan daftar produk
              berdasarkan data terbaru.
            </p>
          </div>

          <div className="header-actions no-print">
            <button
              type="button"
              className="print-button"
              onClick={() => window.print()}
            >
              Print Report
            </button>

            <button
              type="button"
              className="export-button"
              onClick={handleExportCSV}
            >
              Export CSV
            </button>

            <Link href="/products" className="primary-link-button">
              View Products
            </Link>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Inventory Value</p>
            <h2>{formatRupiah(report.summary.totalInventoryValue)}</h2>
            <span>Nilai total stok</span>
          </div>

          <div className="stat-card">
            <p>Total Products</p>
            <h2>{report.summary.totalProducts}</h2>
            <span>Produk terdaftar</span>
          </div>

          <div className="stat-card">
            <p>Total Stock</p>
            <h2>{report.summary.totalStock}</h2>
            <span>Jumlah seluruh stok</span>
          </div>

          <div className="stat-card">
            <p>Stock Alerts</p>
            <h2>
              {report.summary.lowStockCount + report.summary.outOfStockCount}
            </h2>
            <span>Low stock + out of stock</span>
          </div>
        </section>

        <section className="panel report-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Report Table</p>
              <h2>Inventory Report</h2>
            </div>

            <span className="badge">{filteredItems.length} item</span>
          </div>

          <div className="product-toolbar no-print">
            <div className="search-wrapper">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search report by product, SKU, category, or supplier..."
                className="search-input"
              />
            </div>

            <div className="sort-wrapper">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="sort-select"
              >
                <option value="NAME_ASC">Name A-Z</option>
                <option value="NAME_DESC">Name Z-A</option>
                <option value="PRICE_ASC">Price Low → High</option>
                <option value="PRICE_DESC">Price High → Low</option>
                <option value="STOCK_ASC">Stock Low → High</option>
                <option value="STOCK_DESC">Stock High → Low</option>
                <option value="VALUE_ASC">Value Low → High</option>
                <option value="VALUE_DESC">Value High → Low</option>
              </select>
            </div>

            <div className="filter-actions">
              <button
                type="button"
                className={
                  statusFilter === "ALL"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setStatusFilter("ALL")}
              >
                All
              </button>

              <button
                type="button"
                className={
                  statusFilter === "AVAILABLE"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setStatusFilter("AVAILABLE")}
              >
                Available
              </button>

              <button
                type="button"
                className={
                  statusFilter === "LOW_STOCK"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setStatusFilter("LOW_STOCK")}
              >
                Low Stock
              </button>

              <button
                type="button"
                className={
                  statusFilter === "OUT_OF_STOCK"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setStatusFilter("OUT_OF_STOCK")}
              >
                Out of Stock
              </button>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="empty-state">Tidak ada data report yang sesuai.</div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Supplier</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Stock Value</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="product-cell">
                          <h4>{item.name}</h4>
                          <p>Min stock: {item.minStock}</p>
                        </div>
                      </td>

                      <td>{item.sku}</td>
                      <td>{item.category}</td>
                      <td>{item.supplier}</td>
                      <td>{formatRupiah(item.price)}</td>
                      <td>{item.stock}</td>
                      <td>{formatRupiah(item.stockValue)}</td>
                      <td>
                        <span className={getStatusClass(item.status)}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}