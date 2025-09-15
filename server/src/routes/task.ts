import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Task } from "../models/Task.js";
import Project from "../models/Project.js";
import { z } from "zod";
import { Types } from "mongoose";
import { DateTime } from "luxon";

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

// ---------- list ----------
/**
 * @openapi
 * /api/tasks:
 *   get:
 *     summary: List tasks
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: integer
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated tasks
 */
router.get("/", async (req, res) => {
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

// ---------- create ----------
/**
 * @openapi
 * /api/tasks:
 *   post:
 *     summary: Create a task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               notes:
 *                 type: string
 *               projectId:
 *                 type: string
 *               priority:
 *                 type: integer
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Created task
 *       400:
 *         description: Invalid projectId
 */
router.post("/", async (req, res) => {
  const userId = (req as any).auth.uid as string;
  const body = createTaskSchema.parse(req.body);

  if (body.projectId) {
    const ok = await Project.exists({ _id: body.projectId, userId, archived: false });
    if (!ok) return res.status(400).json({ error: "Invalid projectId" });
  }

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

// ---------- get single task ----------
/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task data
 *       400:
 *         description: Bad id
 *       404:
 *         description: Not found
 */
router.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).auth.uid as string;
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Bad id" });

    const task = await Task.findOne({ _id: id, userId: new Types.ObjectId(userId) });
    if (!task) return res.status(404).json({ error: "Not found" });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------- update ----------
/**
 * @openapi
 * /api/tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated task
 *       400:
 *         description: Bad id or invalid projectId
 *       404:
 *         description: Not found
 */
router.patch("/:id", async (req, res) => {
  const userId = (req as any).auth.uid as string;
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Bad id" });

  const body = updateTaskSchema.parse(req.body);

  if (body.projectId) {
    const ok = await Project.exists({ _id: body.projectId, userId, archived: false });
    if (!ok) return res.status(400).json({ error: "Invalid projectId" });
  }

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

// ---------- complete / incomplete ----------
/**
 * @openapi
 * /api/tasks/{id}/complete:
 *   post:
 *     summary: Mark a task as complete
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Completed task
 *       404:
 *         description: Not found
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
 * @openapi
 * /api/tasks/{id}/incomplete:
 *   post:
 *     summary: Mark a task as incomplete
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated task
 *       404:
 *         description: Not found
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

// ---------- delete ----------
/**
 * @openapi
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Task deleted
 *       404:
 *         description: Not found
 */
router.delete("/:id", async (req, res) => {
  const userId = (req as any).auth.uid as string;
  const result = await Task.deleteOne({ _id: req.params.id, userId: new Types.ObjectId(userId) });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

export default router;
