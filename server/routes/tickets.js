import express from "express";
import Ticket from "../models/Ticket.js";
import { checkRole } from "../middleware/auth.js";

const router = express.Router();

// Get all tickets (with filters)
router.get("/", async (req, res) => {
  try {
    const { status, priority, category, searchQuery } = req.query;
    const filter = {};

    // Apply filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    // Regular users can only see their own tickets
    if (req.user.role === "user") {
      filter.userId = req.user.userId;
    }

    const tickets = await Ticket.find(filter)
      .populate("userId", "name email")
      .populate("assignedToId", "name email")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets" });
  }
});

// Get single ticket
router.get("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("userId", "name email")
      .populate("assignedToId", "name email")
      .populate("comments.userId", "name email role");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    // Check if user has access to this ticket
    if (
      ticket.userId._id.toString() !== req.user.userId &&
      req.user.role !== "admin" &&
      req.user.role !== "agent"
    ) {
      return res.status(403).json({ message: "Access denied" });
    } else if (
      req.user.role === "agent" &&
      ticket.assignedToId._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ticket" });
  }
});

// Create ticket
router.post("/", async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const ticket = new Ticket({
      title,
      description,
      category,
      priority,
      userId: req.user.userId,
    });

    await ticket.save();

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error creating ticket" });
  }
});

// Update ticket
router.patch("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Only allow updates by ticket owner or staff
    if (
      req.user.role === "user" &&
      ticket.userId.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update allowed fields
    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      if (
        ["title", "description", "status", "priority", "category"].includes(key)
      ) {
        ticket[key] = updates[key];
      }
    });

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error updating ticket" });
  }
});

// Add comment
router.post("/:id/comments", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Only allow comments by ticket owner or staff
    if (
      req.user.role === "user" &&
      ticket.userId.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    ticket.comments.push({
      content: req.body.content,
      userId: req.user.userId,
    });

    await ticket.save();

    // Populate the new comment's user information
    const populatedTicket = await Ticket.findById(ticket._id).populate(
      "comments.userId",
      "name email role"
    );

    res
      .status(201)
      .json(populatedTicket.comments[populatedTicket.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment" });
  }
});

// Assign ticket (staff only)
router.patch("/:id/assign", checkRole(["admin", "agent"]), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.assignedToId = req.body.agentId;
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error assigning ticket" });
  }
});

export default router;
