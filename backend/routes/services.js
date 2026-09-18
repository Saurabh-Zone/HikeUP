const express = require("express");
const { Service } = require("../models");
const { authMiddleware, requireRole } = require("../utils/auth");
const router = express.Router();

router.get("/", async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ services });
});
router.get("/all", authMiddleware, requireRole("admin"), async (req, res) => {
  res.json({ services: await Service.find().sort({ createdAt: -1 }) });
});
router.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
  const { name, category, description, basePrice, estimatedDuration, image } = req.body;
  if (!name || !category || basePrice == null || !estimatedDuration) return res.status(400).json({ message: "Name, category, price and duration are required" });
  const service = await Service.create({ name, category, description, basePrice, estimatedDuration, image });
  res.status(201).json({ service });
});
router.put("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!service) return res.status(404).json({ message: "Service not found" });
  res.json({ service });
});
router.delete("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: "Service deleted" });
});
module.exports = router;
