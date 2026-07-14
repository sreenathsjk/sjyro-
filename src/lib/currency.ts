/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const EXCHANGE_RATE = 85;
export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

/**
 * Formats a USD price as Indian Rupee (INR) with the ₹ symbol.
 */
export function formatPrice(usdPrice: number): string {
  const inrPrice = Math.round(usdPrice * EXCHANGE_RATE);
  return `${CURRENCY_SYMBOL}${inrPrice.toLocaleString('en-IN')}`;
}

/**
 * Formats a USD price as Indian Rupee (INR) without the ₹ symbol.
 */
export function formatPriceNoSymbol(usdPrice: number): string {
  const inrPrice = Math.round(usdPrice * EXCHANGE_RATE);
  return inrPrice.toLocaleString('en-IN');
}

/**
 * Converts a USD price to Indian Rupee (INR) as a raw number.
 */
export function convertPrice(usdPrice: number): number {
  return Math.round(usdPrice * EXCHANGE_RATE);
}
