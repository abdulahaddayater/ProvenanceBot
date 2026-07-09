import { describe, expect, it } from 'vitest';
import { publicConfig } from './config';

describe('publicConfig (scaffold)', () => {
  it('exposes agents API URL config', () => {
    expect(publicConfig.agentsApiUrl).toBeTruthy();
  });
});
