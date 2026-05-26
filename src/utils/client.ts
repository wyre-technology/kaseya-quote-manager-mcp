import { KaseyaQuoteManagerClient } from '@wyre-technology/node-kaseya-quote-manager';
import { logger } from './logger.js';

let _client: KaseyaQuoteManagerClient | null = null;
let _credKey: string | null = null;

interface Credentials {
  apiKey: string;
}

export function getCredentials(): Credentials | null {
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

  // Invalidate the cached client if the gateway injected a different key.
  if (_client && _credKey !== creds.apiKey) {
    _client = null;
  }

  if (!_client) {
    _client = new KaseyaQuoteManagerClient(creds);
    _credKey = creds.apiKey;
    logger.info('Created Kaseya Quote Manager API client');
  }
  return _client;
}

export function resetClient(): void {
  _client = null;
  _credKey = null;
}
