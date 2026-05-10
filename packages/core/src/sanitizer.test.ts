import { describe, it, expect } from 'vitest';
import { Sanitizer } from './security';

describe('Sanitizer', () => {
  const sanitizer = new Sanitizer();

  it('should sanitize OpenAI API keys', () => {
    const input = 'My key is sk-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP';
    const result = sanitizer.sanitizeString(input);
    expect(result).toContain('[REDACTED]');
    expect(result).not.toContain('sk-');
  });

  it('should sanitize passwords', () => {
    const input = 'password: mySecretPassword123';
    const result = sanitizer.sanitizeString(input);
    expect(result).toContain('[REDACTED]');
  });

  it('should sanitize emails', () => {
    const input = 'Contact me at test@example.com';
    const result = sanitizer.sanitizeString(input);
    expect(result).toContain('[REDACTED]');
  });

  it('should clean object values', () => {
    const input = {
      name: 'test',
      apiKey: 'sk-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP',
      email: 'test@example.com',
    };
    const result = sanitizer.clean(input);
    expect(result.apiKey).toBe('[REDACTED]');
    expect(result.email).toBe('[REDACTED]');
    expect(result.name).toBe('test');
  });
});