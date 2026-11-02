import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { getStripeClient } from "@/lib/stripe";

const schema = z.object({
  productKey: z.enum(["COURSE_FULL", "COURSE_CONSTRUCTION", "SINGLE_CLASS", "PACKAGE_4"]),
});

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "É necessário entrar para comprar." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { key: parsed.data.productKey } });
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  const purchase = await prisma.purchase.create({
    data: {
      userId: session.sub,
      productId: product.id,
      amountCents: product.priceCents,
      currency: product.currency,
      status: "PENDING",
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const stripe = getStripeClient();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    allowed_payment_method_types: ["card", "pix"],
    line_items: [
      {
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: product.priceCents,
          product_data: { name: product.name },
        },
        quantity: 1,
      },
    ],
    metadata: { purchaseId: purchase.id, productKey: product.key },
    success_url: `${siteUrl}/app/compras/sucesso?purchase=${purchase.id}`,
    cancel_url: `${siteUrl}/app/compras/cancelada`,
  });

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
