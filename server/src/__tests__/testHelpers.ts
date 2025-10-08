import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { Task } from '../models/Task.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

export async function createTestUser(email = 'test@example.com', password = 'password123') {
  const user = await User.create({
    email,
    password_hash: 'hashed-password'
  });
  return user;
}

export function createAuthToken(userId: string) {
  return jwt.sign({ uid: userId }, JWT_SECRET);
}

export async function createTestProject(userId: string, name = 'Test Project') {
  return await Project.create({
    userId,
    name,
    color: '#64748b'
  });
}

export async function createTestTask(userId: string, projectId: string, title = 'Test Task') {
  return await Task.create({
    userId,
    projectId,
    title,
    priority: 2
  });
}

export function getAuthCookie(userId: string) {
  const token = createAuthToken(userId);
  return `token=${token}`;
}