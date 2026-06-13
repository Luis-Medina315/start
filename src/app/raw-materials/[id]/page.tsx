import { prisma } from "@/lib/prisma";
import { PeriodDetailClient } from "@/components/PeriodDetailClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function PeriodDetailPage({ params }: Props) {
  const { id } = await params;
  const period = await prisma.paymentPeriod.findUnique({
    where: { id: Number(id) },
    include: { entries: { orderBy: { date: "desc" } } },
  });
  if (!period) return <div className="p-8 text-center text-zinc-500">Período no encontrado</div>;
  const serialized = {
    ...period,
    startDate: period.startDate.toISOString(),
    endDate: period.endDate.toISOString(),
    createdAt: period.createdAt.toISOString(),
    entries: period.entries.map((e) => ({ ...e, date: e.date.toISOString(), createdAt: e.createdAt.toISOString() })),
  };
  return <PeriodDetailClient period={serialized} />;
}
