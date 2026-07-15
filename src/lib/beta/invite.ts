/**
 * Invite code generation and validation
 *
 * For MVP, codes are stored in localStorage.
 * Admin can pre-generate codes and store them.
 */

// Valid characters for invite codes (uppercase alphanumeric, no confusing chars)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a single invite code: MER-XXXX
 */
export function generateInviteCode(): string {
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return `MER-${random}`;
}

/**
 * Generate multiple invite codes at once (for admin use)
 */
export function generateInviteCodes(count: number): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateInviteCode());
  }
  return codes;
}

/**
 * Validate invite code format only.
 * Returns true if format is MER-XXXX.
 */
export function isValidFormat(code: string): boolean {
  return /^MER-[A-Z0-9]{4}$/.test(code);
}

/**
 * Built-in valid codes for MVP demonstrations.
 * In production these would be stored in a database.
 */
const BUILD_IN_CODES = new Set(['MER-DEMO', 'MER-TEST', 'MER-BETA', 'MER-ALPHA']);

/**
 * Get valid codes from localStorage (admin-generated codes).
 */
function getStoredCodes(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = JSON.parse(localStorage.getItem('meridian-beta-codes') || '[]');
    return new Set<string>(stored);
  } catch {
    return new Set();
  }
}

/**
 * Full validation: check format, then verify against storage.
 * Server-side: checks against in-memory Set.
 * Client-side: checks against localStorage + built-in codes.
 */
export function validateInviteCode(code: string): boolean {
  if (!isValidFormat(code)) return false;
  // Check built-in codes
  if (BUILD_IN_CODES.has(code)) return true;
  // Check stored codes (for admin-generated)
  const stored = getStoredCodes();
  if (stored.has(code)) return true;
  return false;
}

/**
 * Validate invite code on server side.
 * Uses a simple in-memory storage for MVP.
 */
const serverCodes = new Set<string>([...BUILD_IN_CODES]);

export function addServerCode(code: string): void {
  if (isValidFormat(code)) {
    serverCodes.add(code);
  }
}

export function validateServerCode(code: string): boolean {
  if (!isValidFormat(code)) return false;
  return serverCodes.has(code);
}

export function getServerCodes(): string[] {
  return [...serverCodes];
}
