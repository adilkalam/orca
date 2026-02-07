---
name: stripe-integration
description: >
  Payment integration patterns for Stripe. Covers checkout sessions, subscriptions,
  webhooks, idempotency, and the sharp edges that cause real-money bugs. Backend-agnostic
  with examples for Next.js App Router and Django REST Framework.
license: internal
allowed-tools:
  - Read
  - Grep
metadata:
  category: "payments"
  source: "vibeship-spawner-skills (Apache 2.0) + ORCA-OS adaptation"
---

# Stripe Integration Skill

You are a payments engineer who has processed billions in transactions.
You have seen every edge case -- declined cards, webhook failures, subscription
nightmares, currency issues, refund fraud. You know that payments code must
be bulletproof because errors cost real money. You are paranoid about race
conditions, idempotency, and webhook verification.

This skill applies when you detect Stripe-related work: payment forms, checkout,
subscriptions, billing portals, webhook handlers, or any `stripe` imports.

---

## 1. Core Patterns

### 1.1 Idempotency Key Everything

Every mutation that touches money MUST include an idempotency key. Without one,
network retries can duplicate charges.

```python
# Django / Python
import stripe
import uuid

def create_payment_intent(amount_cents, currency, customer_id, metadata=None):
    idempotency_key = f"pi_{customer_id}_{uuid.uuid4().hex[:12]}"
    return stripe.PaymentIntent.create(
        amount=amount_cents,
        currency=currency,
        customer=customer_id,
        metadata=metadata or {},
        idempotency_key=idempotency_key,
    )
```

```typescript
// Next.js / TypeScript
import Stripe from "stripe";
import { randomUUID } from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function createPaymentIntent(
  amountCents: number,
  currency: string,
  customerId: string
) {
  const idempotencyKey = `pi_${customerId}_${randomUUID().slice(0, 12)}`;
  return stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency,
      customer: customerId,
    },
    { idempotencyKey }
  );
}
```

### 1.2 Webhook State Machine

Treat webhooks as state transitions, not triggers. Your local subscription state
should mirror Stripe's state exactly.

```
Subscription States:
  incomplete -> active -> past_due -> canceled
                     \-> paused
                     \-> unpaid -> canceled
```

Handle ALL transitions:

```python
# Django webhook handler
SUBSCRIPTION_HANDLERS = {
    "customer.subscription.created": handle_subscription_created,
    "customer.subscription.updated": handle_subscription_updated,
    "customer.subscription.deleted": handle_subscription_deleted,
    "customer.subscription.paused": handle_subscription_paused,
    "customer.subscription.resumed": handle_subscription_resumed,
    "customer.subscription.pending_update_applied": handle_pending_update,
    "customer.subscription.pending_update_expired": handle_pending_expired,
    "customer.subscription.trial_will_end": handle_trial_ending,
    "invoice.payment_succeeded": handle_payment_success,
    "invoice.payment_failed": handle_payment_failure,
    "invoice.payment_action_required": handle_action_required,
}
```

### 1.3 Test Mode Throughout Development

Use Stripe test mode with real test cards for all development. Never use live keys
in development or staging.

```bash
# Environment separation
STRIPE_SECRET_KEY=sk_test_...       # Development
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Development

STRIPE_SECRET_KEY=sk_live_...       # Production ONLY
STRIPE_PUBLISHABLE_KEY=pk_live_...  # Production ONLY
```

Test card numbers:
- `4242424242424242` -- Success
- `4000000000000002` -- Declined
- `4000002500003155` -- Requires 3D Secure
- `4000000000009995` -- Insufficient funds

---

## 2. Webhook Verification

### 2.1 Next.js App Router (route handler)

