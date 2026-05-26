import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'kqm_employee_list',
      description: 'List employees. Read-only. Returns up to pageSize (max 100) results per page.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: { type: 'number', description: "Page number (1-based)" },
          pageSize: { type: 'number', description: "Results per page (max 100)" },
        },
      },
    },
    {
      name: 'kqm_employee_get',
      description: 'Get a single employee record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'Employee ID' } },
        required: ['id'],
      },
    },
    {
      name: 'kqm_warehouse_list',
      description: 'List warehouses. Read-only. Returns up to pageSize (max 100) results per page.',
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
      name: 'kqm_warehouse_get',
      description: 'Get a single warehouse record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'Warehouse ID' } },
        required: ['id'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'kqm_employee_list': {
      logger.info('API call: employees.list', args);
      const res = await client.employees.list({ page: args.page as number | undefined, pageSize: args.pageSize as number | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_employee_get': {
      const id = args.id as number;
      logger.info('API call: employees.get', { id });
      const res = await client.employees.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_warehouse_list': {
      logger.info('API call: warehouses.list', args);
      const res = await client.warehouses.list({ page: args.page as number | undefined, pageSize: args.pageSize as number | undefined, modifiedAfter: args.modifiedAfter as string | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_warehouse_get': {
      const id = args.id as number;
      logger.info('API call: warehouses.get', { id });
      const res = await client.warehouses.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const orgHandler: DomainHandler = { getTools, handleCall };
