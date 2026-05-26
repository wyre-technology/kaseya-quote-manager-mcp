import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

export async function elicitCredentials(server: Server): Promise<{ apiKey: string } | null> {
  try {
    const result = await (server as any).elicitInput({
      mode: 'form',
      message: 'A Kaseya Quote Manager API key is required. Generate one in Quote Manager under Settings → API.',
      requestedSchema: {
        type: 'object',
        properties: {
          api_key: {
            type: 'string',
            title: 'API Key',
            description: 'Your Kaseya Quote Manager API key (sent in the apiKey header)',
          },
        },
        required: ['api_key'],
      },
    });

    if (result?.action === 'accept' && result.content) {
      return { apiKey: result.content.api_key as string };
    }
  } catch {
    // Elicitation not supported by client
  }

  return null;
}
