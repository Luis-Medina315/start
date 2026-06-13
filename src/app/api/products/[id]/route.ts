import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }
    const body = await req.json();
    const data: {
      name?: string;
      price?: number;
      stock?: number;
      category?: string | null;
    } = {};
    if (body.name != null) data.name = String(body.name);
    if (body.price != null) data.price = Number(body.price);
    if (body.stock != null) data.stock = Number(body.stock);
    if (body.category !== undefined) {
      data.category = body.category ? String(body.category) : null;
    }
    const product = await prisma.product.update({
      where: { id: productId },
      data,
    });
    return NextResponse.json(product);
  } catch (err) {
    const message = (err as Error).message;
    const status = message.includes("Record to update not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }
    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = (err as Error).message;
    const status = message.includes("Record to delete does not exist") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
