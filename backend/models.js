const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["customer", "worker", "admin"], required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  service: { type: String, default: "" },
  experience: { type: String, default: "" },
  bio: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  isAvailable: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  basePrice: { type: Number, required: true, min: 0 },
  estimatedDuration: { type: Number, required: true, min: 15 },
  image: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "on_the_way", "in_progress", "completed", "cancelled"],
    default: "pending"
  },
  bookingDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  notes: { type: String, default: "" },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, required: true },
  paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  paymentId: { type: String, default: "" },
  rating: { type: Number, default: null },
  review: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
});

const allocationSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["offered", "accepted", "rejected", "expired"], default: "offered" },
  distanceInKm: { type: Number, default: null },
  etaMinutes: { type: Number, default: null },
  allocationTime: { type: Date, default: Date.now },
  responseTime: { type: Date, default: null },
  rejectionReason: { type: String, default: "" }
});

const bookingStatusSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  status: { type: String, required: true },
  notes: { type: String, default: "" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  timestamp: { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  amount: { type: Number, required: true },
  currency: { type: String, default: "inr" },
  status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
  stripePaymentId: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
});

const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model("User", userSchema),
  Service: mongoose.model("Service", serviceSchema),
  Booking: mongoose.model("Booking", bookingSchema),
  WorkerAllocation: mongoose.model("WorkerAllocation", allocationSchema),
  BookingStatus: mongoose.model("BookingStatus", bookingStatusSchema),
  Payment: mongoose.model("Payment", paymentSchema),
  Review: mongoose.model("Review", reviewSchema)
};
