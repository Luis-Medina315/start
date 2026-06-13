"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Period = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  pricePerLiter: number;
  entries: Entry[];
};

type Entry = {
  id: number;
  clientName: string;
  liters: number;
  date: string;
};

export function EntryDrawer({ open, onClose, periodId }: { open: boolean; onClose: () => void; periodId: number }) {
  const [clientName, setClientName] = useState("");
  const [liters, setLiters] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) { setClientName(""); setLiters(""); setDate(new Date().toISOString().split("T")[0]); setError(null); }
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/raw-material-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, liters: Number(liters), date, paymentPeriodId: periodId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al registrar");
      }
      window.location.reload();
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
          <h2 className="text-lg font-semibold text-zinc-900">Registrar ingreso de leche</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Nombre del cliente <span className="text-red-500">*</span></label>
            <input required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej: Tambo Los Pinos"
              className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Litros recibidos <span className="text-red-500">*</span></label>
            <div className="relative">
              <input required type="number" step="0.1" min="0" value={liters} onChange={(e) => setLiters(e.target.value)} placeholder="0.0"
                className="w-full border border-zinc-300 rounded-lg pl-10 pr-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">L</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Fecha de ingreso <span className="text-red-500">*</span></label>
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        </form>
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">Cancelar</button>
          <button type="submit" form="entry-form" onClick={onSubmit} disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors">
            {submitting ? "Guardando…" : "Registrar ingreso"}
          </button>
        </div>
        <form id="entry-form" onSubmit={onSubmit} className="hidden" />
      </aside>
      <style>{`@keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slide-in { animation: slide-in 0.25s ease-out; }`}</style>
    </>
  );
}

export function PeriodDetailClient({ period }: { period: Period }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const clientAccumulated: Record<string, number> = {};
  for (const e of period.entries) {
    clientAccumulated[e.clientName] = (clientAccumulated[e.clientName] ?? 0) + e.liters;
  }
  const accumulated = Object.entries(clientAccumulated)
    .map(([clientName, totalLiters]) => ({
      clientName,
      totalLiters,
      totalValue: totalLiters * period.pricePerLiter,
    }))
    .sort((a, b) => b.totalLiters - a.totalLiters);

  const totalLiters = period.entries.reduce((s, e) => s + e.liters, 0);
  const totalValue = totalLiters * period.pricePerLiter;

  return (
    <>
      <EntryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} periodId={period.id} />
      <div className="min-h-screen bg-zinc-50">
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/raw-materials" className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">{period.name}</h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {new Date(period.startDate).toLocaleDateString("es-AR")} — {new Date(period.endDate).toLocaleDateString("es-AR")}
                  {" · "}${period.pricePerLiter.toLocaleString("es-AR", { minimumFractionDigits: 2 })}/litro
                </p>
              </div>
            </div>
            <button onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Registrar ingreso
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total litros</p>
              <p className="text-3xl font-bold text-zinc-900 mt-1">{totalLiters.toLocaleString("es-AR", { maximumFractionDigits: 1 })} L</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total a pagar</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">${totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Proveedores</p>
              <p className="text-3xl font-bold text-zinc-700 mt-1">{Object.keys(clientAccumulated).length}</p>
            </div>
          </div>

          {accumulated.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h2 className="text-base font-semibold text-zinc-900">Acumulado por cliente</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total litros</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total a pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {accumulated.map((row) => (
                    <tr key={row.clientName} className="hover:bg-amber-50/30">
                      <td className="px-5 py-4 text-sm font-medium text-zinc-900">{row.clientName}</td>
                      <td className="px-5 py-4 text-sm text-right text-zinc-700">{row.totalLiters.toLocaleString("es-AR", { maximumFractionDigits: 1 })} L</td>
                      <td className="px-5 py-4 text-sm text-right font-medium text-amber-600">${row.totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-semibold text-zinc-900">Entradas registradas</h2>
            </div>
            {period.entries.length === 0 ? (
              <div className="px-6 py-12 text-center text-zinc-400 text-sm">
                No hay entradas registradas en este período.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Litros</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {period.entries.map((e) => (
                    <tr key={e.id} className="hover:bg-amber-50/30">
                      <td className="px-5 py-4 text-sm text-zinc-700">{new Date(e.date).toLocaleDateString("es-AR")}</td>
                      <td className="px-5 py-4 text-sm font-medium text-zinc-900">{e.clientName}</td>
                      <td className="px-5 py-4 text-sm text-right text-zinc-700">{e.liters.toLocaleString("es-AR", { maximumFractionDigits: 1 })} L</td>
                      <td className="px-5 py-4 text-sm text-right text-zinc-700">${(e.liters * period.pricePerLiter).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
