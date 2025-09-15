// server/src/routes/project.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Project from "../models/Project.js";
import { z } from "zod";
import { Types } from "mongoose";

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management API
 */

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

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get a list of projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: includeArchived
 *         schema:
 *           type: boolean
 *         description: Include archived projects in the response
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 */
router.get("/", async (req, res) => {
  // Get the authenticated user's ID
  const uid = (req as any).auth.uid as string;

  // Check if archived projects should be included
  const includeArchived = req.query.includeArchived === "true";

  // Fetch projects for the user, optionally filtering out archived ones
  const projects = await Project.find({
    userId: new Types.ObjectId(uid),
    ...(includeArchived ? {} : { archived: false }),
  }).sort({ createdAt: 1 });

  res.json(projects);
});

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the project
 *               color:
 *                 type: string
 *                 description: Color of the project
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
  // Get the authenticated user's ID
  const uid = (req as any).auth.uid as string;

  // Validate the request body
  const body = createProjectSchema.parse(req.body);

  // Create a new project
  const project = await Project.create({
    userId: new Types.ObjectId(uid),
    name: body.name,
    color: body.color ?? "#64748b", // Default color if not provided
  });

  res.status(201).json(project);
});

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Update an existing project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the project
 *               color:
 *                 type: string
 *                 description: Updated color of the project
 *               archived:
 *                 type: boolean
 *                 description: Archive status of the project
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */
router.patch("/:id", async (req, res) => {
  // Get the authenticated user's ID
  const uid = (req as any).auth.uid as string;

  // Extract the project ID from the route parameters
  const { id } = req.params;

  // Validate the request body
  const body = updateProjectSchema.parse(req.body);

  // Update the project
  const project = await Project.findOneAndUpdate(
    { _id: id, userId: uid },
    { $set: body },
    { new: true }
  );

  if (!project) return res.status(404).json({ error: "Not found" });

  res.json(project);
});

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project to delete
 *     responses:
 *       204:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete("/:id", async (req, res) => {
  // Get the authenticated user's ID
  const uid = (req as any).auth.uid as string;

  // Extract the project ID from the route parameters
  const { id } = req.params;

  // Delete the project
  const result = await Project.deleteOne({ _id: id, userId: uid });

  if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });
  
  res.status(204).end();
});

export default router;
