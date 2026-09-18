const express = require("express");
const { User } = require("../models");
const { authMiddleware, requireRole } = require("../utils/auth");
const router = express.Router();

router.get("/", authMiddleware, requireRole("admin"), async (req, res) => {
  const { role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
  res.json({ users: await User.find(filter).select("-password").sort({ createdAt: -1 }) });
});

router.get("/workers", authMiddleware, async (req, res) => {
  const { service } = req.query;
  const filter = { role: "worker" };
  if (service) filter.service = new RegExp(`^${service}$`, "i");
  res.json({ workers: await User.find(filter).select("-password").sort({ rating: -1 }) });
});

router.put("/me", authMiddleware, async (req, res) => {
  const allowed = ["name", "phone", "bio", "latitude", "longitude", "address", "city", "state", "service", "experience", "isAvailable"];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];
  update.updatedAt = new Date();
  const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true }).select("-password");
  res.json({ user });
});

router.delete("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

router.put("/:id/verify", authMiddleware, requireRole("admin"), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isVerified: !!req.body.isVerified }, { new: true }).select("-password");
  res.json({ user });
});

module.exports = router;
