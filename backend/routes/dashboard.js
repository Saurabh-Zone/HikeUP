const express=require("express");
const {Booking,Review,User}=require("../models");
const {authMiddleware,requireRole}=require("../utils/auth");
const router=express.Router();
router.get("/customer",authMiddleware,requireRole("customer"),async(req,res)=>{
 const bookings=await Booking.find({customerId:req.user.userId}).populate("serviceId").sort({createdAt:-1});
 res.json({totalBookings:bookings.length,completedBookings:bookings.filter(b=>b.status==="completed").length,pendingBookings:bookings.filter(b=>b.status==="pending").length,totalSpent:bookings.filter(b=>b.paymentStatus==="completed").reduce((s,b)=>s+b.price,0),recentBookings:bookings.slice(0,5)});
});
router.get("/worker",authMiddleware,requireRole("worker"),async(req,res)=>{
 const bookings=await Booking.find({workerId:req.user.userId}).populate("serviceId").populate("customerId","name");
 const reviews=await Review.find({revieweeId:req.user.userId});
 const user=await User.findById(req.user.userId);
 res.json({totalBookings:bookings.length,completedBookings:bookings.filter(b=>b.status==="completed").length,activeBookings:bookings.filter(b=>["accepted","on_the_way","in_progress"].includes(b.status)).length,totalEarnings:bookings.filter(b=>b.paymentStatus==="completed").reduce((s,b)=>s+b.price,0),avgRating:user.rating,totalReviews:reviews.length,isVerified:user.isVerified,recentBookings:bookings.slice(0,5)});
});
router.get("/admin",authMiddleware,requireRole("admin"),async(req,res)=>{
 const [users,bookings,workers,customers]=await Promise.all([User.countDocuments(),Booking.countDocuments(),User.countDocuments({role:"worker"}),User.countDocuments({role:"customer"})]);
 res.json({users,bookings,workers,customers});
});
module.exports=router;
