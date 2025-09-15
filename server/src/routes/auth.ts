import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Email already exists
 */
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ email, password_hash });
    const token = jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" }).json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "Email already exists" });
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, { httpOnly: true, sameSite: "lax" }).json({ ok: true });
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out the current user
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", (_req, res) => {
  res.clearCookie("token").json({ ok: true });
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the current user's profile
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/me", requireAuth, async (req, res) => {
  const uid = (req as any).auth.uid as string;
  const user = await User.findById(uid).select("_id email createdAt");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

export default router;
