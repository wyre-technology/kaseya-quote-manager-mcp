import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'kqm_customer_list',
      description: 'List customers. Read-only. Returns up to pageSize (max 100) results per page.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: { type: 'number', description: "Page number (1-based)" },
          pageSize: { type: 'number', description: "Results per page (max 100)" },
          modifiedAfter: { type: 'string', description: "ISO 8601 timestamp; return only records modified after this time" },
        },
      },
    },
    {
      name: 'kqm_customer_get',
      description: 'Get a single customer record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'Customer ID' } },
        required: ['id'],
      },
    },
    {
      name: 'kqm_customer_address_list',
      description: 'List customer addresses. Read-only. Returns up to pageSize (max 100) results per page.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: {
          customerID: { type: 'number', description: "Filter by customerID" },
          page: { type: 'number', description: "Page number (1-based)" },
          pageSize: { type: 'number', description: "Results per page (max 100)" },
          modifiedAfter: { type: 'string', description: "ISO 8601 timestamp; return only records modified after this time" },
        },
      },
    },
    {
      name: 'kqm_customer_address_get',
      description: 'Get a single customer addresse record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'CustomerAddress ID' } },
        required: ['id'],
      },
    },
    {
      name: 'kqm_contact_list',
      description: 'List contacts. Read-only. Returns up to pageSize (max 100) results per page.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: {
          customerID: { type: 'number', description: "Filter by customerID" },
          page: { type: 'number', description: "Page number (1-based)" },
          pageSize: { type: 'number', description: "Results per page (max 100)" },
          modifiedAfter: { type: 'string', description: "ISO 8601 timestamp; return only records modified after this time" },
        },
      },
    },
    {
      name: 'kqm_contact_get',
      description: 'Get a single contact record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'Contact ID' } },
        required: ['id'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'kqm_customer_list': {
      logger.info('API call: customers.list', args);
      const res = await client.customers.list({ page: args.page as number | undefined, pageSize: args.pageSize as number | undefined, modifiedAfter: args.modifiedAfter as string | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_customer_get': {
      const id = args.id as number;
      logger.info('API call: customers.get', { id });
      const res = await client.customers.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_customer_address_list': {
      logger.info('API call: customerAddress.list', args);
      const res = await client.customerAddress.list({ customerID: args.customerID as number | undefined, page: args.page as number | undefined, pageSize: args.pageSize as number | undefined, modifiedAfter: args.modifiedAfter as string | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_customer_address_get': {
      const id = args.id as number;
      logger.info('API call: customerAddress.get', { id });
      const res = await client.customerAddress.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_contact_list': {
      logger.info('API call: contacts.list', args);
      const res = await client.contacts.list({ customerID: args.customerID as number | undefined, page: args.page as number | undefined, pageSize: args.pageSize as number | undefined, modifiedAfter: args.modifiedAfter as string | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_contact_get': {
      const id = args.id as number;
      logger.info('API call: contacts.get', { id });
      const res = await client.contacts.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const crmHandler: DomainHandler = { getTools, handleCall };
