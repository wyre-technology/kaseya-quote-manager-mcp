import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainName } from '../utils/types.js';

export const DOMAINS: DomainName[] = ["sales", "procurement", "catalog", "crm", "org"];

export function getNavigationTools(): Tool[] {
  return [
    {
      name: 'kqm_navigate',
      description: `Discover available Kaseya Quote Manager tools by domain. All tools are callable at any time — this is a help/discovery aid, not a prerequisite.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          domain: {
            type: 'string',
            enum: ["sales", "procurement", "catalog", "crm", "org"],
            description: `The domain to explore:
- sales: quotes, quote sections/lines, sales orders, order lines, and payments
- procurement: purchase orders, order lines, costs, suppliers, and product-supplier links
- catalog: products, product images, categories, and brands
- crm: customers, customer addresses, and contacts
- org: employees and warehouses
`,
          },
        },
        required: ['domain'],
      },
    },
    {
      name: 'kqm_status',
      description: 'Check Kaseya Quote Manager API connection status and available domains.',
      inputSchema: { type: 'object' as const, properties: {} },
    },
  ];
}
