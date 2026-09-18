const express = require("express");
const { Booking, Service, BookingStatus, WorkerAllocation, User } = require("../models");
const { authMiddleware, requireRole } = require("../utils/auth");
const { sortNearbyWorkers, estimateArrivalMinutes } = require("../utils/location");
const router = express.Router();

async function logStatus(bookingId, status, userId, notes="") {
  return BookingStatus.create({ bookingId, status, updatedBy: userId, notes });
}

router.post("/", authMiddleware, requireRole("customer"), async (req, res) => {
  try {
    const { serviceId, bookingDate, latitude, longitude, address, notes } = req.body;
    if (!serviceId || !bookingDate || latitude == null || longitude == null || !address) return res.status(400).json({ message: "Service, date, location and address are required" });
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) return res.status(404).json({ message: "Service not found" });
    const booking = await Booking.create({
      customerId: req.user.userId, serviceId, bookingDate,
      duration: service.estimatedDuration, price: service.basePrice,
      latitude, longitude, address, notes
    });
    await logStatus(booking._id, "pending", req.user.userId, "Booking created");
    res.status(201).json({ booking });
  } catch(e) { res.status(500).json({ message: "Failed to create booking", error: e.message }); }
});

router.get("/", authMiddleware, async (req,res) => {
  const filter = req.user.role === "customer" ? { customerId: req.user.userId }
    : req.user.role === "worker" ? { workerId: req.user.userId } : {};
  const bookings = await Booking.find(filter).populate("customerId","name email phone").populate("workerId","name email phone rating").populate("serviceId").sort({createdAt:-1});
  res.json({ bookings });
});

router.get("/:id", authMiddleware, async (req,res) => {
  const booking = await Booking.findById(req.params.id).populate("customerId","name email phone").populate("workerId","name email phone rating").populate("serviceId");
  if (!booking) return res.status(404).json({message:"Booking not found"});
  const allowed = req.user.role==="admin" || booking.customerId?._id.toString()===req.user.userId || booking.workerId?._id.toString()===req.user.userId;
  if (!allowed) return res.status(403).json({message:"Not allowed"});
  res.json({booking});
});

router.get("/:id/history", authMiddleware, async (req,res) => {
  res.json({ history: await BookingStatus.find({bookingId:req.params.id}).sort({timestamp:1}) });
});

router.get("/:id/nearby-workers", authMiddleware, requireRole("customer","admin"), async (req,res) => {
  const booking = await Booking.findById(req.params.id).populate("serviceId");
  if (!booking) return res.status(404).json({message:"Booking not found"});
  const workers = await User.find({ role:"worker", isAvailable:true, service:new RegExp(`^${booking.serviceId.category}$`,"i"), latitude:{$ne:null}, longitude:{$ne:null} }).select("-password");
  const nearby = sortNearbyWorkers(workers, booking.latitude, booking.longitude).slice(0,10).map(x => ({
    ...x.worker.toObject(), distanceInKm:x.distanceInKm, etaMinutes:estimateArrivalMinutes(x.distanceInKm)
  }));
  res.json({workers:nearby});
});

router.put("/:id/status", authMiddleware, async (req,res) => {
  const { status, notes="" } = req.body;
  const allowed = ["accepted","on_the_way","in_progress","completed","cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({message:"Invalid status"});
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({message:"Booking not found"});
  if (req.user.role==="customer" && booking.customerId.toString()!==req.user.userId) return res.status(403).json({message:"Not allowed"});
  if (req.user.role==="worker" && (!booking.workerId || booking.workerId.toString()!==req.user.userId)) return res.status(403).json({message:"Not allowed"});
  booking.status=status;
  if (status==="completed") { booking.completedAt=new Date(); if (booking.workerId) await User.findByIdAndUpdate(booking.workerId,{isAvailable:true}); }
  await booking.save();
  await logStatus(booking._id,status,req.user.userId,notes);
  const io=req.app.get("io");
  io.emit("booking-updated",{bookingId:booking._id.toString(),status});
  res.json({booking});
});

router.delete("/:id", authMiddleware, async (req,res) => {
  const booking=await Booking.findById(req.params.id);
  if(!booking) return res.status(404).json({message:"Booking not found"});
  if(req.user.role!=="admin" && booking.customerId.toString()!==req.user.userId) return res.status(403).json({message:"Not allowed"});
  booking.status="cancelled"; await booking.save(); await logStatus(booking._id,"cancelled",req.user.userId,"Cancelled");
  res.json({message:"Booking cancelled"});
});

module.exports=router;
