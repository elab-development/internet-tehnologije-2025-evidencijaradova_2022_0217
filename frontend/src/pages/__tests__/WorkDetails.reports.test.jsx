import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 1) Mock react-router-dom (useParams)
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'work-123' }),
    Link: ({ children }) => <div>{children}</div>,
  };
});

// 2) Mock stores used in WorkDetails
const fetchWorkById = vi.fn();
const plagClear = vi.fn();
const aiClear = vi.fn();
const gradeClearMessages = vi.fn();

const plagFetch = vi.fn();
const plagCreate = vi.fn();

const aiFetch = vi.fn();
const aiCreate = vi.fn();

const fetchGradeByWorkId = vi.fn();

vi.mock('../../stores/authStore', () => ({
  useAuthStore: (sel) =>
    sel({
      user: { id: 't1', role: 'teacher', fullName: 'Teacher' },
    }),
}));

vi.mock('../../stores/worksStore', () => ({
  useWorksStore: (sel) =>
    sel({
      work: {
        id: 'work-123',
        title: 'Demo work',
        subject: 'Math',
        status: 'pending_review',
        studentId: 's1',
        student: { fullName: 'Student', email: 's@mail.com' },
        submittedAt: new Date().toISOString(),
        fileUrl: 'https://file',
        description: 'Desc',
      },
      isLoading: false,
      error: null,
      fetchWorkById,
      updateWork: vi.fn(),
    }),
}));

vi.mock('../../stores/plagiarismReportStore', () => ({
  usePlagiarismReportsStore: (sel) =>
    sel({
      report: null,
      warning: null,
      isLoading: false,
      error: null,
      clear: plagClear,
      fetchByWorkId: plagFetch,
      createReport: plagCreate,
    }),
}));

vi.mock('../../stores/aiReportsStore', () => ({
  useAIReportsStore: (sel) =>
    sel({
      report: null,
      warning: null,
      isLoading: false,
      error: null,
      clear: aiClear,
      fetchByWorkId: aiFetch,
      createReport: aiCreate,
    }),
}));

vi.mock('../../stores/gradesStore', () => ({
  useGradesStore: (sel) =>
    sel({
      grade: null,
      isLoading: false,
      error: null,
      success: null,
      clearMessages: gradeClearMessages,
      fetchGradeByWorkId,
      createGrade: vi.fn(),
      updateGrade: vi.fn(),
      deleteGrade: vi.fn(),
    }),
}));

import WorkDetails from '../WorkDetails';

describe('WorkDetails - Reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // napravi da create resolve-uje kako ne bi pukao await chain
    plagCreate.mockResolvedValueOnce({ id: 'p1' });
    plagFetch.mockResolvedValueOnce(null);

    aiCreate.mockResolvedValueOnce({ id: 'a1' });
    aiFetch.mockResolvedValueOnce(null);
  });

  it('click Generate (Plagiarism) calls createReport + fetchByWorkId', async () => {
    const user = userEvent.setup();
    render(<WorkDetails />);

    // WorkDetails ima 2 dugmeta "Generate" (plag + ai). Prvo je Plagiarism.
    const buttons = screen.getAllByRole('button', { name: /generate/i });
    await user.click(buttons[0]);

    expect(plagCreate).toHaveBeenCalledWith('work-123');
    expect(plagFetch).toHaveBeenCalledWith('work-123');
  });

  it('click Generate (AI) calls createReport + fetchByWorkId', async () => {
    const user = userEvent.setup();
    render(<WorkDetails />);

    const buttons = screen.getAllByRole('button', { name: /generate/i });
    await user.click(buttons[1]);

    expect(aiCreate).toHaveBeenCalledWith('work-123');
    expect(aiFetch).toHaveBeenCalledWith('work-123');
  });
});