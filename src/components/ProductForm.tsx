"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          stock: stock === "" ? 0 : Number(stock),
          category: category || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error creating product");
      }
      setName("");
      setPrice("");
      setStock("");
      setCategory("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">
        Nuevo producto
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Nombre
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Queso Cremoso"
            className="border border-zinc-300 rounded-md px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Precio
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1500"
            className="border border-zinc-300 rounded-md px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Stock
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            className="border border-zinc-300 rounded-md px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Categoría
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Tandil"
            className="border border-zinc-300 rounded-md px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-md transition-colors"
        >
          {submitting ? "Guardando…" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
