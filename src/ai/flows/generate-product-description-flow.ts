'use server';
/**
 * @fileOverview An AI flow to generate product descriptions.
 *
 * - generateProductDescription - A function that generates a description for a product.
 * - GenerateProductDescriptionInput - The input type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;


export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<string> {
  return generateProductDescriptionFlow(input);
}

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: z.string(),
  },
  async ({productName}) => {
    const {text} = await ai.generate({
      prompt: `Generate a catchy, one-sentence marketing description for the following product: ${productName}. The description should be suitable for a wholesale marketplace.`,
    });
    
    return text;
  }
);
