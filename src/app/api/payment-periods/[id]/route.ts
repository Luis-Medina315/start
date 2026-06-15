import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const period = await prisma.paymentPeriod.findUnique({
      where: { id: Number(id) },
      include: {
        entries: { orderBy: { date: "desc" } },
      },
    });
    if (!period) return NextResponse.json({ error: "no encontrado" }, { status: 404 });
    const serialized = {
      ...period,
      startDate: period.startDate.toISOString(),
      endDate: period.endDate.toISOString(),
      createdAt: period.createdAt.toISOString(),
    };
    return NextResponse.json(serialized);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await req.json();
    const period = await prisma.paymentPeriod.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        pricePerLiter: body.pricePerLiter != null ? Number(body.pricePerLiter) : undefined,
      },
    });
    return NextResponse.json({ ...period, startDate: period.startDate.toISOString(), endDate: period.endDate.toISOString(), createdAt: period.createdAt.toISOString() });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const periodId = Number(id);
    await prisma.rawMaterialEntry.deleteMany({ where: { paymentPeriodId: periodId } });
    await prisma.paymentPeriod.delete({ where: { id: periodId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
