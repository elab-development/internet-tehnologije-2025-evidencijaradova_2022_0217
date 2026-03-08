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
import { usePlagiarismReportsStore } from '../plagiarismReportStore';

describe('usePlagiarismReportsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePlagiarismReportsStore.setState({
      report: null,
      warning: null,
      isLoading: false,
      error: null,
    });
  });

  it('createReport -> calls POST /api/plagiarism-reports and stores report + warning', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        report: { id: 'p1', workId: 'w1', similarityPercentage: 23.5 },
        warning: null,
      },
    });

    const report = await usePlagiarismReportsStore
      .getState()
      .createReport('w1');

    expect(api.post).toHaveBeenCalledWith('/api/plagiarism-reports', {
      workId: 'w1',
    });
    expect(report).toEqual({
      id: 'p1',
      workId: 'w1',
      similarityPercentage: 23.5,
    });

    const s = usePlagiarismReportsStore.getState();
    expect(s.report).toEqual({
      id: 'p1',
      workId: 'w1',
      similarityPercentage: 23.5,
    });
    expect(s.warning).toBeNull();
    expect(s.error).toBeNull();
    expect(s.isLoading).toBe(false);
  });

  it('fetchByWorkId -> calls GET /api/plagiarism-reports/by-work/:workId and stores report', async () => {
    api.get.mockResolvedValueOnce({
      data: { report: { id: 'p2', workId: 'w2', similarityPercentage: 60 } },
    });

    const report = await usePlagiarismReportsStore
      .getState()
      .fetchByWorkId('w2');

    expect(api.get).toHaveBeenCalledWith('/api/plagiarism-reports/by-work/w2');
    expect(report).toEqual({
      id: 'p2',
      workId: 'w2',
      similarityPercentage: 60,
    });
    expect(usePlagiarismReportsStore.getState().report).toEqual({
      id: 'p2',
      workId: 'w2',
      similarityPercentage: 60,
    });
  });

  it('fetchByWorkId -> on error sets error and returns null', async () => {
    api.get.mockRejectedValueOnce(new Error('fail'));

    const report = await usePlagiarismReportsStore
      .getState()
      .fetchByWorkId('w1');

    expect(report).toBeNull();
    expect(usePlagiarismReportsStore.getState().error).toBe(
      'Fetch report failed',
    );
  });
});