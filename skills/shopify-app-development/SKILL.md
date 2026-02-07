---
name: shopify-app-development
description: >
  Shopify app development patterns. Covers GraphQL Admin API, checkout extensions,
  OAuth flow, app billing, webhook configuration, and Shopify CLI. For app development
  only -- theme/Liquid work is handled by the shopify pipeline agents directly.
license: internal
allowed-tools:
  - Read
  - Grep
  - Bash
metadata:
  category: "shopify"
  source: "claude-code-templates (Apache 2.0) + ORCA-OS adaptation"
  api_version: "2026-01"
---

# Shopify App Development Skill

Use this skill when the user is building a Shopify **app** (not a theme).
This covers:

- GraphQL Admin API patterns
- Checkout UI extensions
- Admin and POS extensions
- OAuth authentication flow
- App billing (subscriptions and one-time charges)
- Webhook configuration and HMAC verification
- Shopify CLI commands for app development

This skill does NOT cover Liquid templates, theme customization, or storefront
rendering. Those are handled by `shopify-liquid-specialist`, `shopify-section-builder`,
and `shopify-css-specialist` in the Shopify pipeline.

---

## 1. Shopify CLI for Apps

```bash
# Install CLI
npm install -g @shopify/cli@latest

# Create a new app
shopify app init

# Start dev server with tunnel
shopify app dev

# Build and upload to Shopify
shopify app deploy

# Generate extensions
shopify app generate extension --type checkout_ui_extension
shopify app generate extension --type admin_action
shopify app generate extension --type admin_block
shopify app generate extension --type pos_ui_extension
shopify app generate extension --type function
```

---

## 2. Access Scopes

Configure in `shopify.app.toml`:

```toml
[access_scopes]
scopes = "read_products,write_products,read_orders,write_orders,read_customers"
```

Common scopes:

| Scope | Purpose |
|-------|---------|
| `read_products`, `write_products` | Product catalog access |
| `read_orders`, `write_orders` | Order management |
| `read_customers`, `write_customers` | Customer data |
| `read_inventory`, `write_inventory` | Stock levels |
| `read_fulfillments`, `write_fulfillments` | Order fulfillment |

Request minimal scopes. Each additional scope requires justification during
app review.

---

## 3. GraphQL Admin API Patterns (API 2026-01)

### Query Products

