// server/src/routes/auth.ts
import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Email already exists
 */
router.post("/signup", async (req, res) => {
  // Extract email and password from the request body
  const { email, password } = req.body;

  // Hash the password for secure storage
  const password_hash = await bcrypt.hash(password, 10);
  try {
    // Create a new user in the database
    const user = await User.create({ email, password_hash });

    // Generate a JWT token for the user
    const token = jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: "7d" });

    // Set the token as an HTTP-only cookie and respond with success
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" }).json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "Email already exists" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
  // Extract email and password from the request body
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  // Compare the provided password with the stored hash
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  // Generate a JWT token for the user
  const token = jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: "7d" });

  // Set the token as an HTTP-only cookie and respond with success
  res.cookie("token", token, { httpOnly: true, sameSite: "lax" }).json({ ok: true });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", (_req, res) => {
  // Clear the authentication token cookie
  res.clearCookie("token").json({ ok: true });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", requireAuth, async (req, res) => {
  // Extract the user ID from the authentication payload
  const uid = (req as any).auth.uid as string;

  // Find the user by ID and select specific fields
  const user = await User.findById(uid).select("_id email createdAt");
  if (!user) return res.status(404).json({ error: "User not found" });

  // Respond with the user's profile
  res.json({ user });
});

export default router;
