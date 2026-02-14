/**
 * Shannon Entropy Calculator
 *
 * Calculates information entropy for alphanumeric sequences.
 * High-entropy strings (> 4.5 bits/char) are likely secrets.
 */

/**
 * Calculate Shannon entropy for a string.
 * Returns bits per character.
 */
export function shannonEntropy(str: string): number {
  if (str.length === 0) return 0;

  const freq = new Map<string, number>();
  for (const char of str) {
    freq.set(char, (freq.get(char) ?? 0) + 1);
  }

  let entropy = 0;
  const len = str.length;
  for (const count of freq.values()) {
    const p = count / len;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  return entropy;
}

/**
 * Check if a string is a high-entropy alphanumeric sequence
 * that could be a secret.
 *
 * @param str - String to check
 * @param minLength - Minimum length to consider (default 10)
 * @param threshold - Entropy threshold in bits/char (default 4.5)
 * @returns Object with isSecret flag and entropy score
 */
export function isHighEntropy(
  str: string,
  minLength: number = 10,
  threshold: number = 4.5
): { isSecret: boolean; entropy: number } {
  // Only check alphanumeric sequences of sufficient length
  if (str.length < minLength) {
    return { isSecret: false, entropy: 0 };
  }

  // Extract alphanumeric runs
  const alnumRuns = str.match(/[a-zA-Z0-9+/=_-]{10,}/g);
  if (!alnumRuns) {
    return { isSecret: false, entropy: 0 };
  }

  let maxEntropy = 0;
  for (const run of alnumRuns) {
    const e = shannonEntropy(run);
    if (e > maxEntropy) maxEntropy = e;
  }

  return {
    isSecret: maxEntropy > threshold,
    entropy: maxEntropy,
  };
}
