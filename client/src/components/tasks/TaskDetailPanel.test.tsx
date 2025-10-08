import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '../../test/utils';
import '@testing-library/jest-dom';
import TaskDetailPanel from './TaskDetailPanel';
import { getTask, updateTask } from '../../api/tasks';
import userEvent from '@testing-library/user-event';
import * as reactQuery from '@tanstack/react-query';

// Mock the task API functions
vi.mock('../../api/tasks', () => ({
  getTask: vi.fn(),
  updateTask: vi.fn().mockResolvedValue({}),
}));

// Mock the useQuery hook to have better control over its behavior
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

describe('TaskDetailPanel', () => {
  const mockTask = {
    _id: '123',
    title: 'Test Task',
    notes: 'Test notes',
    priority: 2,
    dueDate: '2025-10-15T00:00:00.000Z',
    completedAt: null,
    createdAt: '2025-10-01T00:00:00.000Z',
    updatedAt: '2025-10-01T00:00:00.000Z',
  };
  
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    // Default implementation for getTask
    vi.mocked(getTask).mockResolvedValue(mockTask);
  });

  it('displays loading state while fetching task data', () => {
    // Mock useQuery to return loading state
    vi.mocked(reactQuery.useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
    } as any);
    
    render(<TaskDetailPanel taskId="123" onClose={onCloseMock} />);
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('displays task details when data is loaded', async () => {
    // Mock useQuery to return success state with the mock task
    vi.mocked(reactQuery.useQuery).mockReturnValue({
        data: mockTask,
        isLoading: false,
        error: null,
        isError: false,
    } as any);
    
    render(<TaskDetailPanel taskId="123" onClose={onCloseMock} />);
    
    // Check that task title is displayed in an input field
    const titleInput = screen.getByPlaceholderText('Title');
    expect(titleInput).toHaveValue('Test Task');
    
    // Check for notes field
    const notesTextarea = screen.getByPlaceholderText('Notes');
    expect(notesTextarea).toHaveValue('Test notes');
    
    // Check for priority dropdown/select (using ID selector instead of label)
    const prioritySelect = screen.getByLabelText('Priority');
    expect(prioritySelect).toHaveValue('2');
    
    // Check that due date is set correctly
    const dueDateInput = screen.getByLabelText('Due date');
    expect(dueDateInput).toHaveValue('2025-10-15');
    });

  it('calls onClose when close button is clicked', async () => {
    // Mock useQuery to return success state with the mock task
    vi.mocked(reactQuery.useQuery).mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
      isError: false,
    } as any);
    
    render(<TaskDetailPanel taskId="123" onClose={onCloseMock} />);
    
    // Find the close button by its text
    const closeButton = screen.getByText('Close');
    
    // Click the close button
    await userEvent.click(closeButton);
    
    // Verify onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});