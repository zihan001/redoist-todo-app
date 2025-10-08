import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import taskRoutes from '../routes/task.js';
import { Task } from '../models/Task.js';
import { createTestUser, createTestProject, getAuthCookie } from './testHelpers.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/tasks', taskRoutes);

describe('Task Routes', () => {
  let userId: string;
  let projectId: string;
  let authCookie: string;

  beforeEach(async () => {
    await Task.deleteMany({});
    const user = await createTestUser();
    userId = user._id.toString();
    const project = await createTestProject(userId);
    projectId = project._id.toString();
    authCookie = getAuthCookie(userId);
  });

  describe('GET /api/tasks', () => {
    it('should list user tasks', async () => {
      await Task.create({
        userId,
        projectId,
        title: 'Test Task',
        priority: 2
      });

      const response = await request(app)
        .get('/api/tasks')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].title).toBe('Test Task');
    });

    it('should filter by project', async () => {
      const project2 = await createTestProject(userId, 'Project 2');
      
      await Task.create({
        userId,
        projectId,
        title: 'Task 1',
        priority: 2
      });
      
      await Task.create({
        userId,
        projectId: project2._id.toString(),
        title: 'Task 2',
        priority: 2
      });

      const response = await request(app)
        .get(`/api/tasks?projectId=${projectId}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].title).toBe('Task 1');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', authCookie)
        .send({
          title: 'New Task',
          projectId,
          priority: "3"
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New Task');
      expect(response.body.priority).toBe(3);
    });

    it('should require title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', authCookie)
        .send({
          projectId,
          priority: 2
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task completion status', async () => {
      const task = await Task.create({
        userId,
        projectId,
        title: 'Test Task',
        priority: 2
      });

      const response = await request(app)
        .patch(`/api/tasks/${task._id}`)
        .set('Cookie', authCookie)
        .send({
          completedAt: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.completedAt).toBeTruthy();
    });
  });
});