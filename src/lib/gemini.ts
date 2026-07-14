/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { mockProducts } from '../db/mockData';

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

/**
 * Uses Gemini AI to understand natural language search queries and map them to our streetwear products.
 */
export async function getSmartSearchAI(query: string): Promise<{ productIds: string[]; reason: string; styleTip: string }> {
  const client = getGeminiClient();
  const serializedProducts = mockProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
    features: p.features,
    price: p.price,
  }));

  if (!client) {
    // Elegant hardcoded keyword matching fallback if Gemini API key is not present/configured yet
    const queryLower = query.toLowerCase();
    let productIds: string[] = [];
    let reason = "Using local search heuristics. Configure GEMINI_API_KEY in Secrets for genuine neural stylist matching.";
    let styleTip = "Layer heavyweight garments to establish proper proportions.";

    if (queryLower.includes('hoodie') || queryLower.includes('heavy') || queryLower.includes('warm') || queryLower.includes('winter') || queryLower.includes('baggy')) {
      productIds.push('sjyro-h01');
    }
    if (queryLower.includes('shirt') || queryLower.includes('tee') || queryLower.includes('tshirt') || queryLower.includes('white') || queryLower.includes('summer')) {
      productIds.push('sjyro-t01');
    }
    if (queryLower.includes('denim') || queryLower.includes('blue') || queryLower.includes('distressed')) {
      productIds.push('sjyro-s01');
    }
    if (queryLower.includes('graphic') || queryLower.includes('print') || queryLower.includes('limited') || queryLower.includes('cypher')) {
      productIds.push('sjyro-l01');
    }
    if (queryLower.includes('cargo') || queryLower.includes('sage') || queryLower.includes('utility')) {
      productIds.push('sjyro-c01');
    }

    if (productIds.length === 0) {
      // return default recommended products
      productIds = ['sjyro-h01', 'sjyro-t01'];
    }

    return { productIds, reason, styleTip };
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are the Virtual Stylist & Creative Director for SJYRO®, an ultra-luxury premium streetwear brand.
Analyze the user's natural language request: "${query}"
We have the following catalog: ${JSON.stringify(serializedProducts)}

Determine which products (1 to 3 items) best match their style, occasion, feeling, or functional need.
Return your response strictly in the following JSON format:
{
  "productIds": ["sjyro-h01", "sjyro-t01"],
  "reason": "Explanatory statement about why these specific items are selected for the style requested.",
  "styleTip": "Professional editorial styling advice on how to wear these pieces (e.g. 'Match the Arch-I hoodie with cropped raw denim and boxy leather boots for an elevated drape.')"
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of matching product ID strings from the catalog"
            },
            reason: { type: Type.STRING },
            styleTip: { type: Type.STRING }
          },
          required: ["productIds", "reason", "styleTip"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error) {
    console.warn("Gemini Smart Search API is currently unavailable (e.g. quota limit reached). Using local fallback stylist logic.");
  }

  return {
    productIds: ['sjyro-h01', 'sjyro-t01'],
    reason: "Fallback neural stylist matching. Cozy essentials mapped.",
    styleTip: "Wear oversized shirts unbuttoned over high-density rib mock tees."
  };
}

/**
 * Recommends products to "Complete the Look" based on items in the shopping cart.
 */
export async function getCompleteTheLookAI(cartItemIds: string[]): Promise<string[]> {
  const client = getGeminiClient();
  if (!client) {
    // Local fallback: recommend items that are not in the current cart
    const itemsNotInCart = mockProducts
      .filter(p => !cartItemIds.includes(p.id))
      .map(p => p.id);
    return itemsNotInCart.slice(0, 2);
  }

  try {
    const cartProducts = mockProducts.filter(p => cartItemIds.includes(p.id)).map(p => p.name);
    const catalogBrief = mockProducts.map(p => ({ id: p.id, name: p.name, category: p.category }));

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are an editorial stylist for luxury e-commerce SJYRO.
The user currently has these items in their cart: ${JSON.stringify(cartProducts)}.
Suggest 1 or 2 complementary items from our catalog to 'Complete the Look'.
Available catalog: ${JSON.stringify(catalogBrief)}.
Avoid suggesting items that are already in the cart.
Return strictly a JSON array of product IDs, like this: ["sjyro-t01", "sjyro-c01"]`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error) {
    console.warn("Gemini Complete the Look API is currently unavailable (e.g. quota limit reached). Using local fallback stylist logic.");
  }

  return mockProducts.filter(p => !cartItemIds.includes(p.id)).slice(0, 2).map(p => p.id);
}
