"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Period = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  pricePerLiter: number;
  totalLiters: number;
  totalValue: number;
  _count: { entries: number };
};

export function PaymentPeriodDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) { setName(""); setStartDate(""); setEndDate(""); setPricePerLiter(""); setError(null); }
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/payment-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, startDate, endDate, pricePerLiter: Number(pricePerLiter) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al crear");
      }
      router.refresh();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900">Nuevo período de pago</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Nombre del período <span className="text-red-500">*</span></label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Junio 2025"
              className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Fecha inicio <span className="text-red-500">*</span></label>
              <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Fecha fin <span className="text-red-500">*</span></label>
              <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Precio por litro ($) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input required type="number" step="0.01" min="0" value={pricePerLiter} onChange={(e) => setPricePerLiter(e.target.value)} placeholder="0.00"
                className="w-full border border-zinc-300 rounded-lg pl-7 pr-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        </form>
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">Cancelar</button>
          <button type="submit" form="period-form" onClick={onSubmit} disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors">
            {submitting ? "Creando…" : "Crear período"}
          </button>
        </div>
        <form id="period-form" onSubmit={onSubmit} className="hidden" />
      </aside>
      <style>{`@keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slide-in { animation: slide-in 0.25s ease-out; }`}</style>
    </>
  );
}

export function PaymentPeriodList() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payment-periods")
      .then((r) => r.json())
      .then((data) => { setPeriods(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function onDelete(id: number) {
    if (!window.confirm("¿Eliminar este período y todas sus entradas?")) return;
    await fetch(`/api/payment-periods/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (loading) return <div className="p-8 text-center text-zinc-400 text-sm">Cargando…</div>;

  return (
    <>
      <PaymentPeriodDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="min-h-screen bg-zinc-50">
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Materias Primas</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Períodos de pago a proveedores de leche</p>
            </div>
            <button onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nuevo período
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-6">
          {periods.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="text-zinc-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <p className="text-sm font-medium text-zinc-700">No hay períodos de pago creados</p>
              <p className="text-xs text-zinc-400 mt-1">Creá el primer período para registrar ingresos de leche</p>
            </div>
          ) : (
            <div className="space-y-3">
              {periods.map((p) => (
                <a key={p.id} href={`/raw-materials/${p.id}`}
                  className="block bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">{p.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(p.startDate).toLocaleDateString("es-AR")} — {new Date(p.endDate).toLocaleDateString("es-AR")}
                        {" · "}${p.pricePerLiter.toLocaleString("es-AR", { minimumFractionDigits: 2 })}/litro
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <p className="text-xs text-zinc-500">Total litros</p>
                        <p className="text-lg font-bold text-zinc-900">{p.totalLiters.toLocaleString("es-AR", { maximumFractionDigits: 1 })} L</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Total a pagar</p>
                        <p className="text-lg font-bold text-amber-600">${p.totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Entradas</p>
                        <p className="text-lg font-bold text-zinc-700">{p._count.entries}</p>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(p.id); }}
                        className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar período"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
