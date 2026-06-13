import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const periods = await prisma.paymentPeriod.findMany({
    orderBy: { startDate: "desc" },
    include: {
      _count: { select: { entries: true } },
      entries: { select: { liters: true, clientName: true } },
    },
  });
  const serialized = periods.map((p) => ({
    ...p,
    startDate: p.startDate.toISOString(),
    endDate: p.endDate.toISOString(),
    createdAt: p.createdAt.toISOString(),
    totalLiters: p.entries.reduce((sum, e) => sum + e.liters, 0),
    totalValue: p.entries.reduce((sum, e) => sum + e.liters, 0) * p.pricePerLiter,
  }));
  return NextResponse.json(serialized);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.name || !body?.startDate || !body?.endDate || body?.pricePerLiter == null) {
      return NextResponse.json({ error: "name, startDate, endDate, pricePerLiter son requeridos" }, { status: 400 });
    }
    const period = await prisma.paymentPeriod.create({
      data: {
        name: String(body.name),
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        pricePerLiter: Number(body.pricePerLiter),
      },
    });
    return NextResponse.json({ ...period, startDate: period.startDate.toISOString(), endDate: period.endDate.toISOString(), createdAt: period.createdAt.toISOString() }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
