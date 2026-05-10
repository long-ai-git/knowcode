const SENSITIVE_PATTERNS: RegExp[] = [
  /sk-[a-zA-Z0-9]{32,}/g,
  /claude-[a-zA-Z0-9-]{32,}/g,
  /[A-Z0-9]{20}:[A-Za-z0-9+/=]{40}/g,
  /ghp_[a-zA-Z0-9]{36}/g,
  /(password|secret|token|key)\s*[:=]\s*['"]?([^'"\s,}]{8,})['"]?/gi,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /\b(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)\d+\.\d+\b/g,
  /[a-zA-Z]+:\/\/[^:]+:[^@]+@[^\s/]+/g,
];

export class Sanitizer {
  clean<T extends Record<string, unknown>>(input: T): T {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key,
        typeof value === 'string' ? this.sanitizeString(value) : value,
      ])
    ) as T;
  }

  sanitizeString(text: string): string {
    let cleaned = text;
    for (const pattern of SENSITIVE_PATTERNS) {
      cleaned = cleaned.replace(pattern, '[REDACTED]');
    }
    return cleaned;
  }
}