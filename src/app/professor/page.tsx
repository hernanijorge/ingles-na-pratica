import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function ProfessorDashboardPage() {
  await requireRole("PROFESSOR", "ADMIN");

  const [courses, pendingAudio, upcomingBookings] = await Promise.all([
    prisma.course.count(),
    prisma.exerciseSubmission.count({ where: { exercise: { type: "SPEAK" }, status: "AWAITING_FEEDBACK" } }),
    prisma.booking.count({ where: { status: "SCHEDULED", slot: { startsAt: { gt: new Date() } } } }),
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-brand-gray">Cursos cadastrados</p>
        <p className="mt-1 font-heading text-3xl font-bold text-brand-blue-dark">{courses}</p>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-brand-gray">Áudios aguardando correção</p>
        <p className="mt-1 font-heading text-3xl font-bold text-brand-blue-dark">{pendingAudio}</p>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-brand-gray">Aulas particulares agendadas</p>
        <p className="mt-1 font-heading text-3xl font-bold text-brand-blue-dark">{upcomingBookings}</p>
      </div>
    </div>
  );
}
