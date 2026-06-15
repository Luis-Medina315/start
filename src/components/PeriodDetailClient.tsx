"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export function EntryDrawer({ open, onClose, periodId, initialClientName, editingEntry }: { open: boolean; onClose: () => void; periodId: number; initialClientName?: string; editingEntry?: Entry }) {
  const [clientName, setClientName] = useState(editingEntry?.clientName ?? initialClientName ?? "");
  const [liters, setLiters] = useState(editingEntry?.liters.toString() ?? "");
  const [date, setDate] = useState(editingEntry ? editingEntry.date.split("T")[0] : new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingEntry) {
        setClientName(editingEntry.clientName);
        setLiters(editingEntry.liters.toString());
        setDate(editingEntry.date.split("T")[0]);
      } else {
        setClientName(initialClientName ?? "");
        setLiters("");
        setDate(new Date().toISOString().split("T")[0]);
      }
      setError(null);
    }
  }, [open, initialClientName, editingEntry]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const url = editingEntry ? `/api/raw-material-entries/${editingEntry.id}` : "/api/raw-material-entries";
      const method = editingEntry ? "PUT" : "POST";
      const body = editingEntry
        ? JSON.stringify({ clientName, liters: Number(liters), date })
        : JSON.stringify({ clientName, liters: Number(liters), date, paymentPeriodId: periodId });
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al guardar");
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
          <h2 className="text-lg font-semibold text-zinc-900">
            {editingEntry
              ? "Editar entrada"
              : initialClientName
              ? `Registrar ingreso · ${initialClientName}`
              : "Registrar ingreso de leche"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Nombre del cliente <span className="text-red-500">*</span></label>
            <input required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej: Tambo Los Pinos" disabled={!!initialClientName && !editingEntry}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-zinc-100 disabled:text-zinc-600 disabled:cursor-not-allowed" />
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
            {submitting ? "Guardando…" : editingEntry ? "Guardar cambios" : "Registrar ingreso"}
          </button>
        </div>
        <form id="entry-form" onSubmit={onSubmit} className="hidden" />
      </aside>
      <style>{`@keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slide-in { animation: slide-in 0.25s ease-out; }`}</style>
    </>
  );
}

export function PeriodDetailClient({ period }: { period: Period }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined);
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>(undefined);
  const [managingClient, setManagingClient] = useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm("¿Eliminar este período y todas sus entradas?")) return;
    const res = await fetch(`/api/payment-periods/${period.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/raw-materials");
      router.refresh();
    } else {
      window.alert("No se pudo eliminar el período");
    }
  }

  function openDrawerForClient(clientName?: string) {
    setSelectedClient(clientName);
    setEditingEntry(undefined);
    setDrawerOpen(true);
  }

  function openDrawerForEdit(entry: Entry) {
    setEditingEntry(entry);
    setSelectedClient(undefined);
    setDrawerOpen(true);
  }

  function openClientManager(clientName: string) {
    setManagingClient(clientName);
  }

  async function onDeleteEntry(entryId: number) {
    if (!window.confirm("¿Eliminar esta entrada?")) return;
    const res = await fetch(`/api/raw-material-entries/${entryId}`, { method: "DELETE" });
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "No se pudo eliminar la entrada");
    }
  }

  async function onRenameClient(oldName: string) {
    const newName = window.prompt(`Renombrar cliente "${oldName}" a:`, oldName);
    if (!newName || newName.trim() === "" || newName === oldName) return;
    const res = await fetch(`/api/payment-periods/${period.id}/clients`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldName, newName: newName.trim() }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "No se pudo renombrar el cliente");
    }
  }

  async function onDeleteClient(clientName: string) {
    if (!window.confirm(`¿Eliminar todas las entradas del cliente "${clientName}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/payment-periods/${period.id}/clients?clientName=${encodeURIComponent(clientName)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "No se pudo eliminar el cliente");
    }
  }

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
      {managingClient && (
        <ClientEntriesDrawer
          clientName={managingClient}
          period={period}
          onClose={() => setManagingClient(null)}
          onEditEntry={(entry) => { setManagingClient(null); openDrawerForEdit(entry); }}
          onDeleteEntry={onDeleteEntry}
          onRenameClient={(oldName) => { setManagingClient(null); onRenameClient(oldName); }}
        />
      )}
      <EntryDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setSelectedClient(undefined); setEditingEntry(undefined); }} periodId={period.id} initialClientName={selectedClient} editingEntry={editingEntry} />
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
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onDelete}
                className="p-2.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Eliminar período">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
              <button onClick={() => openDrawerForClient(undefined)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Registrar ingreso
              </button>
            </div>
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
                    <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {accumulated.map((row) => (
                    <tr key={row.clientName} onClick={() => openDrawerForClient(row.clientName)}
                      className="hover:bg-amber-50/60 cursor-pointer transition-colors group" title={`Click para registrar ingreso de ${row.clientName}`}>
                      <td className="px-5 py-4 text-sm font-medium text-zinc-900 group-hover:text-amber-700">{row.clientName}</td>
                      <td className="px-5 py-4 text-sm text-right text-zinc-700">{row.totalLiters.toLocaleString("es-AR", { maximumFractionDigits: 1 })} L</td>
                      <td className="px-5 py-4 text-sm text-right font-medium text-amber-600">${row.totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openClientManager(row.clientName)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title={`Editar entradas de ${row.clientName}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button onClick={() => onDeleteClient(row.clientName)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title={`Eliminar ${row.clientName} y todas sus entradas`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
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

function ClientEntriesDrawer({ clientName, period, onClose, onEditEntry, onDeleteEntry, onRenameClient }: {
  clientName: string;
  period: Period;
  onClose: () => void;
  onEditEntry: (entry: Entry) => void;
  onDeleteEntry: (entryId: number) => Promise<void>;
  onRenameClient: (oldName: string) => Promise<void>;
}) {
  const clientEntries = period.entries.filter((e) => e.clientName === clientName);
  const totalLiters = clientEntries.reduce((s, e) => s + e.liters, 0);
  const totalValue = totalLiters * period.pricePerLiter;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{clientName}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Entradas de este período</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-700 uppercase tracking-wider font-medium">Total acumulado</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">{totalLiters.toLocaleString("es-AR", { maximumFractionDigits: 1 })} L</p>
            <p className="text-sm text-amber-700 font-medium mt-1">${totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
          </div>
          <button onClick={() => onRenameClient(clientName)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Renombrar cliente
          </button>
          {clientEntries.length === 0 ? (
            <p className="text-center text-zinc-400 text-sm py-8">No hay entradas registradas</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Entradas individuales</p>
              {clientEntries.map((e) => (
                <div key={e.id} className="border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-zinc-900">{e.liters.toLocaleString("es-AR", { maximumFractionDigits: 1 })} L</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{new Date(e.date).toLocaleDateString("es-AR")}</p>
                      <p className="text-sm text-amber-600 font-medium mt-1">${(e.liters * period.pricePerLiter).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEditEntry(e)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Editar entrada (corregir litros, fecha o nombre)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button onClick={() => onDeleteEntry(e.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar entrada">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
      <style>{`@keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slide-in { animation: slide-in 0.25s ease-out; }`}</style>
    </>
  );
}
