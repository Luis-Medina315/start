"use client";

import { useState } from "react";
import { ProductDrawer } from "@/components/ProductDrawer";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  initialProducts: Product[];
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
};

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Sin stock</span>;
  }
  if (stock < 5) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Bajo ({stock})</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{stock}</span>;
}

export function InventoryClient({ initialProducts, totalStock, totalValue, lowStockCount }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const filtered = initialProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditingProduct(null);
    setDrawerOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setDrawerOpen(true);
  }

  async function onDelete(id: number) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <>
      <ProductDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editingProduct={editingProduct}
      />

      <div className="min-h-screen bg-zinc-50">
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">Inventario</h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {initialProducts.length} productos registrados
                </p>
              </div>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agregar producto
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total productos</p>
              <p className="text-3xl font-bold text-zinc-900 mt-1">{initialProducts.length}</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Valor total</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">
                ${totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Stock bajo</p>
              <p className="text-3xl font-bold mt-1 text-red-600">{lowStockCount}</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lowStockCount === 0 ? "Sin alertas" : "productos con stock bajo"}
              </p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <div className="relative max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre o categoría…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-zinc-400"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="text-zinc-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-zinc-700">
                  {search ? "No se encontraron productos" : "No hay productos en el inventario"}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {search ? "Probá con otro término de búsqueda" : "Hacé click en 'Agregar producto' para empezar"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Producto</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Precio</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stock</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valor</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filtered.map((product) => (
                      <tr key={product.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              ID #{product.id} · Creado {new Date(product.createdAt).toLocaleDateString("es-AR")}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-zinc-600">
                            {product.category ?? <span className="text-zinc-300">—</span>}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-medium text-zinc-900">
                            ${product.price.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <StockBadge stock={product.stock} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm text-zinc-700">
                            ${(product.price * product.stock).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDelete(product.id)}
                              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50">
                <p className="text-xs text-zinc-400">
                  Mostrando {filtered.length} de {initialProducts.length} productos
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
