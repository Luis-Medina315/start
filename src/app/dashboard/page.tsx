import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const productCount = await prisma.product.count();
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Resumen del sistema</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total productos</p>
            <p className="text-4xl font-bold text-amber-600 mt-2">{productCount}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Valor en stock</p>
            <p className="text-4xl font-bold text-zinc-900 mt-2">
              ${totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Alertas stock bajo</p>
            <p className="text-4xl font-bold text-red-600 mt-2">
              {products.filter((p) => p.stock > 0 && p.stock < 5).length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-base font-semibold text-zinc-900">Últimos productos agregados</h2>
          </div>
          {products.length === 0 ? (
            <div className="px-6 py-12 text-center text-zinc-400 text-sm">
              No hay productos registrados aún.
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {products.map((p) => (
                <li key={p.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{p.name}</p>
                    <p className="text-xs text-zinc-400">{p.category ?? "Sin categoría"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-zinc-900">
                      ${p.price.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-zinc-400">Stock: {p.stock}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
