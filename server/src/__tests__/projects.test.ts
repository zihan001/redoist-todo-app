import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import projectRoutes from '../routes/project.js';
import Project from '../models/Project.js';
import { createTestUser, getAuthCookie } from './testHelpers.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/projects', projectRoutes);

describe('Project Routes', () => {
  let userId: string;
  let authCookie: string;

  beforeEach(async () => {
    await Project.deleteMany({});
    const user = await createTestUser();
    userId = user._id.toString();
    authCookie = getAuthCookie(userId);
  });

  describe('GET /api/projects', () => {
    it('should list user projects', async () => {
      await Project.create({
        userId,
        name: 'Project 1',
        color: '#ff0000'
      });

      const response = await request(app)
        .get('/api/projects')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Project 1');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/projects');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Cookie', authCookie)
        .send({
          name: 'New Project',
          color: '#00ff00'
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Project');
      expect(response.body.color).toBe('#00ff00');
    });

    it('should reject empty name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Cookie', authCookie)
        .send({
          name: '',
          color: '#00ff00'
        });

      expect(response.status).toBe(400);
    });
  });
});