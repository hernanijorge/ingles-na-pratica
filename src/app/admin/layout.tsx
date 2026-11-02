import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-light">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm sm:px-10">
        <Link href="/admin">
          <Logo className="text-lg" />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-brand-gray">
          <Link href="/admin" className="hover:text-brand-blue-dark">
            Painel
          </Link>
          <Link href="/admin/usuarios" className="hover:text-brand-blue-dark">
            Usuários
          </Link>
          <Link href="/admin/produtos" className="hover:text-brand-blue-dark">
            Produtos
          </Link>
          <Link href="/admin/leads" className="hover:text-brand-blue-dark">
            Leads
          </Link>
          <Link href="/admin/depoimentos" className="hover:text-brand-blue-dark">
            Depoimentos
          </Link>
          <LogoutButton />
        </nav>
      </header>
      <main className="px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
