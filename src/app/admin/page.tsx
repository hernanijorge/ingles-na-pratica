import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const [users, leads, pendingTestimonials, paidPurchases] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.lead.count(),
    prisma.testimonial.count({ where: { approved: false } }),
    prisma.purchase.count({ where: { status: "PAID" } }),
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-brand-gray">Usuários</p>
        <p className="mt-1 font-heading text-3xl font-bold text-brand-blue-dark">{users}</p>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-brand-gray">Leads captados</p>
        <p className="mt-1 font-heading text-3xl font-bold text-brand-blue-dark">{leads}</p>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-brand-gray">Depoimentos pendentes</p>
        <p className="mt-1 font-heading text-3xl font-bold text-brand-blue-dark">{pendingTestimonials}</p>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-brand-gray">Compras pagas</p>
        <p className="mt-1 font-heading text-3xl font-bold text-brand-blue-dark">{paidPurchases}</p>
      </div>
    </div>
  );
}
