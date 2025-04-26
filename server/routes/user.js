import express from "express";
import User from "../models/User.js";
import { verifyToken, checkRole } from "../middleware/auth.js";

const router = express.Router();

// Get all users [admin]
router.get("/", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get all agents [admin]
router.get("/agents", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    console.log("Fetching agents..."); // Debug log
    const agents = await User.find({ role: "agent" }).select("-password");
    console.log("Agents fetched:", agents); // Debug log
    res.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error); // Debug log
    res.status(500).json({ message: "Error fetching agents" });
  }
});

// Get user by ID [admin]
router.get("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Edit user [user can update their info]
router.patch("/me", verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
    }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
});

// Delete user [admin]
router.delete("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Create user [admin]
router.post("/create", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

export default router;