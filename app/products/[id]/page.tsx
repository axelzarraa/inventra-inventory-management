"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ProductDetail = {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  minStock: number;

  category: {
    name: string;
  };

  supplier: {
    name: string;
  } | null;

  createdBy: {
    name: string;
    email: string;
  } | null;

  stockTransactions: {
    id: number;
    type: "IN" | "OUT";
    quantity: number;
    note: string | null;
    createdAt: string;
  }[];
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/products/${id}`);
      const result = await res.json();

      if (result.success) {
        setProduct(result.data);
      }
    } catch (error) {
      console.error("FETCH_PRODUCT_DETAIL_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProduct();
  }, [id]);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  }

  if (loading) {
    return (
      <AppShell title="Product Detail">
        <div className="page-shell">
          <p className="loading-text">Loading...</p>
        </div>
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell title="Product Detail">
        <div className="page-shell">
          <div className="empty-state">Product tidak ditemukan</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Product Detail">
      <div className="page-shell">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Product Detail</p>
              <h2>{product.name}</h2>
            </div>

            <span className="badge">{product.sku}</span>
          </div>

          <div className="detail-grid">
            <div className="detail-list">
              <div className="detail-row">
                <span>Price</span>
                <strong>{formatRupiah(product.price)}</strong>
              </div>

              <div className="detail-row">
                <span>Stock</span>
                <strong>{product.stock}</strong>
              </div>

              <div className="detail-row">
                <span>Min Stock</span>
                <strong>{product.minStock}</strong>
              </div>

              <div className="detail-row">
                <span>Category</span>
                <strong>{product.category.name}</strong>
              </div>

              <div className="detail-row">
                <span>Supplier</span>
                <strong>{product.supplier?.name ?? "-"}</strong>
              </div>

              <div className="detail-row">
                <span>Created By</span>
                <strong>{product.createdBy?.name ?? "-"}</strong>
              </div>
            </div>

            <div className="detail-list">
              <h3>Stock History</h3>

              {product.stockTransactions.length === 0 ? (
                <div className="empty-state">No transactions</div>
              ) : (
                product.stockTransactions.map((trx) => (
                  <div key={trx.id} className="log-item">
                    <div>
                      <strong>{trx.type}</strong>
                      <p>{trx.note ?? "No note"}</p>
                    </div>

                    <div className="log-meta">
                      <span>{trx.quantity}</span>
                      <small>
                        {new Date(trx.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}