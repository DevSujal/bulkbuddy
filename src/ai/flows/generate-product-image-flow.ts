'use server';
/**
 * @fileOverview An AI flow to generate product images.
 *
 * - generateProductImage - A function that generates an image for a product.
 * - GenerateProductImageInput - The input type for the generateProductImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductImageInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
});
export type GenerateProductImageInput = z.infer<typeof GenerateProductImageInputSchema>;


export async function generateProductImage(input: GenerateProductImageInput): Promise<string> {
  return generateProductImageFlow(input);
}

const generateProductImageFlow = ai.defineFlow(
  {
    name: 'generateProductImageFlow',
    inputSchema: GenerateProductImageInputSchema,
    outputSchema: z.string(),
  },
  async ({productName}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `a high quality, photorealistic image of ${productName}, on a clean white background`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    if (!media.url) {
        throw new Error('Image generation failed');
    }

    return media.url;
  }
);
