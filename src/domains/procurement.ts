import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'kqm_purchase_order_list',
      description: 'List purchase orders. Read-only. Returns up to pageSize (max 100) results per page.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: {
          orderNumber: { type: 'string', description: "Filter by orderNumber" },
          page: { type: 'number', description: "Page number (1-based)" },
          pageSize: { type: 'number', description: "Results per page (max 100)" },
          modifiedAfter: { type: 'string', description: "ISO 8601 timestamp; return only records modified after this time" },
        },
      },
    },
    {
      name: 'kqm_purchase_order_get',
      description: 'Get a single purchase order record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'PurchaseOrder ID' } },
        required: ['id'],
      },
    },
    {
      name: 'kqm_purchase_order_line_list',
      description: 'List purchase order line items. Read-only. Returns up to pageSize (max 100) results per page.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: {
          purchaseOrderID: { type: 'number', description: "Filter by purchaseOrderID" },
          page: { type: 'number', description: "Page number (1-based)" },
          pageSize: { type: 'number', description: "Results per page (max 100)" },
          modifiedAfter: { type: 'string', description: "ISO 8601 timestamp; return only records modified after this time" },
        },
      },
    },
    {
      name: 'kqm_purchase_order_line_get',
      description: 'Get a single purchase order line item record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'PurchaseOrderLine ID' } },
        required: ['id'],
      },
    },
    {
      name: 'kqm_purchase_order_cost_list',
      description: 'List purchase order costs. Read-only. Returns up to pageSize (max 100) results per page.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: {
          purchaseOrderID: { type: 'number', description: "Filter by purchaseOrderID" },
          page: { type: 'number', description: "Page number (1-based)" },
          pageSize: { type: 'number', description: "Results per page (max 100)" },
          modifiedAfter: { type: 'string', description: "ISO 8601 timestamp; return only records modified after this time" },
        },
      },
    },
    {
      name: 'kqm_purchase_order_cost_get',
      description: 'Get a single purchase order cost record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'PurchaseOrderCost ID' } },
        required: ['id'],
      },
    },
    {
      name: 'kqm_supplier_list',
      description: 'List suppliers. Read-only. Returns up to pageSize (max 100) results per page.',
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
      name: 'kqm_supplier_get',
      description: 'Get a single supplier record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'Supplier ID' } },
        required: ['id'],
      },
    },
    {
      name: 'kqm_product_supplier_list',
      description: 'List product-supplier links. Read-only. Returns up to pageSize (max 100) results per page.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: {
          productID: { type: 'number', description: "Filter by productID" },
          page: { type: 'number', description: "Page number (1-based)" },
          pageSize: { type: 'number', description: "Results per page (max 100)" },
          modifiedAfter: { type: 'string', description: "ISO 8601 timestamp; return only records modified after this time" },
        },
      },
    },
    {
      name: 'kqm_product_supplier_get',
      description: 'Get a single product-supplier link record by ID. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'ProductSupplier ID' } },
        required: ['id'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'kqm_purchase_order_list': {
      logger.info('API call: purchaseOrders.list', args);
      const res = await client.purchaseOrders.list({ orderNumber: args.orderNumber as string | undefined, page: args.page as number | undefined, pageSize: args.pageSize as number | undefined, modifiedAfter: args.modifiedAfter as string | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_purchase_order_get': {
      const id = args.id as number;
      logger.info('API call: purchaseOrders.get', { id });
      const res = await client.purchaseOrders.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_purchase_order_line_list': {
      logger.info('API call: purchaseOrderLines.list', args);
      const res = await client.purchaseOrderLines.list({ purchaseOrderID: args.purchaseOrderID as number | undefined, page: args.page as number | undefined, pageSize: args.pageSize as number | undefined, modifiedAfter: args.modifiedAfter as string | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_purchase_order_line_get': {
      const id = args.id as number;
      logger.info('API call: purchaseOrderLines.get', { id });
      const res = await client.purchaseOrderLines.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_purchase_order_cost_list': {
      logger.info('API call: purchaseOrderCosts.list', args);
      const res = await client.purchaseOrderCosts.list({ purchaseOrderID: args.purchaseOrderID as number | undefined, page: args.page as number | undefined, pageSize: args.pageSize as number | undefined, modifiedAfter: args.modifiedAfter as string | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_purchase_order_cost_get': {
      const id = args.id as number;
      logger.info('API call: purchaseOrderCosts.get', { id });
      const res = await client.purchaseOrderCosts.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_supplier_list': {
      logger.info('API call: suppliers.list', args);
      const res = await client.suppliers.list({ page: args.page as number | undefined, pageSize: args.pageSize as number | undefined, modifiedAfter: args.modifiedAfter as string | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_supplier_get': {
      const id = args.id as number;
      logger.info('API call: suppliers.get', { id });
      const res = await client.suppliers.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_product_supplier_list': {
      logger.info('API call: productSuppliers.list', args);
      const res = await client.productSuppliers.list({ productID: args.productID as number | undefined, page: args.page as number | undefined, pageSize: args.pageSize as number | undefined, modifiedAfter: args.modifiedAfter as string | undefined });
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    case 'kqm_product_supplier_get': {
      const id = args.id as number;
      logger.info('API call: productSuppliers.get', { id });
      const res = await client.productSuppliers.get(id);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const procurementHandler: DomainHandler = { getTools, handleCall };
