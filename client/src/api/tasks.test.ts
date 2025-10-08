import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { listTasks, createTask, updateTask, completeTask, deleteTask } from './tasks';
import { api } from '../lib/http';

// Mock the HTTP utility
vi.mock('../lib/http', () => ({
  api: vi.fn(),
}));

describe('Tasks API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('listTasks', () => {
    it('calls API with correct URL and no filters by default', async () => {
      vi.mocked(api).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 });
      
      await listTasks();
      
      expect(api).toHaveBeenCalledWith('/api/tasks?');
    });

    it('includes project filter when projectId is provided', async () => {
      vi.mocked(api).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 });
      
      await listTasks({ projectId: 'project-123' });
      
      expect(api).toHaveBeenCalledWith(expect.stringContaining('projectId=project-123'));
    });

    it('includes completedAt filter when specified', async () => {
      vi.mocked(api).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 });
      
      await listTasks({ completedAt: true });
      
      expect(api).toHaveBeenCalledWith(expect.stringContaining('completedAt=true'));
    });
  });

  describe('createTask', () => {
    it('calls API with correct URL and body', async () => {
      const taskData = {
        title: 'New Task',
        notes: 'Task notes',
        priority: 3 as const,
      };
      
      vi.mocked(api).mockResolvedValue({});
      
      await createTask(taskData);
      
      expect(api).toHaveBeenCalledWith('/api/tasks', {
        method: 'POST',
        body: taskData,
      });
    });
  });

  describe('updateTask', () => {
    it('calls API with correct URL and body', async () => {
      const taskId = 'task-123';
      const updates = { title: 'Updated Title', priority: 1 as const };
      
      vi.mocked(api).mockResolvedValue({});
      
      await updateTask(taskId, updates);
      
      expect(api).toHaveBeenCalledWith(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: updates,
      });
    });
  });

  describe('completeTask', () => {
    it('calls API with correct URL', async () => {
      const taskId = 'task-123';
      
      vi.mocked(api).mockResolvedValue({});
      
      await completeTask(taskId);
      
      expect(api).toHaveBeenCalledWith(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
      });
    });
  });

  describe('deleteTask', () => {
    it('calls API with correct URL and method', async () => {
      const taskId = 'task-123';
      
      vi.mocked(api).mockResolvedValue(undefined);
      
      await deleteTask(taskId);
      
      expect(api).toHaveBeenCalledWith(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
    });
  });
});