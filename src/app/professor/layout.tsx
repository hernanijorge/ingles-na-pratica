import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-light">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm sm:px-10">
        <Link href="/professor">
          <Logo className="text-lg" />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-brand-gray">
          <Link href="/professor" className="hover:text-brand-blue-dark">
            Painel
          </Link>
          <Link href="/professor/cursos" className="hover:text-brand-blue-dark">
            Cursos
          </Link>
          <Link href="/professor/correcoes" className="hover:text-brand-blue-dark">
            Correções
          </Link>
          <Link href="/professor/agenda" className="hover:text-brand-blue-dark">
            Agenda
          </Link>
          <LogoutButton />
        </nav>
      </header>
      <main className="px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
