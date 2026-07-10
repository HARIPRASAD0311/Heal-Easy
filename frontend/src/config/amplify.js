/**
 * amplify.js — AWS Amplify v6 configuration for HealEasy.
 *
 * Reads ALL AWS values from Vite environment variables.
 * Nothing is hardcoded here.
 *
 * Required env vars (add to .env):
 *   VITE_AWS_REGION
 *   VITE_COGNITO_USER_POOL_ID
 *   VITE_COGNITO_APP_CLIENT_ID
 *
 * Optional env vars:
 *   VITE_COGNITO_IDENTITY_POOL_ID   — only if you use AWS credentials (S3, etc.)
 *   VITE_COGNITO_DOMAIN             — only if you use Hosted UI / OAuth
 *   VITE_COGNITO_REDIRECT_SIGN_IN   — only if you use Hosted UI
 *   VITE_COGNITO_REDIRECT_SIGN_OUT  — only if you use Hosted UI
 *
 * Import this file once at the app entry point (main.jsx) — calling
 * configureAmplify() before rendering React ensures auth state is
 * available everywhere without a Provider wrapper.
 */

import { Amplify } from "aws-amplify";

// ─────────────────────────────────────────────────────────────────
// READ FROM ENVIRONMENT
// ─────────────────────────────────────────────────────────────────

const region         = import.meta.env.VITE_AWS_REGION;
const userPoolId     = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const userPoolClientId = import.meta.env.VITE_COGNITO_APP_CLIENT_ID;
const identityPoolId = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID; // optional
const domain         = import.meta.env.VITE_COGNITO_DOMAIN;           // optional
const redirectSignIn = import.meta.env.VITE_COGNITO_REDIRECT_SIGN_IN; // optional
const redirectSignOut= import.meta.env.VITE_COGNITO_REDIRECT_SIGN_OUT;// optional

// ─────────────────────────────────────────────────────────────────
// VALIDATE REQUIRED VARS AT STARTUP
// ─────────────────────────────────────────────────────────────────

const missing = [
  !region          && "VITE_AWS_REGION",
  !userPoolId      && "VITE_COGNITO_USER_POOL_ID",
  !userPoolClientId && "VITE_COGNITO_APP_CLIENT_ID",
].filter(Boolean);

if (missing.length > 0) {
  // Warn loudly in development; in production the app will still load
  // but auth calls will fail — makes misconfiguration obvious during CI.
  console.error(
    `[HealEasy] Missing required Amplify environment variable(s): ${missing.join(", ")}.\n` +
    "Copy .env.example to .env and fill in the Cognito values."
  );
}

// ─────────────────────────────────────────────────────────────────
// BUILD AMPLIFY v6 RESOURCE CONFIG
// ─────────────────────────────────────────────────────────────────

/** @type {import('aws-amplify').ResourcesConfig} */
const amplifyConfig = {
  Auth: {
    Cognito: {
      // ── Required ──────────────────────────────────────────────
      region,
      userPoolId,
      userPoolClientId,

      // ── Identity Pool (optional — needed for S3 uploads, etc.) ─
      ...(identityPoolId ? { identityPoolId } : {}),

      // ── Login mechanisms ──────────────────────────────────────
      // Adjust to match what you enabled in the Cognito User Pool console.
      loginWith: {
        email: true,
        phone: true,   // set false if phone auth is not enabled in your pool

        // Hosted UI / OAuth — only included when VITE_COGNITO_DOMAIN is set
        ...(domain && redirectSignIn && redirectSignOut
          ? {
              oauth: {
                domain,
                scopes: ["email", "openid", "profile", "aws.cognito.signin.user.admin"],
                redirectSignIn:  redirectSignIn.split(","),
                redirectSignOut: redirectSignOut.split(","),
                responseType: "code",
              },
            }
          : {}),
      },

      // ── Token storage ─────────────────────────────────────────
      // "localStorage"  → tokens persist across browser sessions (default)
      // "sessionStorage"→ tokens cleared when the tab closes
      // "cookies"       → tokens stored as HTTP cookies
      userPoolTokenStorage: "localStorage",

      // ── Sign-up attributes ────────────────────────────────────
      // List the attributes your User Pool requires at sign-up.
      signUpVerificationMethod: "code", // "code" | "link"
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// CONFIGURE & EXPORT
// ─────────────────────────────────────────────────────────────────

/**
 * Call this once at application startup (before ReactDOM.render).
 * Safe to call multiple times — Amplify ignores duplicate calls.
 */
export function configureAmplify() {
  Amplify.configure(amplifyConfig);
}

// Export the raw config object so individual services can reference
// specific values (e.g. region) without importing Amplify directly.
export { amplifyConfig };

// Default export for convenience: import configureAmplify from "@/config/amplify"
export default configureAmplify;
