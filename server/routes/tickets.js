import express from "express";
import Ticket from "../models/Ticket.js";
import { checkRole } from "../middleware/auth.js";
import User from "../models/User.js";

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
      filter.assignedTo = req.user.userId;
    }

    const tickets = await Ticket.find(filter)
      .populate("owner", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.userId", "name email role")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error); // Debug log
    res.status(500).json({ message: "Error fetching tickets" });
  }
});

// Get all tickets (admin only)
router.get("/all", checkRole(["admin"]), async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("owner", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.userId", "name email role")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all tickets" });
  }
});

// Get tickets assigned to the logged-in agent
router.get("/assigned", checkRole(["agent"]), async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.user.userId })
      .populate("owner", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.userId", "name email role")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets assigned to you" });
  }
});

// Get tickets created by the logged-in agent
router.get("/created", checkRole(["agent"]), async (req, res) => {
  try {
    const tickets = await Ticket.find({ owner: req.user.userId })
      .populate("owner", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.userId", "name email role")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets you created" });
  }
});

// Get tickets created by the logged-in admin
router.get("/created", checkRole(["admin"]), async (req, res) => {
  try {
    const tickets = await Ticket.find({ owner: req.user.userId })
      .populate("owner", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.userId", "name email role")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets you created" });
  }
});

// Get single ticket
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching ticket with ID:", req.params.id);

    const ticket = await Ticket.findById(req.params.id)
      .populate("owner", "name email") // Populate the owner field
      .populate("assignedTo", "name email") // Populate the assignedTo field
      .populate("comments.userId", "name email role"); // Populate the userId in comments

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    console.log("Fetched ticket:", ticket);

    // Check if user has access to this ticket
    if (
      ticket.owner._id.toString() !== req.user.userId &&
      req.user.role !== "admin" &&
      req.user.role !== "agent"
    ) {
      return res.status(403).json({ message: "Access denied" });
    } else if (
      req.user.role === "agent" &&
      ticket.assignedTo._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Error fetching ticket" });
  }
});

// Create ticket (admin and agent only)
router.post("/", checkRole(["admin", "agent"]), async (req, res) => {
  try {
    const { title, description, category, priority, assignedTo } = req.body;

    // Ensure the assignedTo field is provided
    if (!assignedTo) {
      return res.status(400).json({ message: "AssignedTo ID is required to create a ticket" });
    }

    // Fetch the assigned user to check their role
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: "Assigned user not found" });
    }

    // If the logged-in user is an agent, ensure they cannot assign tickets to another agent
    if (req.user.role === "agent" && assignedUser.role === "agent") {
      return res.status(403).json({ message: "Agents cannot assign tickets to other agents" });
    }

    // Create the ticket
    const ticket = new Ticket({
      title,
      description,
      category,
      priority,
      owner: req.user.userId, // The logged-in admin or agent
      assignedTo // The user or agent the ticket is assigned to
    });

    await ticket.save();

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error); // Log the error
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
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("comments.userId", "name email role")
      .populate("owner", "name email")
      .populate("assignedTo", "name email");

    res
      .status(201)
      .json(populatedTicket.comments[populatedTicket.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment" });
  }
});

// Assign ticket (admin and agent only)
router.patch("/:id/assign", checkRole(["admin", "agent"]), async (req, res) => {
  try {
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required to assign a ticket" });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.assignedToId = agentId;
    await ticket.save();

    // Populate the assigned user's details
    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("assignedToId", "name email")
      .populate("owner", "name email")
      .populate("comments.userId", "name email role");

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error assigning ticket" });
  }
});

export default router;
