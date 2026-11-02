import Link from "next/link";

export default function PurchaseCancelledPage() {
  return (
    <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
      <h1 className="font-heading text-2xl font-bold text-brand-dark">Pagamento não concluído</h1>
      <p className="mt-3 text-brand-gray">Nenhuma cobrança foi feita. Você pode tentar novamente quando quiser.</p>
      <Link
        href="/app"
        className="mt-6 inline-block rounded-full bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-dark"
      >
        Voltar ao painel
      </Link>
    </div>
  );
}
