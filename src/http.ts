import { createServer as createHttpServer } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';
import { getCredentials, runWithCredentials } from './utils/client.js';
import { logger } from './utils/logger.js';

function startHttpServer(): void {
  const port = parseInt(process.env.MCP_HTTP_PORT || '8080', 10);
  const host = process.env.MCP_HTTP_HOST || '0.0.0.0';
  const isGatewayMode = process.env.AUTH_MODE === 'gateway';

  const httpServer = createHttpServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/health') {
      // /health is container LIVENESS, not credential-readiness. In gateway
      // mode, credentials arrive per-request via X-Kaseya-Quote-Manager-*
      // headers, not at startup — so checking `getCredentials()` here would
      // always 503 the container and the WYRE vendor-monitor would false-red
      // this vendor permanently. Liveness is "the server is accepting
      // traffic"; the credentials state is reported as informational only.
      // Standalone (non-gateway) mode also returns 200 — if the operator
      // ran the server with no creds, that's their config problem and the
      // first tool call will surface it clearly; conflating that with
      // liveness causes more harm than the 503 prevents.
      const creds = getCredentials();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        transport: 'http',
        mode: isGatewayMode ? 'gateway' : 'standalone',
        credentials: { configured: !!creds },
        timestamp: new Date().toISOString(),
      }));
      return;
    }

    if (url.pathname !== '/mcp') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found', endpoints: ['/mcp', '/health'] }));
      return;
    }

    // Gateway mode injects per-request tenant credentials via headers. Read them
    // into a request-local variable — NEVER back into process.env — so
    // concurrent tenants can't clobber a shared slot across await points.
    // Don't reject when absent: tools/list works without credentials; only
    // tools/call requires them.
    const apiKey = isGatewayMode
      ? (req.headers['x-kaseya-quote-manager-api-key'] as string | undefined)
      : undefined;

    const handle = async () => {
      // SECURITY-CRITICAL: this transport MUST stay stateless (sessionIdGenerator:
      // undefined + enableJsonResponse: true). Per-request tenant credentials are
      // carried in the AsyncLocalStorage context opened by runWithCredentials()
      // below, and a stateless request->single-response flow keeps the tool call
      // inside that context. A stateful/SSE transport (persistent stream) would let
      // a long-lived connection serve later messages under a stale/foreign
      // credential context — re-review tenant isolation before changing this.
      const server = createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      res.on('close', () => {
        transport.close();
        server.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res);
    };

    // Scope gateway credentials to this request with AsyncLocalStorage so
    // concurrent tenants never share a credential slot. In stdio/standalone
    // mode (or a tools/list probe with no header) fall through to process.env.
    if (apiKey) {
      await runWithCredentials({ apiKey }, handle);
    } else {
      await handle();
    }
  });

  httpServer.listen(port, host, () => {
    logger.info(`HTTP streaming server listening on ${host}:${port}`);
  });
}

const transport = process.env.MCP_TRANSPORT;
if (transport === 'http') {
  startHttpServer();
} else {
  import('./index.js');
}
