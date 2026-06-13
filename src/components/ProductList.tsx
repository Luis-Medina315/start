"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

export function ProductList({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditStock(String(p.stock));
    setEditCategory(p.category ?? "");
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
  }

  async function saveEdit(e: FormEvent, id: number) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          price: Number(editPrice),
          stock: Number(editStock),
          category: editCategory || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error updating product");
      }
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: number) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error deleting product");
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (initialProducts.length === 0) {
    return (
      <div className="bg-white border border-dashed border-zinc-300 rounded-lg p-10 text-center text-zinc-500">
        No hay productos todavía. Creá el primero arriba.
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
      {error && (
        <p className="px-4 py-2 text-sm text-red-600 border-b border-zinc-200">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-amber-100/60 text-zinc-800 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Creado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {initialProducts.map((p) => {
              const isEditing = editingId === p.id;
              return (
                <tr
                  key={p.id}
                  className="border-t border-zinc-200 hover:bg-amber-50/40"
                >
                  <td className="px-4 py-3 text-zinc-500">{p.id}</td>
                  {isEditing ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-zinc-300 rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="border border-zinc-300 rounded px-2 py-1 w-24"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          className="border border-zinc-300 rounded px-2 py-1 w-20"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="border border-zinc-300 rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {new Date(p.createdAt).toLocaleString("es-AR")}
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={(e) => saveEdit(e, p.id)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs mr-2"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="border border-zinc-300 px-3 py-1 rounded text-xs"
                        >
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{p.stock}</td>
                      <td className="px-4 py-3 text-zinc-700">
                        {p.category ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {new Date(p.createdAt).toLocaleString("es-AR")}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="border border-zinc-300 hover:bg-amber-50 text-zinc-800 px-3 py-1 rounded text-xs mr-2"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onDelete(p.id)}
                          className="border border-red-300 text-red-700 hover:bg-red-50 px-3 py-1 rounded text-xs"
                        >
                          Eliminar
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