```graphql
query GetProducts($first: Int!, $query: String) {
  products(first: $first, query: $query) {
    edges {
      node {
        id
        title
        handle
        status
        variants(first: 5) {
          edges {
            node {
              id
              price
              inventoryQuantity
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Query Orders

```graphql
query GetOrders($first: Int!) {
  orders(first: $first) {
    edges {
      node {
        id
        name
        createdAt
        displayFinancialStatus
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
      }
    }
  }
}
```

### Set Metafields

```graphql
mutation SetMetafields($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      id
      namespace
      key
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

### Best Practices

- Use GraphQL over REST for new development
- Request only fields you need (reduces query cost)
- Implement cursor-based pagination with `pageInfo.endCursor`
- Use bulk operations for processing more than 250 items
- Handle rate limits with exponential backoff
- Monitor query costs via response `extensions.cost.actualQueryCost`

---

## 4. Checkout Extension Example

```tsx
import { useState, useEffect } from "react";
import {
  reactExtension,
  BlockStack,
  TextField,
  Checkbox,
  useApplyAttributeChange,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => (
  <GiftMessage />
));

function GiftMessage() {
  const [isGift, setIsGift] = useState(false);
  const [message, setMessage] = useState("");
  const applyAttributeChange = useApplyAttributeChange();

  useEffect(() => {
    if (isGift && message) {
      applyAttributeChange({
        type: "updateAttribute",
        key: "gift_message",
        value: message,
      });
    }
  }, [isGift, message]);

  return (
    <BlockStack spacing="loose">
      <Checkbox checked={isGift} onChange={setIsGift}>
        This is a gift
      </Checkbox>
      {isGift && (
        <TextField
          label="Gift Message"
          value={message}
          onChange={setMessage}
          multiline={3}
        />
      )}
    </BlockStack>
  );
}
```

---

## 5. Webhook Configuration

In `shopify.app.toml`:

```toml
[webhooks]
api_version = "2026-01"

[[webhooks.subscriptions]]
topics = ["orders/create", "orders/updated"]
uri = "/webhooks/orders"

[[webhooks.subscriptions]]
topics = ["products/update"]
uri = "/webhooks/products"

# GDPR mandatory webhooks (required for app approval)
[webhooks.privacy_compliance]
customer_data_request_url = "/webhooks/gdpr/data-request"
customer_deletion_url = "/webhooks/gdpr/customer-deletion"
shop_deletion_url = "/webhooks/gdpr/shop-deletion"
```

### HMAC Verification

Always verify webhook HMAC signatures before processing:

```typescript
import crypto from "crypto";

function verifyShopifyWebhook(
  rawBody: string,
  hmacHeader: string,
  secret: string
): boolean {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(hmacHeader)
  );
}
```

---

## 6. App Billing

### Create a Recurring Charge

```graphql
mutation AppSubscriptionCreate(
  $name: String!,
  $lineItems: [AppSubscriptionLineItemInput!]!,
  $returnUrl: URL!
) {
  appSubscriptionCreate(
    name: $name,
    lineItems: $lineItems,
    returnUrl: $returnUrl
  ) {
    appSubscription {
      id
      status
    }
    confirmationUrl
    userErrors {
      field
      message
    }
  }
}
```

Variables:

```json
{
  "name": "Pro Plan",
  "lineItems": [
    {
      "plan": {
        "appRecurringPricingDetails": {
          "price": { "amount": 29.99, "currencyCode": "USD" },
          "interval": "EVERY_30_DAYS"
        }
      }
    }
  ],
  "returnUrl": "https://your-app.com/billing/callback"
}
```

### One-Time Charge

```graphql
mutation AppPurchaseOneTimeCreate(
  $name: String!,
  $price: MoneyInput!,
  $returnUrl: URL!
) {
  appPurchaseOneTimeCreate(
    name: $name,
    price: $price,
    returnUrl: $returnUrl
  ) {
    appPurchaseOneTime {
      id
      status
    }
    confirmationUrl
    userErrors {
      field
      message
    }
  }
}
```

---

## 7. OAuth Flow

For non-embedded apps or custom authentication:

1. Redirect merchant to Shopify authorization URL
2. Merchant approves scopes
3. Shopify redirects back with `code` parameter
4. Exchange `code` for permanent access token
5. Store token securely (encrypted at rest)

Validate the OAuth state parameter to prevent CSRF attacks.
Use session tokens for embedded apps instead of full OAuth.

---

## 8. Security Checklist

- Store API credentials in environment variables, never in code
- Always verify webhook HMAC signatures before processing
- Validate OAuth state parameter to prevent CSRF
- Request minimal access scopes
- Use session tokens for embedded apps
- Encrypt stored access tokens at rest

---

## 9. API Version Validation

Shopify releases API versions quarterly with a 12-month deprecation window.
Current version: **2026-01**.

When reviewing Shopify code:
- Check that `api_version` in `shopify.app.toml` is not deprecated
- Validate GraphQL queries against the current schema
- Check for deprecated fields in API responses

---

## 10. Utility Script

A GraphQL client utility is available at `~/.claude/scripts/shopify-graphql.py`
with pagination, rate limiting, and response parsing. Run:

```bash
python3 ~/.claude/scripts/shopify-graphql.py --help
```

---

## Related Skills

Works well with:
- `skills/web-interface-guidelines/SKILL.md` -- UI patterns for admin extensions
- `skills/stripe-integration/SKILL.md` -- When apps also integrate Stripe
