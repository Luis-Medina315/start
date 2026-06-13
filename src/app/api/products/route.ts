import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.name || typeof body.price !== "number") {
      return NextResponse.json(
        { error: "name (string) and price (number) are required" },
        { status: 400 }
      );
    }
    const product = await prisma.product.create({
      data: {
        name: String(body.name),
        price: Number(body.price),
        stock: body.stock != null ? Number(body.stock) : 0,
        category: body.category ? String(body.category) : null,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
