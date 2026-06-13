import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const periodId = searchParams.get("periodId");
  if (!periodId) return NextResponse.json({ error: "periodId requerido" }, { status: 400 });
  const entries = await prisma.rawMaterialEntry.findMany({
    where: { paymentPeriodId: Number(periodId) },
    orderBy: { date: "desc" },
  });
  const serialized = entries.map((e) => ({
    ...e,
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
  }));
  return NextResponse.json(serialized);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.clientName || body?.liters == null || !body?.date || !body?.paymentPeriodId) {
      return NextResponse.json({ error: "clientName, liters, date, paymentPeriodId son requeridos" }, { status: 400 });
    }
    const entry = await prisma.rawMaterialEntry.create({
      data: {
        clientName: String(body.clientName),
        liters: Number(body.liters),
        date: new Date(body.date),
        paymentPeriodId: Number(body.paymentPeriodId),
      },
    });
    return NextResponse.json({ ...entry, date: entry.date.toISOString(), createdAt: entry.createdAt.toISOString() }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
