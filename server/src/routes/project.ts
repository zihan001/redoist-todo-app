import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Project from "../models/Project.js";
import { z } from "zod";
import { Types } from "mongoose";

const router = Router();

const createProjectSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
});
const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  archived: z.boolean().optional(),
});

router.use(requireAuth);

// list my projects (optionally include archived)
router.get("/", async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const includeArchived = req.query.includeArchived === "true";
  const projects = await Project.find({
    userId: new Types.ObjectId(uid),
    ...(includeArchived ? {} : { archived: false }),
  }).sort({ createdAt: 1 });
  res.json(projects);
});

// create
router.post("/", async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const body = createProjectSchema.parse(req.body);
  const project = await Project.create({
    userId: new Types.ObjectId(uid),
    name: body.name,
    color: body.color ?? "#64748b",
  });
  res.status(201).json(project);
});

// update
router.patch("/:id", async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const { id } = req.params;
  const body = updateProjectSchema.parse(req.body);

  const project = await Project.findOneAndUpdate(
    { _id: id, userId: uid },
    { $set: body },
    { new: true }
  );
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(project);
});

// delete (hard delete for now; could soft-delete via archived=true)
router.delete("/:id", async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const { id } = req.params;
  const result = await Project.deleteOne({ _id: id, userId: uid });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

export default router;
