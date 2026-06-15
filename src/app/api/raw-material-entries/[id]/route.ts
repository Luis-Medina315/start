import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const entryId = Number(id);
    const body = await req.json();
    const entry = await prisma.rawMaterialEntry.update({
      where: { id: entryId },
      data: {
        clientName: body.clientName,
        liters: body.liters != null ? Number(body.liters) : undefined,
        date: body.date ? new Date(body.date) : undefined,
      },
    });
    return NextResponse.json({
      ...entry,
      date: entry.date.toISOString(),
      createdAt: entry.createdAt.toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const entryId = Number(id);
    await prisma.rawMaterialEntry.delete({ where: { id: entryId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
