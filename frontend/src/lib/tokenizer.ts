export const TOKEN_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F0B27A', '#82E0AA', '#F1948A', '#85929E', '#73C6B6',
  '#E59866', '#AED6F1', '#D7BDE2', '#A3E4D7', '#F9E79F',
  '#ABEBC6', '#FADBD8', '#AEB6BF', '#D5F5E3', '#FCF3CF',
];

export interface TokenSpan {
  text: string;
  isToken: boolean;
  color: string;
}

export function tokenize(text: string): TokenSpan[] {
  const parts = text.match(/\S+|\s+/g) || [];
  const spans: TokenSpan[] = [];
  let tokenIndex = 0;

  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      spans.push({ text: part, isToken: false, color: 'transparent' });
    } else {
      spans.push({
        text: part,
        isToken: true,
        color: TOKEN_COLORS[tokenIndex % TOKEN_COLORS.length],
      });
      tokenIndex++;
    }
  }

  return spans;
}

export function estimateTokens(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  const words = cleaned.split(/\s+/);
  let count = 0;
  for (const word of words) {
    const punctuation = (word.match(/[.,!?;:'"()\[\]{}]/g) || []).length;
    count += Math.max(1, Math.ceil((word.length - punctuation) / 4) + punctuation);
  }
  return count;
}

export function checkPromptStructure(prompt: string, structureCheck: Record<string, string[]>): {
  found: string[];
  missing: string[];
  score: number;
} {
  const lower = prompt.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];

  for (const [key, keywords] of Object.entries(structureCheck)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      found.push(key);
    } else {
      missing.push(key);
    }
  }

  const total = Object.keys(structureCheck).length;
  const score = total > 0 ? Math.round((found.length / total) * 100) : 0;

  return { found, missing, score };
}
