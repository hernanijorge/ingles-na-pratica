import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-brand-light">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm sm:px-10">
        <Link href="/app">
          <Logo className="text-lg" />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-brand-gray">
          <Link href="/app" className="hover:text-brand-blue-dark">
            Painel
          </Link>
          <Link href="/app/agenda" className="hover:text-brand-blue-dark">
            Agenda
          </Link>
          <Link href="/app/certificados" className="hover:text-brand-blue-dark">
            Certificados
          </Link>
          <Link href="/app/depoimento" className="hover:text-brand-blue-dark">
            Depoimento
          </Link>
          <Link href="/app/conta" className="hover:text-brand-blue-dark">
            Conta
          </Link>
          {session && <LogoutButton />}
        </nav>
      </header>
      <main className="px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
