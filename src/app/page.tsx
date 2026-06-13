import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/ProductForm";
import { ProductList } from "@/components/ProductList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    category: p.category,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-amber-50 text-zinc-900 font-sans">
      <header className="border-b border-amber-200 bg-amber-100/60">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Quesera — Productos
          </h1>
          <p className="text-zinc-600 mt-1">
            Gestión de stock y catálogo de quesos.
          </p>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <ProductForm />
        <section>
          <h2 className="text-xl font-semibold mb-3">
            Listado ({products.length})
          </h2>
          <ProductList initialProducts={serialized} />
        </section>
      </main>
    </div>
  );
}
