import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock lib/api pre importa store-a
vi.mock('../../lib/api', () => {
  return {
    api: {
      post: vi.fn(),
      get: vi.fn(),
    },
    apiError: vi.fn((err, fallback) => fallback),
  };
});

import { api } from '../../lib/api';
import { useAIReportsStore } from '../aiReportsStore';

describe('useAIReportsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAIReportsStore.setState({
      report: null,
      warning: null,
      isLoading: false,
      error: null,
    });
  });

  it('createReport -> calls POST /api/ai-reports and stores report + warning', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        report: { id: 'r1', workId: 'w1', aiScore: 88 },
        warning: 'ok',
      },
    });

    const report = await useAIReportsStore.getState().createReport('w1');

    expect(api.post).toHaveBeenCalledWith('/api/ai-reports', { workId: 'w1' });
    expect(report).toEqual({ id: 'r1', workId: 'w1', aiScore: 88 });

    const s = useAIReportsStore.getState();
    expect(s.report).toEqual({ id: 'r1', workId: 'w1', aiScore: 88 });
    expect(s.warning).toBe('ok');
    expect(s.error).toBeNull();
    expect(s.isLoading).toBe(false);
  });

  it('fetchByWorkId -> calls GET /api/ai-reports/by-work/:workId and stores report', async () => {
    api.get.mockResolvedValueOnce({
      data: { report: { id: 'r2', workId: 'w2', aiScore: 55 } },
    });

    const report = await useAIReportsStore.getState().fetchByWorkId('w2');

    expect(api.get).toHaveBeenCalledWith('/api/ai-reports/by-work/w2');
    expect(report).toEqual({ id: 'r2', workId: 'w2', aiScore: 55 });
    expect(useAIReportsStore.getState().report).toEqual({
      id: 'r2',
      workId: 'w2',
      aiScore: 55,
    });
  });

  it('createReport -> on error sets error and returns null', async () => {
    api.post.mockRejectedValueOnce(new Error('fail'));

    const report = await useAIReportsStore.getState().createReport('w1');

    expect(report).toBeNull();
    expect(useAIReportsStore.getState().error).toBe('Create AI report failed');
    expect(useAIReportsStore.getState().isLoading).toBe(false);
  });
});