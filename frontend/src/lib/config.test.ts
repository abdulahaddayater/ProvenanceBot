import { describe, expect, it } from 'vitest';
import { publicConfig } from './config';

describe('publicConfig (scaffold)', () => {
  it('exposes default agents API URL', () => {
    expect(publicConfig.agentsApiUrl).toContain('localhost');
  });
});
