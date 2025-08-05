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
      prompt: `A high-resolution digital photograph showcases fresh ${productName} placed neatly on a clean white studio background. The product appears vibrant, clean, and natural, with realistic surface texture and true-to-life colors. Soft diffused lighting highlights the freshness and shape, with minimal shadows and a shallow depth of field to keep the focus sharp on the product while softly blurring the background. Ideal for an e-commerce marketplace listing for vegetables or dairy products.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    if (!media?.url) {
        throw new Error('Image generation failed');
    }

    return media.url;
  }
);
