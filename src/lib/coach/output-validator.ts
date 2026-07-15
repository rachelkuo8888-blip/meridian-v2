/**
 * Coach Agent — Output Validator
 *
 * Validates and sanitizes generated coach messages.
 * Checks: length, blacklisted keywords, Chinese chars, injection, punctuation, placeholders.
 */

import type { ValidationResult } from './types';

// ---- Blacklisted keywords and their replacements ----

const BLACKLISTED_WORDS: Record<string, string> = {
  '凶': '张力',
  '劫': '挑战',
  '破财': '波动',
  '死': '变化',
  '灾': '注意',
};

// ---- Chinese character regex ----

const CHINESE_CHAR_RE = /[\u4e00-\u9fff\u3400-\u4dbf]/;

// ---- Placeholder syntax ----

const PLACEHOLDER_RE = /\{\{[^}]+\}\}/;

// ---- HTML/JS injection ----

const INJECTION_RE = /<[^>]*>|javascript:|on\w+\s*=|alert\(|script|<\/|\\x[0-9a-fA-F]{2}/i;

// ---- Main Validation ----

/**
 * Validate a generated coach message.
 *
 * Checks:
 * 1. Length (min 10, max 500 chars)
 * 2. Blacklisted keywords
 * 3. Contains Chinese characters
 * 4. No HTML/JS injection
 * 5. Ends with Chinese punctuation (。！？)
 * 6. No unrendered placeholder syntax like {var_name}
 */
export function validateOutput(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return { valid: false, reason: 'Empty output' };
  }

  const trimmed = text.trim();

  // 1. Length check
  if (trimmed.length < 10) {
    return { valid: false, reason: `Output too short: ${trimmed.length} chars (min 10)` };
  }

  if (trimmed.length > 500) {
    return { valid: false, reason: `Output too long: ${trimmed.length} chars (max 500)` };
  }

  // 2. Blacklisted keywords
  for (const [word] of Object.entries(BLACKLISTED_WORDS)) {
    if (trimmed.includes(word)) {
      return { valid: false, reason: `Blacklisted keyword found: '${word}'` };
    }
  }

  // 3. Chinese characters
  if (!CHINESE_CHAR_RE.test(trimmed)) {
    return { valid: false, reason: 'Output must contain Chinese characters' };
  }

  // 4. HTML/JS injection
  if (INJECTION_RE.test(trimmed)) {
    return { valid: false, reason: 'Output contains HTML/JS injection patterns' };
  }

  // 5. Ends with Chinese punctuation
  const lastChar = trimmed[trimmed.length - 1];
  if (!['。', '！', '？'].includes(lastChar)) {
    return { valid: false, reason: `Output must end with Chinese punctuation (。！？), got '${lastChar}'` };
  }

  // 6. Unrendered placeholders
  if (PLACEHOLDER_RE.test(trimmed)) {
    return { valid: false, reason: 'Output contains unrendered placeholders like {{var_name}}' };
  }

  return { valid: true };
}

// ---- Sanitization ----

/**
 * Sanitize a coach message:
 * - Replace blacklisted words with safe alternatives
 * - Strip HTML tags
 * - Trim whitespace
 * - Ensure ends with punctuation
 */
export function sanitize(text: string): string {
  let result = text;

  // Replace blacklisted words
  for (const [word, replacement] of Object.entries(BLACKLISTED_WORDS)) {
    result = result.replaceAll(word, replacement);
  }

  // Strip HTML tags
  result = result.replace(/<[^>]*>/g, '');

  // Trim whitespace
  result = result.trim();

  // Ensure ends with Chinese punctuation
  const lastChar = result[result.length - 1];
  if (!['。', '！', '？'].includes(lastChar)) {
    result = result + '。';
  }

  return result;
}
