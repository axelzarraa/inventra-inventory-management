"use client";

import AppShell from "@/components/AppShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
};

type Product = {
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
};

type StockModal = {
  isOpen: boolean;
  type: "IN" | "OUT";
  product: Product | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [stockModal, setStockModal] = useState<StockModal>({
    isOpen: false,
    type: "IN",
    product: null,
  });

  const [stockForm, setStockForm] = useState({
    quantity: "",
    note: "",
  });

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

  async function fetchProducts() {
    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("FETCH_PRODUCTS_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCurrentUser();
    fetchProducts();
  }, []);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  }

  function getProductStatus(product: Product) {
    if (product.stock <= 0) return "OUT_OF_STOCK";
    if (product.stock <= product.minStock) return "LOW_STOCK";
    return "AVAILABLE";
  }

  function getStatusLabel(product: Product) {
    const status = getProductStatus(product);

    if (status === "OUT_OF_STOCK") return "Out of Stock";
    if (status === "LOW_STOCK") return "Low Stock";
    return "Available";
  }

  function getStatusClass(product: Product) {
    const status = getProductStatus(product);

    if (status === "OUT_OF_STOCK") return "status-badge danger";
    if (status === "LOW_STOCK") return "status-badge warning";
    return "status-badge";
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword) ||
        product.category.name.toLowerCase().includes(keyword) ||
        (product.supplier?.name.toLowerCase().includes(keyword) ?? false);

      const status = getProductStatus(product);

      const matchesStatus =
        statusFilter === "ALL" || statusFilter === status;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function openStockModal(type: "IN" | "OUT", product: Product) {
    setStockModal({
      isOpen: true,
      type,
      product,
    });

    setStockForm({
      quantity: "",
      note: "",
    });
  }

  function closeStockModal() {
    if (stockLoading) return;

    setStockModal({
      isOpen: false,
      type: "IN",
      product: null,
    });

    setStockForm({
      quantity: "",
      note: "",
    });
  }

  async function handleStockSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!stockModal.product) return;

    const quantity = Number(stockForm.quantity);

    if (!quantity || quantity <= 0) {
      toast.error("Quantity harus lebih dari 0.");
      return;
    }

    if (stockModal.type === "OUT" && quantity > stockModal.product.stock) {
      toast.error("Stock tidak cukup.");
      return;
    }

    setStockLoading(true);

    try {
      const response = await fetch("/api/stock-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: stockModal.product.id,
          type: stockModal.type,
          quantity,
          note: stockForm.note,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.message || "Gagal update stock.");
        return;
      }

    toast.success(
    stockModal.type === "IN"
    ? "Stock berhasil ditambahkan."
    : "Stock berhasil dikurangi."
);

closeStockModal();
await fetchProducts();
    } catch (error) {
      console.error("STOCK_TRANSACTION_ERROR", error);
      toast.error("Terjadi kesalahan saat update stock.");
    } finally {
      setStockLoading(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    const confirmed = confirm(`Yakin mau hapus ${product.name}?`);

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.message || "Gagal hapus produk.");
        return;
      }

      toast.success("Produk berhasil dihapus.");
      await fetchProducts();
    } catch (error) {
      console.error("DELETE_PRODUCT_ERROR", error);
      toast.error("Terjadi kesalahan saat hapus produk.");
    }
  }

  function handleFilterChange(value: string) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  if (loading) {
    return (
      <AppShell title="Products">
        <main className="page-shell">
          <p className="loading-text">Loading products...</p>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell title="Products">
      <main className="page-shell">
        <section className="page-header">
          <div>
            <p className="eyebrow">Inventory Data</p>
            <h1>Products</h1>
            <p className="hero-description">
              Kelola daftar produk, stok, kategori, supplier, dan harga barang
              Inventra.
            </p>
          </div>

          <div className="header-actions">
            <Link href="/" className="secondary-button">
              Back to Dashboard
            </Link>

            {currentUser?.role === "ADMIN" && (
              <Link href="/products/create" className="primary-link-button">
                Add Product
              </Link>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Product List</p>
              <h2>All Products</h2>
            </div>

            <span className="badge">{filteredProducts.length} item</span>
          </div>

          <div className="product-toolbar">
            <div className="search-wrapper">
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search product by name, SKU, category, or supplier..."
                className="search-input"
              />
            </div>

            <div className="filter-actions">
              <button
                type="button"
                className={
                  statusFilter === "ALL"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => handleFilterChange("ALL")}
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
                onClick={() => handleFilterChange("AVAILABLE")}
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
                onClick={() => handleFilterChange("LOW_STOCK")}
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
                onClick={() => handleFilterChange("OUT_OF_STOCK")}
              >
                Out of Stock
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">Tidak ada produk yang sesuai.</div>
          ) : (
            <>
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
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <h4>{product.name}</h4>
                            <p>{product.description ?? "-"}</p>
                          </div>
                        </td>

                        <td>{product.sku}</td>
                        <td>{product.category.name}</td>
                        <td>{product.supplier?.name ?? "-"}</td>
                        <td>{formatRupiah(product.price)}</td>
                        <td>
                          {product.stock} / min {product.minStock}
                        </td>
                        <td>
                          <span className={getStatusClass(product)}>
                            {getStatusLabel(product)}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
                            <Link
                              href={`/products/${product.id}`}
                              className="detail-button"
                            >
                              Detail
                            </Link>

                            <button
                              type="button"
                              className="stock-button in"
                              onClick={() => openStockModal("IN", product)}
                            >
                              Stock In
                            </button>

                            <button
                              type="button"
                              className="stock-button out"
                              onClick={() => openStockModal("OUT", product)}
                            >
                              Stock Out
                            </button>

                            {currentUser?.role === "ADMIN" && (
                              <>
                                <Link
                                  href={`/products/${product.id}/edit`}
                                  className="edit-button"
                                >
                                  Edit
                                </Link>

                                <button
                                  type="button"
                                  className="delete-button"
                                  onClick={() => handleDeleteProduct(product)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                  >
                    Previous
                  </button>

                  <span>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {stockModal.isOpen && stockModal.product && (
          <div className="modal-backdrop" onClick={closeStockModal}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>
                    {stockModal.type === "IN" ? "Stock In" : "Stock Out"}
                  </h3>
                  <p>
                    {stockModal.product.name} — stok sekarang{" "}
                    <strong>{stockModal.product.stock}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={closeStockModal}
                >
                  ×
                </button>
              </div>

              <form className="modal-body" onSubmit={handleStockSubmit}>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={stockForm.quantity}
                    onChange={(event) =>
                      setStockForm({
                        ...stockForm,
                        quantity: event.target.value,
                      })
                    }
                    placeholder="Example: 5"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: 14 }}>
                  <label htmlFor="note">Note</label>
                  <textarea
                    id="note"
                    rows={4}
                    value={stockForm.note}
                    onChange={(event) =>
                      setStockForm({
                        ...stockForm,
                        note: event.target.value,
                      })
                    }
                    placeholder={
                      stockModal.type === "IN"
                        ? "Example: Restock from supplier"
                        : "Example: Sold to customer"
                    }
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="form-cancel"
                    onClick={closeStockModal}
                    disabled={stockLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={
                      stockModal.type === "IN"
                        ? "modal-submit stock-in"
                        : "modal-submit stock-out"
                    }
                    disabled={stockLoading}
                  >
                    {stockLoading
                      ? "Processing..."
                      : stockModal.type === "IN"
                      ? "Save Stock In"
                      : "Save Stock Out"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}