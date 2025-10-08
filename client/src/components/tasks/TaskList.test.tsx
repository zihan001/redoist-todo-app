import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import '@testing-library/jest-dom';
import TaskList from './TaskList';
import { useTasks } from '../../hooks/useTasks';

// Mock the hooks and API calls
vi.mock('../../hooks/useTasks', () => ({
  useTasks: vi.fn(),
}));

describe('TaskList', () => {
  it('shows loading state when data is being fetched', () => {
    // Mock the hook to return loading state
    vi.mocked(useTasks).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      isFetching: false,
      isRefetching: false,
      isError: false,
      isSuccess: false,
      isPending: true,
      isLoadingError: false,
      isRefetchError: false,
      status: 'pending',
      refetch: vi.fn(),
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isInitialLoading: true,
      isPlaceholderData: false,
      isStale: true,
      isPaused: false,
      // Add missing properties for QueryObserverPendingResult
      errorUpdateCount: 0,
      isEnabled: true,
      promise: Promise.resolve({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      }),
    });

    render(<TaskList />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders a list of tasks when data is loaded', () => {
    // Mock the hook to return some task data
    vi.mocked(useTasks).mockReturnValue({
      data: {
        items: [
          { 
            _id: '1', 
            title: 'Test Task 1', 
            priority: 2, 
            completedAt: null,
            createdAt: '2025-10-01T12:00:00Z',
            updatedAt: '2025-10-01T12:00:00Z',
          },
          {
            _id: '2', 
            title: 'Test Task 2',
            priority: 3,
            dueDate: '2025-10-10T12:00:00Z',
            completedAt: null,
            createdAt: '2025-10-02T12:00:00Z',
            updatedAt: '2025-10-02T12:00:00Z',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      },
      error: null,
      isLoading: false,
      isFetching: false,
      isRefetching: false,
      isError: false,
      isSuccess: true,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      status: 'success',
      refetch: vi.fn(),
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isInitialLoading: false,
      isPlaceholderData: false,
      isStale: false,
      isPaused: false,
      errorUpdateCount: 0,
      isEnabled: true,
      promise: Promise.resolve({
        items: [
          { 
            _id: '1', 
            title: 'Test Task 1', 
            priority: 2, 
            completedAt: null,
            createdAt: '2025-10-01T12:00:00Z',
            updatedAt: '2025-10-01T12:00:00Z',
          },
          {
            _id: '2', 
            title: 'Test Task 2',
            priority: 3,
            dueDate: '2025-10-10T12:00:00Z',
            completedAt: null,
            createdAt: '2025-10-02T12:00:00Z',
            updatedAt: '2025-10-02T12:00:00Z',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      }),
    });

    render(<TaskList />);
    
    // Check that the task titles are displayed
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    
    // Check that priority info is displayed
    expect(screen.getByText(/Med/)).toBeInTheDocument();
    expect(screen.getByText(/High/)).toBeInTheDocument();
  });
});