The raw body MUST reach the verification function before any JSON parsing.
Next.js App Router route handlers give you this control naturally:

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

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Process the verified event
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
      break;
    case "invoice.payment_succeeded":
      await handlePaymentSuccess(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      await handlePaymentFailure(event.data.object as Stripe.Invoice);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
```

### 2.2 Django REST Framework

```python
# views.py
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
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse("Invalid payload", status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse("Invalid signature", status=400)

    handler = WEBHOOK_HANDLERS.get(event["type"])
    if handler:
        handler(event["data"]["object"])
    else:
        print(f"Unhandled event type: {event['type']}")

    return HttpResponse(status=200)


WEBHOOK_HANDLERS = {
    "checkout.session.completed": handle_checkout_complete,
    "invoice.payment_succeeded": handle_payment_success,
    "invoice.payment_failed": handle_payment_failure,
    "customer.subscription.updated": handle_subscription_update,
    "customer.subscription.deleted": handle_subscription_canceled,
}
```

---

## 3. Checkout Session with Metadata

Always pass metadata through checkout sessions. Without metadata, you cannot
associate the Stripe payment with your internal records after the async webhook fires.

```typescript
// Creating a checkout session with metadata
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  customer: stripeCustomerId,
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/billing/cancel`,
  metadata: {
    user_id: userId,          // YOUR internal user ID
    plan_name: planName,      // YOUR internal plan identifier
    referral_code: refCode,   // Any tracking data you need later
  },
  subscription_data: {
    metadata: {
      user_id: userId,        // Also on subscription for future webhooks
      plan_name: planName,
    },
  },
});
```

```python
# Django equivalent
session = stripe.checkout.Session.create(
    mode="subscription",
    customer=stripe_customer_id,
    line_items=[{"price": price_id, "quantity": 1}],
    success_url=f"{base_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
    cancel_url=f"{base_url}/billing/cancel",
    metadata={
        "user_id": str(user.id),
        "plan_name": plan_name,
    },
    subscription_data={
        "metadata": {
            "user_id": str(user.id),
            "plan_name": plan_name,
        },
    },
)
```

---

## 4. Anti-Patterns

### Do NOT trust API responses for payment status

The API response from creating a PaymentIntent only tells you the *initial* state.
Cards can fail asynchronously (3D Secure, bank holds, fraud checks). Always use
webhooks as the source of truth for payment status.

```typescript
// WRONG - trusting the API response
const intent = await stripe.paymentIntents.create({ ... });
if (intent.status === "succeeded") {
  await grantAccess(userId); // Race condition! Status can change.
}

// RIGHT - webhook-first architecture
// 1. Create the intent, return client_secret to frontend
// 2. Frontend completes payment with Stripe.js
// 3. Webhook fires with final status
// 4. Webhook handler grants/revokes access
```

### Do NOT skip webhook signature verification

Every webhook endpoint MUST verify the Stripe signature. Without verification,
anyone can POST fake events to your webhook URL and grant themselves access.

### Do NOT check subscription status without refresh

Local subscription state drifts from Stripe. Before granting access based on
subscription status, either refresh from Stripe or ensure your webhook handler
keeps state current.

```typescript
// WRONG - trusting stale local state
const user = await db.user.findUnique({ where: { id: userId } });
if (user.subscriptionStatus === "active") {
  grantAccess();
}

// RIGHT - verify with Stripe when it matters
const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
if (subscription.status === "active" || subscription.status === "trialing") {
  grantAccess();
}
```

---

## 5. Sharp Edges

| Issue | Severity | What Goes Wrong |
|-------|----------|-----------------|
| No webhook signature verification | Critical | Attackers POST fake events, grant themselves premium access |
| JSON middleware parses body before webhook verifies | Critical | Signature check fails silently; all webhooks rejected |
| No idempotency keys on payment operations | High | Network retries double-charge customers |
| Trusting API response instead of webhooks | Critical | 3D Secure / async declines grant access then revoke |
| No metadata on checkout session | High | Cannot link Stripe payment to your internal user/plan |
| Local subscription state drifts from Stripe | High | Users keep access after cancellation or vice versa |
| Not handling failed payments (dunning) | High | Revenue leaks; users in limbo state |
| Different behavior between test and live mode | High | Works in dev, fails in production with real cards |

---

## 6. Dunning and Failed Payment Handling

When a subscription payment fails, Stripe retries according to your Smart Retries
settings. You must handle the interim states:

```python
def handle_invoice_payment_failed(invoice):
    """Called when a subscription payment fails."""
    subscription_id = invoice["subscription"]
    customer_id = invoice["customer"]
    attempt_count = invoice["attempt_count"]

    user = User.objects.get(stripe_customer_id=customer_id)

    if attempt_count == 1:
        # First failure: notify user, keep access
        send_payment_failed_email(user, invoice)
    elif attempt_count >= 3:
        # Multiple failures: warn about upcoming cancellation
        send_cancellation_warning_email(user, invoice)

    # Update local state
    user.payment_status = "past_due"
    user.save()
```

---

## 7. Related Skills

Works well with:
- `skills/web-interface-guidelines/SKILL.md` -- Form patterns for checkout UX
- `skills/frontend-aesthetics/SKILL.md` -- Visual design for billing pages
- `skills/search-before-edit/SKILL.md` -- Grep for existing Stripe patterns before adding new ones
