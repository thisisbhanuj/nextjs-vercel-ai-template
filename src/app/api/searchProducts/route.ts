import { ToolInvocation, convertToCoreMessages, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

async function searchProducts(query: string) {
  const response = await fetch('http://localhost:3000/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  return response.json();
}

export async function POST(req: Request) {
  const { dataModel }: { dataModel: Message[] } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant for an e-commerce store.',
    messages: convertToCoreMessages(dataModel),
    tools: {
      searchProducts: {
        description: 'Search for products in the store',
        parameters: z.object({
          description: z.string().optional().describe('The description of the product'),
          color: z.string().optional().describe('The color of the product'),
          size: z.string().optional().describe('The size of the product'),
        }),
        execute: async ({description, color, size}) => {
          const products: any[] = await searchProducts(`description:${description} color:${color} size:${size}`);

          if (products.length === 0) {
            return 'No products found. Please refine your query with more specific details.';
          }

          return products.map(product => `Product: ${product.name}, Color: ${product.color}, Size: ${product.size}`).join('\n');
        },
      },
    },
  });

  return result.toTextStreamResponse();
}
