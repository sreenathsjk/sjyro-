/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';

/**
 * Automatically parses Google Drive links and converts them to direct, raw-image rendering URLs.
 * Supports standard share links, view links, and export links.
 */
export function cleanImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Pattern 1: /file/d/([a-zA-Z0-9_-]+)
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // Pattern 2: open?id=([a-zA-Z0-9_-]+) or uc?id=([a-zA-Z0-9_-]+)
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (
    (trimmed.includes('drive.google.com/open') ||
      trimmed.includes('drive.google.com/uc') ||
      trimmed.includes('docs.google.com/uc')) &&
    idMatch &&
    idMatch[1]
  ) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return trimmed;
}

/**
 * Intercepts a Product object and ensures all its image paths are fully sanitized.
 */
export function cleanProduct(p: Product): Product {
  if (!p) return p;
  const cleanedImages = (p.images || []).map(cleanImageUrl);
  const cleanedHoverImage = p.hoverImage ? cleanImageUrl(p.hoverImage) : undefined;
  return {
    ...p,
    images: cleanedImages,
    hoverImage: cleanedHoverImage,
  };
}
