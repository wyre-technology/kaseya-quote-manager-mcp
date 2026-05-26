import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'kqm_product_list',
      description: 'List products. Read-only. Returns up to pageSize (max 100) results per page.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: {
          manufacturerPartNumber: { type: 'string', description: "Filter by manufacturerPartNumber" },
          page: { type: 'number', description: "Page number (1-based)" },
          pageSize: { type: 'number', description: "Results per page (max 100)" },
          modifiedAfter: { type: 'string', description: "ISO 8601 timestamp; return only records modified after this time" },
        },
      },
    },
    {
      name: 'kqm_product_get',
      description: 'Get a single product record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'Product ID' } },
        required: ['id'],
      },
    },
    {
      name: 'kqm_product_image_list',
      description: 'List product images. Read-only. Returns up to pageSize (max 100) results per page.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: {
          productID: { type: 'number', description: "Filter by productID" },
          page: { type: 'number', description: "Page number (1-based)" },
          pageSize: { type: 'number', description: "Results per page (max 100)" },
        },
      },
    },
    {
      name: 'kqm_category_list',
      description: 'List product categories. Read-only. Returns up to pageSize (max 100) results per page.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: { type: 'object' as const, properties: {} },
    },
    {
      name: 'kqm_category_get',
      description: 'Get a single product categorie record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'Category ID' } },
        required: ['id'],
      },
    },
    {
      name: 'kqm_brand_list',
      description: 'List brands. Read-only. Returns up to pageSize (max 100) results per page.',
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
      name: 'kqm_brand_get',
      description: 'Get a single brand record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'Brand ID' } },
        required: ['id'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'kqm_product_list': {
      logger.info('API call: products.list', args);
      const res = await client.products.list({ manufacturerPartNumber: args.manufacturerPartNumber as string | undefined, page: args.page as number | undefined, pageSize: args.pageSize as number | undefined, modifiedAfter: args.modifiedAfter as string | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_product_get': {
      const id = args.id as number;
      logger.info('API call: products.get', { id });
      const res = await client.products.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_product_image_list': {
      logger.info('API call: productImages.list', args);
      const res = await client.productImages.list({ productID: args.productID as number | undefined, page: args.page as number | undefined, pageSize: args.pageSize as number | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_category_list': {
      logger.info('API call: categories.list', args);
      const res = await client.categories.list();
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_category_get': {
      const id = args.id as number;
      logger.info('API call: categories.get', { id });
      const res = await client.categories.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_brand_list': {
      logger.info('API call: brands.list', args);
      const res = await client.brands.list({ page: args.page as number | undefined, pageSize: args.pageSize as number | undefined, modifiedAfter: args.modifiedAfter as string | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_brand_get': {
      const id = args.id as number;
      logger.info('API call: brands.get', { id });
      const res = await client.brands.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const catalogHandler: DomainHandler = { getTools, handleCall };
