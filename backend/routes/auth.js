const express = require("express");
const { User } = require("../models");
const { hashPassword, verifyPassword, generateToken, authMiddleware } = require("../utils/auth");
const router = express.Router();

const publicUser = u => ({
  _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role,
  service: u.service, experience: u.experience, latitude: u.latitude, longitude: u.longitude,
  address: u.address, isAvailable: u.isAvailable, isVerified: u.isVerified,
  rating: u.rating, totalReviews: u.totalReviews
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, role, service, experience } = req.body;
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) return res.status(400).json({ message: "Name, email, phone and password are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });
    if (!["customer", "worker"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    if (role === "worker" && !service) return res.status(400).json({ message: "Worker service is required" });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({
      role, name: name.trim(), email: email.toLowerCase(), phone: phone.trim(),
      password: await hashPassword(password), service: service || "", experience: experience || ""
    });
    const token = generateToken(user);
    res.status(201).json({ message: "Account created", token, user: publicUser(user) });
  } catch (e) {
    res.status(500).json({ message: "Signup failed", error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await verifyPassword(password || "", user.password))) return res.status(401).json({ message: "Invalid email or password" });
    if (role && user.role !== role) return res.status(403).json({ message: `This account is registered as ${user.role}` });
    const token = generateToken(user);
    res.json({ message: "Login successful", token, user: publicUser(user) });
  } catch (e) {
    res.status(500).json({ message: "Login failed", error: e.message });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

module.exports = router;
