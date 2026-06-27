"use client";

import AppShell from "@/components/AppShell";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ProductForm = {
  name: string;
  sku: string;
  price: string;
  stock: string;
  minStock: string;
  categoryId: string;
  supplierId: string;
  description: string;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ProductForm>({
    name: "",
    sku: "",
    price: "",
    stock: "",
    minStock: "",
    categoryId: "",
    supplierId: "",
    description: "",
  });

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setLoading(true);
      setError("");

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 7000);

      try {
        const response = await fetch(`/api/products/${id}?mode=edit`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const text = await response.text();

        let result;

        try {
          result = JSON.parse(text);
        } catch {
          console.error("API returned non-JSON:", text);
          setError("API tidak mengembalikan JSON. Cek route API product detail.");
          return;
        }

        if (!result.success) {
          setError(result.message || "Gagal mengambil data produk.");
          return;
        }

        const product = result.data;

        setForm({
          name: product.name ?? "",
          sku: product.sku ?? "",
          price: String(product.price ?? ""),
          stock: String(product.stock ?? ""),
          minStock: String(product.minStock ?? ""),
          categoryId: String(product.categoryId ?? ""),
          supplierId: product.supplierId ? String(product.supplierId) : "",
          description: product.description ?? "",
        });
      } catch (error) {
        console.error("FETCH_PRODUCT_ERROR", error);
        setError(
          "Request terlalu lama atau gagal. Cek terminal Next.js dan API /api/products/[id]."
        );
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  async function handleSubmit(event: React.FormEvent) {
  event.preventDefault();
  setSaving(true);

  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const result = await response.json();

    if (!result.success) {
      toast.error(result.message || "Gagal mengambil data produk.");
      router.push("/products");
      return;
    }

    toast.success("Produk berhasil diupdate.");

    router.push("/products");
    router.refresh();
    } catch (error) {
    console.error("FETCH_PRODUCT_ERROR", error);
    toast.error("Terjadi kesalahan saat mengambil data produk.");
    router.push("/products");
  } finally {
    setLoading(false);
  }
}

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  if (loading) {
    return (
      <AppShell title="Edit Product">
        <main className="page-shell">
          <p className="loading-text">Loading product...</p>
        </main>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Edit Product">
        <main className="page-shell">
          <section className="panel">
            <div className="empty-state">
              <h3>Gagal memuat produk</h3>
              <p>{error}</p>

              <div style={{ marginTop: 16 }}>
                <Link href="/products" className="secondary-button">
                  Back to Products
                </Link>
              </div>
            </div>
          </section>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit Product">
      <main className="page-shell">
        <section className="page-header">
          <div>
            <p className="eyebrow">Inventory Management</p>
            <h1>Edit Product</h1>
            <p className="hero-description">
              Update informasi produk, harga, stok, kategori, dan supplier.
            </p>
          </div>

          <div className="header-actions">
            <Link href={`/products/${id}`} className="secondary-button">
              Detail
            </Link>

            <Link href="/products" className="secondary-button">
              Back to Products
            </Link>
          </div>
        </section>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-title">
            <h2>Product Information</h2>
            <p>Pastikan data produk sudah sesuai sebelum disimpan.</p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Wireless Mouse"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sku">SKU</label>
              <input
                id="sku"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="Example: MOUSE-001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                id="price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="Example: 150000"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input
                id="stock"
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder="Example: 20"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="minStock">Minimum Stock</label>
              <input
                id="minStock"
                name="minStock"
                type="number"
                value={form.minStock}
                onChange={handleChange}
                placeholder="Example: 5"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">Category ID</label>
              <input
                id="categoryId"
                name="categoryId"
                type="number"
                value={form.categoryId}
                onChange={handleChange}
                placeholder="Example: 1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="supplierId">Supplier ID</label>
              <input
                id="supplierId"
                name="supplierId"
                type="number"
                value={form.supplierId}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Product description..."
              />
            </div>
          </div>

          <div className="form-actions">
            <Link href="/products" className="form-cancel">
              Cancel
            </Link>

            <button type="submit" className="form-submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </AppShell>
  );
}