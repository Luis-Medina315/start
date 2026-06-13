import { prisma } from "@/lib/prisma";
import { InventoryClient } from "@/components/InventoryClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
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

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 5).length;

  return (
    <InventoryClient
      initialProducts={serialized}
      totalStock={totalStock}
      totalValue={totalValue}
      lowStockCount={lowStockCount}
    />
  );
}
