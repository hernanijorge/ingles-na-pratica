import Link from "next/link";

export default function PurchaseSuccessPage() {
  return (
    <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
      <h1 className="font-heading text-2xl font-bold text-brand-dark">Pagamento confirmado! 🎉</h1>
      <p className="mt-3 text-brand-gray">
        Seu acesso já foi liberado. Pode levar alguns segundos para aparecer no seu painel.
      </p>
      <Link
        href="/app"
        className="mt-6 inline-block rounded-full bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-dark"
      >
        Ir para o painel
      </Link>
    </div>
  );
}
