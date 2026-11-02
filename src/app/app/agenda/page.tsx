import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { getSlotZonedView } from "@/lib/business/scheduling";
import { BuyProductButton } from "@/components/BuyProductButton";
import { BookSlotButton } from "@/components/BookSlotButton";
import { CancelBookingButton } from "@/components/CancelBookingButton";

export default async function AgendaPage() {
  const session = await requireSession();

  const [credits, slots, bookings] = await Promise.all([
    prisma.classCredit.aggregate({
      where: { userId: session.sub },
      _sum: { remainingCredits: true },
    }),
    prisma.availabilitySlot.findMany({
      where: { isBooked: false, startsAt: { gt: new Date() } },
      include: { teacher: { select: { name: true } } },
      orderBy: { startsAt: "asc" },
      take: 20,
    }),
    prisma.booking.findMany({
      where: { studentId: session.sub, status: "SCHEDULED" },
      include: { slot: true, teacher: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const remainingCredits = credits._sum.remainingCredits ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-dark">Aulas particulares</h1>
        <p className="text-brand-gray">
          Horários exibidos no fuso de São Paulo e Nova York. Você tem{" "}
          <strong>{remainingCredits}</strong> aula(s) disponível(is) para agendar.
        </p>
      </div>

      {remainingCredits === 0 && (
        <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <BuyProductButton productKey="SINGLE_CLASS" label="Comprar 1 aula avulsa" />
          <BuyProductButton productKey="PACKAGE_4" label="Comprar pacote de 4 aulas" />
        </div>
      )}

      {bookings.length > 0 && (
        <div>
          <h2 className="mb-3 font-heading text-lg font-semibold text-brand-dark">Minhas aulas agendadas</h2>
          <ul className="space-y-3">
            {bookings.map((booking) => {
              const view = getSlotZonedView(booking.slot.startsAt);
              return (
                <li key={booking.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                  <div>
                    <p className="font-medium text-brand-dark">Com {booking.teacher.name}</p>
                    <p className="text-sm text-brand-gray">
                      🇧🇷 {view.saoPaulo.label} · 🇺🇸 {view.newYork.label}
                    </p>
                    {booking.meetingLink && (
                      <a href={booking.meetingLink} target="_blank" className="text-sm text-brand-blue-dark underline">
                        Link da aula
                      </a>
                    )}
                  </div>
                  <CancelBookingButton bookingId={booking.id} />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold text-brand-dark">Horários disponíveis</h2>
        {slots.length === 0 ? (
          <p className="text-brand-gray">Nenhum horário disponível no momento.</p>
        ) : (
          <ul className="space-y-3">
            {slots.map((slot) => {
              const view = getSlotZonedView(slot.startsAt);
              return (
                <li key={slot.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                  <div>
                    <p className="font-medium text-brand-dark">Com {slot.teacher.name}</p>
                    <p className="text-sm text-brand-gray">
                      🇧🇷 {view.saoPaulo.label} (São Paulo) · 🇺🇸 {view.newYork.label} (Nova York)
                    </p>
                  </div>
                  {remainingCredits > 0 && <BookSlotButton slotId={slot.id} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
