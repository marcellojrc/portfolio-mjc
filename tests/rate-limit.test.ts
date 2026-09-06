import { describe, it, expect } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

describe('Sliding Window Rate Limiting', () => {
  it('allows requests within the limit', () => {
    const key = `test_ip_${Date.now()}`;
    const res1 = rateLimit(key, 3, 10000);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = rateLimit(key, 3, 10000);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = rateLimit(key, 3, 10000);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('blocks requests once the limit is exceeded', () => {
    const key = `block_ip_${Date.now()}`;
    rateLimit(key, 2, 10000);
    rateLimit(key, 2, 10000);

    const blocked = rateLimit(key, 2, 10000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
