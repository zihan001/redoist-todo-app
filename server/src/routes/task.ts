// server/src/routes/task.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Task } from "../models/Task.js";
import Project from "../models/Project.js";
import { z } from "zod";
import { Types } from "mongoose";
import { DateTime } from "luxon";

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management API
 */

const router = Router();
router.use(requireAuth);

// ---------- validation ----------
const createTaskSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional(),
  projectId: z.string().optional(),
  priority: z.enum([ "1", "2", "3" ]).transform(n => Number(n) as 1|2|3).optional(),
  dueDate: z.coerce.date().optional(),
});

const updateTaskSchema = createTaskSchema
  .partial()
  .extend({ completedAt: z.coerce.date().nullable().optional() });

const listQuery = z.object({
  projectId: z.string().optional(),
  completed: z.enum(["true", "false"]).optional(), // legacy flag
  filter: z.enum(["today", "upcoming", "past", "completed"]).optional(),
  priority: z.enum([ "1", "2", "3" ]).transform(n => Number(n) as 1|2|3).optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(200).default(100),
});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get a list of tasks
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter tasks by project ID
 *       - in: query
 *         name: completed
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter tasks by completion status
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [today, upcoming, past, completed]
 *         description: Apply a quick filter
 *       - in: query
 *         name: priority
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *         description: Filter tasks by priority
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search tasks by title or notes
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of tasks per page
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/", async (req, res) => {
  // Fetch tasks based on query parameters
  const userId = (req as any).auth.uid as string;
  const { projectId, completed, filter, priority, q, page, pageSize } = listQuery.parse(req.query);

  const where: any = { userId: new Types.ObjectId(userId) };
  if (projectId) where.projectId = new Types.ObjectId(projectId);

  if (completed === "true") where.completedAt = { $ne: null };
  if (completed === "false") where.completedAt = null;

  const tz = "America/Vancouver"; // TODO: later pull from user profile
  const now = DateTime.now().setZone(tz);
  const start = now.startOf("day").toUTC().toJSDate();
  const end = now.endOf("day").toUTC().toJSDate();

  if (!completed && filter) {
    if (filter === "completed") where.completedAt = { $ne: null };
    if (filter === "today") {
      where.completedAt = null;
      where.dueDate = { $gte: start, $lte: end };
    }
    if (filter === "upcoming") {
      where.completedAt = null;
      where.$or = [
        { dueDate: { $gt: end } },
        { dueDate: null }, // treat no-due-date as upcoming
      ];
    }
    if (filter === "past") {
      where.completedAt = null;
      where.dueDate = { $lt: start };
    }
  }

  if (priority) where.priority = priority;

  if (q && q.trim()) {
    const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    where.$or = [...(where.$or ?? []), { title: rx }, { notes: rx }];
  }

  const [items, total] = await Promise.all([
    Task.find(where)
      .sort({ completedAt: 1, dueDate: 1, priority: -1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec(),
    Task.countDocuments(where),
  ]);

  res.json({ items, total, page, pageSize });
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the task
 *               notes:
 *                 type: string
 *                 description: Additional notes for the task
 *               projectId:
 *                 type: string
 *                 description: ID of the project the task belongs to
 *               priority:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: Priority of the task
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date of the task
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error or invalid project ID
 */
router.post("/", async (req, res) => {
  const userId = (req as any).auth.uid as string;

  // Validate the request body
  const body = createTaskSchema.parse(req.body);

  // Check if the project ID is valid and belongs to the user
  if (body.projectId) {
    const ok = await Project.exists({ _id: body.projectId, userId, archived: false });
    if (!ok) return res.status(400).json({ error: "Invalid projectId" });
  }

  // Create a new task
  const task = await Task.create({
    userId: new Types.ObjectId(userId),
    projectId: body.projectId ? new Types.ObjectId(body.projectId) : undefined,
    title: body.title,
    notes: body.notes ?? "",
    priority: body.priority ?? 2,
    dueDate: body.dueDate,
  });

  res.status(201).json(task);
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to retrieve
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       404:
 *         description: Task not found
 */
router.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).auth.uid as string;
    const { id } = req.params;

    // Validate the task ID
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Bad id" });

    // Find the task by ID and user ID
    const task = await Task.findOne({ _id: id, userId: new Types.ObjectId(userId) });
    if (!task) return res.status(404).json({ error: "Not found" });

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated title of the task
 *               notes:
 *                 type: string
 *                 description: Updated notes for the task
 *               projectId:
 *                 type: string
 *                 description: Updated project ID for the task
 *               priority:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: Updated priority of the task
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Updated due date of the task
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Mark the task as completed
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
router.patch("/:id", async (req, res) => {
  const userId = (req as any).auth.uid as string;
  const { id } = req.params;

  // Validate the task ID
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Bad id" });

  // Validate the request body
  const body = updateTaskSchema.parse(req.body);

  // Check if the project ID is valid and belongs to the user
  if (body.projectId) {
    const ok = await Project.exists({ _id: body.projectId, userId, archived: false });
    if (!ok) return res.status(400).json({ error: "Invalid projectId" });
  }

  // Update the task
  const task = await Task.findOneAndUpdate(
    { _id: id, userId: new Types.ObjectId(userId) },
    {
      $set: {
        ...body,
        projectId: body.projectId ? new Types.ObjectId(body.projectId) : undefined,
      },
    },
    { new: true }
  );

  if (!task) return res.status(404).json({ error: "Not found" });

  res.json(task);
});

/**
 * @swagger
 * /tasks/{id}/complete:
 *   post:
 *     summary: Mark a task as complete
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to mark as complete
 *     responses:
 *       200:
 *         description: Task marked as complete successfully
 *       404:
 *         description: Task not found
 */
router.post("/:id/complete", async (req, res) => {
  const userId = (req as any).auth.uid as string;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: new Types.ObjectId(userId) },
    { $set: { completedAt: new Date() } },
    { new: true }
  );
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

/**
 * @swagger
 * /tasks/{id}/incomplete:
 *   post:
 *     summary: Mark a task as incomplete
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to mark as incomplete
 *     responses:
 *       200:
 *         description: Task marked as incomplete successfully
 *       404:
 *         description: Task not found
 */
router.post("/:id/incomplete", async (req, res) => {
  const userId = (req as any).auth.uid as string;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: new Types.ObjectId(userId) },
    { $set: { completedAt: null } },
    { new: true }
  );
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to delete
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete("/:id", async (req, res) => {
  const userId = (req as any).auth.uid as string;

  // Delete the task
  const result = await Task.deleteOne({ _id: req.params.id, userId: new Types.ObjectId(userId) });

  if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });

  res.status(204).end();
});

export default router;
