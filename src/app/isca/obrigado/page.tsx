import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function IscaObrigadoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-light px-4 py-10 text-center">
      <Link href="/" className="mb-8">
        <Logo className="text-xl" />
      </Link>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="font-heading text-2xl font-semibold text-brand-dark">Prontinho! 🎉</h1>
        <p className="mt-3 text-brand-gray">
          Seu material está pronto para download. Clique no botão abaixo para baixar o PDF.
        </p>
        <a
          href="/materiais/ingles-simples-dia-a-dia.pdf"
          download
          className="mt-6 inline-block w-full rounded-lg bg-brand-blue py-2.5 font-semibold text-white transition hover:bg-brand-blue-dark"
        >
          Baixar PDF grátis
        </a>
        <p className="mt-6 text-sm text-brand-gray">
          Quer ir além? <Link href="/cadastro" className="text-brand-blue-dark underline">Crie sua conta gratuita</Link>{" "}
          e comece a primeira aula agora.
        </p>
      </div>
    </main>
  );
}
