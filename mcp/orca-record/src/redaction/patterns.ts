/**
 * Secret Regex Patterns
 *
 * 30+ high-value patterns for known secret formats.
 * Inspired by gitleaks and trufflehog patterns.
 */

import type { SecretPattern } from "../types.js";

export const SECRET_PATTERNS: SecretPattern[] = [
  // === AWS ===
  {
    name: "AWS Access Key ID",
    pattern: /AKIA[0-9A-Z]{16}/g,
    type: "aws_access_key",
  },
  {
    name: "AWS Secret Access Key",
    pattern: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY|SecretAccessKey)\s*[=:]\s*["']?([A-Za-z0-9/+=]{40})["']?/g,
    type: "aws_secret_key",
  },
  {
    name: "AWS MWS Key",
    pattern: /amzn\.mws\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
    type: "aws_mws_key",
  },

  // === GitHub ===
  {
    name: "GitHub Personal Access Token",
    pattern: /ghp_[A-Za-z0-9_]{36,}/g,
    type: "github_pat",
  },
  {
    name: "GitHub OAuth Access Token",
    pattern: /gho_[A-Za-z0-9_]{36,}/g,
    type: "github_oauth",
  },
  {
    name: "GitHub App Token",
    pattern: /ghs_[A-Za-z0-9_]{36,}/g,
    type: "github_app_token",
  },
  {
    name: "GitHub Fine-Grained PAT",
    pattern: /github_pat_[A-Za-z0-9_]{82,}/g,
    type: "github_fine_grained_pat",
  },

  // === Private Keys ===
  {
    name: "Private Key Header",
    pattern: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH|PGP)?\s*PRIVATE KEY-----/g,
    type: "private_key",
  },
  {
    name: "Private Key (Generic)",
    pattern: /-----BEGIN PRIVATE KEY-----/g,
    type: "private_key",
  },

  // === JWT ===
  {
    name: "JWT Token",
    pattern: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*/g,
    type: "jwt",
  },

  // === Google ===
  {
    name: "Google API Key",
    pattern: /AIza[0-9A-Za-z_-]{35}/g,
    type: "google_api_key",
  },
  {
    name: "Google OAuth Client Secret",
    pattern: /GOCSPX-[A-Za-z0-9_-]{28}/g,
    type: "google_oauth_secret",
  },

  // === Stripe ===
  {
    name: "Stripe Secret Key",
    pattern: /sk_live_[0-9a-zA-Z]{24,}/g,
    type: "stripe_secret",
  },
  {
    name: "Stripe Restricted Key",
    pattern: /rk_live_[0-9a-zA-Z]{24,}/g,
    type: "stripe_restricted",
  },
  {
    name: "Stripe Publishable Key",
    pattern: /pk_live_[0-9a-zA-Z]{24,}/g,
    type: "stripe_publishable",
  },

  // === Slack ===
  {
    name: "Slack Bot Token",
    pattern: /xoxb-[0-9]{10,}-[0-9]{10,}-[a-zA-Z0-9]{24,}/g,
    type: "slack_bot_token",
  },
  {
    name: "Slack User Token",
    pattern: /xoxp-[0-9]{10,}-[0-9]{10,}-[0-9]{10,}-[a-f0-9]{32}/g,
    type: "slack_user_token",
  },
  {
    name: "Slack Webhook URL",
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/g,
    type: "slack_webhook",
  },

  // === NPM ===
  {
    name: "NPM Access Token",
    pattern: /npm_[A-Za-z0-9]{36,}/g,
    type: "npm_token",
  },

  // === Heroku ===
  {
    name: "Heroku API Key",
    pattern: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
    type: "heroku_api_key",
  },

  // === Twilio ===
  {
    name: "Twilio API Key",
    pattern: /SK[0-9a-fA-F]{32}/g,
    type: "twilio_api_key",
  },

  // === SendGrid ===
  {
    name: "SendGrid API Key",
    pattern: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g,
    type: "sendgrid_api_key",
  },

  // === Shopify ===
  {
    name: "Shopify Access Token",
    pattern: /shpat_[a-fA-F0-9]{32}/g,
    type: "shopify_access_token",
  },
  {
    name: "Shopify Custom App Token",
    pattern: /shpca_[a-fA-F0-9]{32}/g,
    type: "shopify_custom_app_token",
  },
  {
    name: "Shopify Private App Token",
    pattern: /shppa_[a-fA-F0-9]{32}/g,
    type: "shopify_private_app_token",
  },

  // === Database URLs ===
  {
    name: "Database Connection String",
    pattern: /(?:mysql|postgres|postgresql|mongodb|redis|amqp):\/\/[^\s"']+:[^\s"']+@[^\s"']+/g,
    type: "database_url",
  },

  // === Generic Secrets ===
  {
    name: "Generic API Key Assignment",
    pattern: /(?:api[_-]?key|apikey|api[_-]?secret|api[_-]?token)\s*[=:]\s*["']([a-zA-Z0-9_-]{20,})["']/gi,
    type: "generic_api_key",
  },
  {
    name: "Password Assignment",
    pattern: /(?:password|passwd|pwd)\s*[=:]\s*["']([^\s"']{8,})["']/gi,
    type: "password",
  },
  {
    name: "Secret Assignment",
    pattern: /(?:secret|token|auth)\s*[=:]\s*["']([a-zA-Z0-9_/+=.-]{20,})["']/gi,
    type: "generic_secret",
  },
  {
    name: "Bearer Token",
    pattern: /Bearer\s+[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+/g,
    type: "bearer_token",
  },

  // === Cloud Providers ===
  {
    name: "Azure Client Secret",
    pattern: /[a-zA-Z0-9~_.-]{34}(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/g,
    type: "azure_client_secret",
  },
  {
    name: "DigitalOcean Token",
    pattern: /dop_v1_[a-f0-9]{64}/g,
    type: "digitalocean_token",
  },
  {
    name: "Vercel Token",
    pattern: /vercel_[A-Za-z0-9_-]{24,}/g,
    type: "vercel_token",
  },

  // === SSH ===
  {
    name: "SSH Private Key Content",
    pattern: /-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]*?-----END OPENSSH PRIVATE KEY-----/g,
    type: "ssh_private_key",
  },

  // === Anthropic ===
  {
    name: "Anthropic API Key",
    pattern: /sk-ant-[A-Za-z0-9_-]{40,}/g,
    type: "anthropic_api_key",
  },

  // === OpenAI ===
  {
    name: "OpenAI API Key",
    pattern: /sk-[A-Za-z0-9]{48,}/g,
    type: "openai_api_key",
  },
];
