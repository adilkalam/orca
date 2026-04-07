---
name: stripe-integration
description: "Payment integration patterns for Stripe — checkout sessions, subscriptions, webhooks, idempotency, and sharp edges that cause real-money bugs. Use when implementing Stripe payments, checkout flows, subscription billing, webhook handlers, or any code importing stripe."
allowed-tools: Read, Grep
---

# Stripe Integration Skill

Applies when Stripe-related work is detected: payment forms, checkout, subscriptions, billing portals, webhook handlers, or any `stripe` imports.

## 1. Core Patterns

### 1.1 Idempotency Key Everything

Every mutation that touches money MUST include an idempotency key. Without one, network retries can duplicate charges.

```python
# Django / Python
import stripe, uuid

def create_payment_intent(amount_cents, currency, customer_id, metadata=None):
    idempotency_key = f"pi_{customer_id}_{uuid.uuid4().hex[:12]}"
    return stripe.PaymentIntent.create(
        amount=amount_cents, currency=currency, customer=customer_id,
        metadata=metadata or {}, idempotency_key=idempotency_key,
    )
```

```typescript
// Next.js / TypeScript
import Stripe from "stripe";
import { randomUUID } from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function createPaymentIntent(amountCents: number, currency: string, customerId: string) {
  const idempotencyKey = `pi_${customerId}_${randomUUID().slice(0, 12)}`;
  return stripe.paymentIntents.create(
    { amount: amountCents, currency, customer: customerId },
    { idempotencyKey }
  );
}
```

### 1.2 Webhook State Machine

Treat webhooks as state transitions, not triggers. Mirror Stripe's subscription state exactly:

```
incomplete -> active -> past_due -> canceled
                    \-> paused
                    \-> unpaid -> canceled
```

Handle ALL transitions — see the handler map below in section 2.

### 1.3 Test Mode Throughout Development

Never use live keys in development or staging.

Test card numbers: `4242424242424242` (success), `4000000000000002` (declined), `4000002500003155` (3D Secure), `4000000000009995` (insufficient funds).

## 2. Webhook Verification

### Next.js App Router

The raw body MUST reach verification before any JSON parsing:

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text(); // Raw body, NOT .json()
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session); break;
    case "invoice.payment_succeeded":
      await handlePaymentSuccess(event.data.object as Stripe.Invoice); break;
    case "invoice.payment_failed":
      await handlePaymentFailure(event.data.object as Stripe.Invoice); break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription); break;
    case "customer.subscription.deleted":
      await handleSubscriptionCanceled(event.data.object as Stripe.Subscription); break;
  }

  return NextResponse.json({ received: true });
}
```

### Django REST Framework

```python
import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body  # Raw bytes
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    handler = WEBHOOK_HANDLERS.get(event["type"])
    if handler:
        handler(event["data"]["object"])
    return HttpResponse(status=200)
```

## 3. Checkout Session with Metadata

Always pass metadata — without it, you cannot associate the Stripe payment with internal records after the async webhook fires.

```typescript
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  customer: stripeCustomerId,
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/billing/cancel`,
  metadata: { user_id: userId, plan_name: planName },
  subscription_data: { metadata: { user_id: userId, plan_name: planName } },
});
```

## 4. Sharp Edges

| Issue | Severity | What Goes Wrong |
|-------|----------|-----------------|
| No webhook signature verification | Critical | Attackers POST fake events, grant themselves premium access |
| JSON middleware parses body before verification | Critical | Signature check fails silently; all webhooks rejected |
| No idempotency keys on payments | High | Network retries double-charge customers |
| Trusting API response instead of webhooks | Critical | 3D Secure / async declines grant access then revoke |
| No metadata on checkout session | High | Cannot link Stripe payment to internal user/plan |
| Local subscription state drifts | High | Users keep access after cancellation or vice versa |
| Not handling failed payments (dunning) | High | Revenue leaks; users in limbo state |

### Anti-Patterns

```typescript
// WRONG - trusting API response
const intent = await stripe.paymentIntents.create({ ... });
if (intent.status === "succeeded") await grantAccess(userId); // Race condition!

// RIGHT - webhook-first architecture
// 1. Create intent, return client_secret to frontend
// 2. Frontend completes payment with Stripe.js
// 3. Webhook fires with final status → handler grants/revokes access
```

## 5. Dunning and Failed Payment Handling

```python
def handle_invoice_payment_failed(invoice):
    subscription_id = invoice["subscription"]
    customer_id = invoice["customer"]
    attempt_count = invoice["attempt_count"]
    user = User.objects.get(stripe_customer_id=customer_id)

    if attempt_count == 1:
        send_payment_failed_email(user, invoice)
    elif attempt_count >= 3:
        send_cancellation_warning_email(user, invoice)

    user.payment_status = "past_due"
    user.save()
```

## 6. Related Skills

- `skills/web-interface-guidelines/SKILL.md` — Form patterns for checkout UX
- `skills/frontend-aesthetics/SKILL.md` — Visual design for billing pages
- `skills/search-before-edit/SKILL.md` — Grep for existing Stripe patterns before adding new ones
