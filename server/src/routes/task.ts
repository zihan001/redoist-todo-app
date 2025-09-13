import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { z } from "zod";
import { Types } from "mongoose";

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  project_id: z.string().optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  due_date: z.coerce.date().optional(),
});

const updateTaskSchema = createTaskSchema
  .partial()
  .extend({ completed_at: z.coerce.date().nullable().optional() });

router.use(requireAuth);

// list my tasks with optional filters
router.get("/", async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const { project_id, completed } = req.query as { project_id?: string; completed?: string };

  const filter: any = { user_id: new Types.ObjectId(uid) };
  if (project_id) filter.project_id = new Types.ObjectId(project_id);
  if (completed === "true") filter.completed_at = { $ne: null };
  if (completed === "false") filter.completed_at = null;

  const tasks = await Task.find(filter).sort({ due_date: 1, createdAt: -1 });
  res.json(tasks);
});

// create
router.post("/", async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const body = createTaskSchema.parse(req.body);

  // if project provided, ensure ownership
  if (body.project_id) {
    const ok = await Project.exists({ _id: body.project_id, user_id: uid, archived: false });
    if (!ok) return res.status(400).json({ error: "Invalid project_id" });
  }

  const task = await Task.create({
    user_id: new Types.ObjectId(uid),
    project_id: body.project_id ? new Types.ObjectId(body.project_id) : undefined,
    title: body.title,
    description: body.description,
    priority: body.priority ?? "normal",
    due_date: body.due_date,
  });
  res.status(201).json(task);
});

// update
router.patch("/:id", async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const { id } = req.params;
  const body = updateTaskSchema.parse(req.body);

  if (body.project_id) {
    const ok = await Project.exists({ _id: body.project_id, user_id: uid, archived: false });
    if (!ok) return res.status(400).json({ error: "Invalid project_id" });
  }

  const task = await Task.findOneAndUpdate(
    { _id: id, user_id: uid },
    {
      $set: {
        ...body,
        project_id: body.project_id ? new Types.ObjectId(body.project_id) : undefined,
      },
    },
    { new: true }
  );
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

// complete / incomplete helpers
router.post("/:id/complete", async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user_id: uid },
    { $set: { completed_at: new Date() } },
    { new: true }
  );
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

router.post("/:id/incomplete", async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user_id: uid },
    { $set: { completed_at: null } },
    { new: true }
  );
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

// delete
router.delete("/:id", async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const result = await Task.deleteOne({ _id: req.params.id, user_id: uid });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

export default router;
