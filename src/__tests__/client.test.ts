import { describe, it, expect, afterEach } from 'vitest';
import { getCredentials, getClient, runWithCredentials } from '../utils/client.js';

describe('getCredentials', () => {
  const originalEnv = process.env.KASEYA_QUOTE_MANAGER_API_KEY;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.KASEYA_QUOTE_MANAGER_API_KEY;
    } else {
      process.env.KASEYA_QUOTE_MANAGER_API_KEY = originalEnv;
    }
  });

  it('returns null when env var is unset', () => {
    delete process.env.KASEYA_QUOTE_MANAGER_API_KEY;
    expect(getCredentials()).toBeNull();
  });

  it('returns credentials from env var in standalone mode', () => {
    process.env.KASEYA_QUOTE_MANAGER_API_KEY = 'env-key';
    expect(getCredentials()).toEqual({ apiKey: 'env-key' });
  });

  it('ALS scoped credentials take precedence over env var', () => {
    process.env.KASEYA_QUOTE_MANAGER_API_KEY = 'env-key';
    let creds: ReturnType<typeof getCredentials> = null;
    runWithCredentials({ apiKey: 'scoped-key' }, () => {
      creds = getCredentials();
    });
    expect(creds).toEqual({ apiKey: 'scoped-key' });
  });

  it('ALS credentials do not leak out of the run context', () => {
    delete process.env.KASEYA_QUOTE_MANAGER_API_KEY;
    runWithCredentials({ apiKey: 'scoped-key' }, () => {
      expect(getCredentials()).toEqual({ apiKey: 'scoped-key' });
    });
    // outside the context — must fall back to env (here: null)
    expect(getCredentials()).toBeNull();
  });

  it('concurrent ALS contexts do not contaminate each other', async () => {
    delete process.env.KASEYA_QUOTE_MANAGER_API_KEY;
    const results: Array<{ apiKey: string } | null> = [];

    await Promise.all([
      new Promise<void>(resolve =>
        runWithCredentials({ apiKey: 'tenant-A' }, () => {
          setTimeout(() => {
            results[0] = getCredentials();
            resolve();
          }, 5);
        })
      ),
      new Promise<void>(resolve =>
        runWithCredentials({ apiKey: 'tenant-B' }, () => {
          setTimeout(() => {
            results[1] = getCredentials();
            resolve();
          }, 5);
        })
      ),
    ]);

    expect(results[0]).toEqual({ apiKey: 'tenant-A' });
    expect(results[1]).toEqual({ apiKey: 'tenant-B' });
  });
});

describe('getClient', () => {
  afterEach(() => {
    delete process.env.KASEYA_QUOTE_MANAGER_API_KEY;
  });

  it('rejects when no credentials are available', async () => {
    delete process.env.KASEYA_QUOTE_MANAGER_API_KEY;
    await expect(getClient()).rejects.toThrow('No Kaseya Quote Manager API credentials configured');
  });

  it('returns a client when env var is set', async () => {
    process.env.KASEYA_QUOTE_MANAGER_API_KEY = 'env-key';
    expect(await getClient()).toBeTruthy();
  });

  it('returns a fresh client per call (no singleton)', async () => {
    process.env.KASEYA_QUOTE_MANAGER_API_KEY = 'env-key';
    const a = await getClient();
    const b = await getClient();
    expect(a).not.toBe(b);
  });

  it('builds the client from scoped credentials when inside runWithCredentials', async () => {
    delete process.env.KASEYA_QUOTE_MANAGER_API_KEY;
    let client: unknown;
    await new Promise<void>(resolve =>
      runWithCredentials({ apiKey: 'scoped-key' }, async () => {
        client = await getClient();
        resolve();
      })
    );
    expect(client).toBeTruthy();
  });
});
