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
/**
 * @openapi
 * /api/projects:
 *   get:
 *     summary: List projects for the current user
 *     parameters:
 *       - in: query
 *         name: includeArchived
 *         schema:
 *           type: boolean
 *         description: Include archived projects
 *     responses:
 *       200:
 *         description: Array of projects
 */
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
/**
 * @openapi
 * /api/projects:
 *   post:
 *     summary: Create a project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created project
 */
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
/**
 * @openapi
 * /api/projects/{id}:
 *   patch:
 *     summary: Update a project
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
 *         description: Updated project
 *       404:
 *         description: Not found
 */
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
/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Project deleted
 *       404:
 *         description: Not found
 */
router.delete("/:id", async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const { id } = req.params;
  const result = await Project.deleteOne({ _id: id, userId: uid });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

export default router;
