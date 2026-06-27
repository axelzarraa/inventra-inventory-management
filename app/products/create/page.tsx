"use client";

import AppShell from "@/components/AppShell";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateProductPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    minStock: "",
    categoryId: "",
    supplierId: "",
    description: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.message || "Gagal membuat produk.");
        return;
      }

      toast.success("Produk berhasil dibuat.");
      window.location.href = "/products";
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat membuat produk.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Create Product">
      <div className="page-shell">
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-title">
            <h2>Create Product</h2>
            <p>Tambah produk baru ke inventory system</p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>SKU</label>
              <input
                value={form.sku}
                onChange={(e) =>
                  setForm({ ...form, sku: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Min Stock</label>
              <input
                type="number"
                value={form.minStock}
                onChange={(e) =>
                  setForm({ ...form, minStock: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Category ID</label>
              <input
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Supplier ID</label>
              <input
                value={form.supplierId}
                onChange={(e) =>
                  setForm({ ...form, supplierId: e.target.value })
                }
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-actions">
            <Link href="/products" className="form-cancel">
              Cancel
            </Link>

            <button
              type="submit"
              className="form-submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}