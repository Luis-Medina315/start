import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const periodId = Number(id);
    const body = await req.json();
    if (!body?.oldName || !body?.newName) {
      return NextResponse.json({ error: "oldName y newName son requeridos" }, { status: 400 });
    }
    const result = await prisma.rawMaterialEntry.updateMany({
      where: { paymentPeriodId: periodId, clientName: body.oldName },
      data: { clientName: body.newName },
    });
    return NextResponse.json({ ok: true, count: result.count });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const periodId = Number(id);
    const { searchParams } = new URL(req.url);
    const clientName = searchParams.get("clientName");
    if (!clientName) {
      return NextResponse.json({ error: "clientName es requerido" }, { status: 400 });
    }
    const result = await prisma.rawMaterialEntry.deleteMany({
      where: { paymentPeriodId: periodId, clientName },
    });
    return NextResponse.json({ ok: true, count: result.count });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
