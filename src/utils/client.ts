import { AsyncLocalStorage } from 'node:async_hooks';
import { KaseyaQuoteManagerClient } from '@wyre-technology/node-kaseya-quote-manager';
import { logger } from './logger.js';

export interface Credentials {
  apiKey: string;
}

// Request-scoped credential store. In gateway mode the HTTP layer runs each
// request inside runWithCredentials({apiKey}); getCredentials() reads it.
// Falls back to process.env for stdio / single-tenant mode.
//
// SECURITY-CRITICAL: credentials must NEVER be stashed in module-level mutable
// state (process.env or a cached client singleton). Under concurrent
// multi-tenant requests the event loop interleaves across await points, so a
// shared slot lets one tenant's key be read by another tenant's tool call. The
// ALS context is the only per-request credential carrier; do not reintroduce a
// process.env write or a global client cache.
const credStore = new AsyncLocalStorage<Credentials>();

export function runWithCredentials<T>(creds: Credentials, fn: () => T): T {
  return credStore.run(creds, fn);
}

export function getCredentials(): Credentials | null {
  const scoped = credStore.getStore();
  if (scoped?.apiKey) return scoped;

  const apiKey = process.env.KASEYA_QUOTE_MANAGER_API_KEY;
  if (!apiKey) {
    logger.warn('Missing credentials', { hasApiKey: false });
    return null;
  }
  return { apiKey };
}

export async function getClient(): Promise<KaseyaQuoteManagerClient> {
  const creds = getCredentials();
  if (!creds) {
    throw new Error('No Kaseya Quote Manager API credentials configured. Set KASEYA_QUOTE_MANAGER_API_KEY.');
  }

  // Build fresh from the (request-scoped) credentials on every call. A cached
  // singleton keyed by the key still races: two concurrent tenants each rebuild
  // and clobber the shared slot. Client construction is cheap (config only, no
  // connection), so per-call construction is the safe choice.
  return new KaseyaQuoteManagerClient(creds);
}
