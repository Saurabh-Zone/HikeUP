const express=require("express");
const {Review,User,Booking}=require("../models");
const {authMiddleware}=require("../utils/auth");
const router=express.Router();
router.post("/",authMiddleware,async(req,res)=>{
 const {bookingId,rating,review=""}=req.body;
 if(!bookingId || rating<1 || rating>5) return res.status(400).json({message:"Valid booking and rating required"});
 const booking=await Booking.findById(bookingId);
 if(!booking || booking.customerId.toString()!==req.user.userId || booking.status!=="completed" || !booking.workerId) return res.status(400).json({message:"Review is available after a completed booking"});
 if(await Review.findOne({bookingId})) return res.status(409).json({message:"Review already submitted"});
 const item=await Review.create({bookingId,reviewerId:req.user.userId,revieweeId:booking.workerId,rating,review});
 const reviews=await Review.find({revieweeId:booking.workerId});
 const avg=reviews.reduce((s,r)=>s+r.rating,0)/reviews.length;
 await User.findByIdAndUpdate(booking.workerId,{rating:Number(avg.toFixed(2)),totalReviews:reviews.length});
 booking.rating=rating; booking.review=review; await booking.save();
 res.status(201).json({review:item});
});
router.get("/user/:userId",async(req,res)=>res.json({reviews:await Review.find({revieweeId:req.params.userId}).populate("reviewerId","name").sort({createdAt:-1})}));
module.exports=router;
