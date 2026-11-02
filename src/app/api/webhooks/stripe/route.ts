import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";
import { PRODUCT_CLASS_CREDITS, PRODUCT_COURSE_KEYS, type ProductKey } from "@/lib/business/products";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    if (!signature || !webhookSecret) throw new Error("Assinatura do webhook ausente.");
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook inválido: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    await fulfillPurchase(checkoutSession);
  }

  return NextResponse.json({ received: true });
}

async function fulfillPurchase(checkoutSession: Stripe.Checkout.Session) {
  const purchaseId = checkoutSession.metadata?.purchaseId;
  if (!purchaseId) return;

  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId }, include: { product: true } });
  if (!purchase || purchase.status === "PAID") return;

  await prisma.purchase.update({ where: { id: purchase.id }, data: { status: "PAID" } });

  const productKey = purchase.product.key as ProductKey;

  if (PRODUCT_COURSE_KEYS.includes(productKey)) {
    const course = await prisma.course.findFirst({ where: { productKey: purchase.product.key } });
    if (course) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: purchase.userId, courseId: course.id } },
        create: { userId: purchase.userId, courseId: course.id },
        update: {},
      });
    }
  }

  const credits = PRODUCT_CLASS_CREDITS[productKey];
  if (credits) {
    await prisma.classCredit.upsert({
      where: { purchaseId: purchase.id },
      create: {
        userId: purchase.userId,
        purchaseId: purchase.id,
        totalCredits: credits,
        remainingCredits: credits,
      },
      update: {},
    });
  }
}
