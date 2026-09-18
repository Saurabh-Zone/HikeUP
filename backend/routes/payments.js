const express=require("express");
const Stripe=require("stripe");
const {Payment,Booking}=require("../models");
const {authMiddleware}=require("../utils/auth");
const router=express.Router();

router.post("/create-intent",authMiddleware,async(req,res)=>{
 try{
  const booking=await Booking.findById(req.body.bookingId);
  if(!booking) return res.status(404).json({message:"Booking not found"});
  if(booking.customerId.toString()!==req.user.userId) return res.status(403).json({message:"Not allowed"});
  if(!process.env.STRIPE_SECRET_KEY) return res.status(503).json({message:"Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env"});
  const stripe=Stripe(process.env.STRIPE_SECRET_KEY);
  const intent=await stripe.paymentIntents.create({amount:Math.round(booking.price*100),currency:"inr",metadata:{bookingId:booking._id.toString()}});
  const payment=await Payment.create({bookingId:booking._id,customerId:booking.customerId,workerId:booking.workerId,amount:booking.price,stripePaymentId:intent.id});
  res.json({clientSecret:intent.client_secret,paymentId:payment._id});
 }catch(e){res.status(500).json({message:"Payment setup failed",error:e.message})}
});
router.post("/confirm",authMiddleware,async(req,res)=>{
 try{
  const payment=await Payment.findById(req.body.paymentId);
  if(!payment || payment.customerId.toString()!==req.user.userId) return res.status(404).json({message:"Payment not found"});
  if(!process.env.STRIPE_SECRET_KEY) return res.status(503).json({message:"Stripe is not configured"});
  const stripe=Stripe(process.env.STRIPE_SECRET_KEY);
  const intent=await stripe.paymentIntents.retrieve(payment.stripePaymentId);
  if(intent.status!=="succeeded") return res.status(400).json({message:"Payment has not succeeded"});
  payment.status="completed"; payment.completedAt=new Date(); await payment.save();
  const booking=await Booking.findByIdAndUpdate(payment.bookingId,{paymentStatus:"completed",paymentId:intent.id},{new:true});
  res.json({booking});
 }catch(e){res.status(500).json({message:"Payment confirmation failed",error:e.message})}
});
router.get("/booking/:bookingId",authMiddleware,async(req,res)=>{
 const p=await Payment.findOne({bookingId:req.params.bookingId});
 if(!p)return res.status(404).json({message:"Payment not found"});
 res.json({payment:p});
});
module.exports=router;
