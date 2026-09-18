const express = require("express");
const { Booking, User, WorkerAllocation } = require("../models");
const { authMiddleware, requireRole } = require("../utils/auth");
const { sortNearbyWorkers, estimateArrivalMinutes } = require("../utils/location");
const router=express.Router();

router.post("/:bookingId/dispatch", authMiddleware, requireRole("customer","admin"), async (req,res)=>{
  const booking=await Booking.findById(req.params.bookingId).populate("serviceId");
  if(!booking) return res.status(404).json({message:"Booking not found"});
  if(req.user.role==="customer" && booking.customerId.toString()!==req.user.userId) return res.status(403).json({message:"Not allowed"});
  const workers=await User.find({role:"worker",isAvailable:true,service:new RegExp(`^${booking.serviceId.category}$`,"i"),latitude:{$ne:null},longitude:{$ne:null}});
  const nearby=sortNearbyWorkers(workers,booking.latitude,booking.longitude,15).slice(0,5);
  if(!nearby.length) return res.status(404).json({message:"No available nearby worker found"});
  const allocations=[];
  for(const item of nearby){
    const existing=await WorkerAllocation.findOne({bookingId:booking._id,workerId:item.worker._id,status:"offered"});
    if(!existing){
      allocations.push(await WorkerAllocation.create({
        bookingId:booking._id,workerId:item.worker._id,customerId:booking.customerId,
        distanceInKm:item.distanceInKm,etaMinutes:estimateArrivalMinutes(item.distanceInKm)
      }));
    }
  }
  const io=req.app.get("io");
  for(const a of allocations) io.to(`user-${a.workerId}`).emit("new-booking",{bookingId:booking._id.toString(),allocationId:a._id.toString(),distanceInKm:a.distanceInKm,etaMinutes:a.etaMinutes});
  res.json({message:"Worker requests dispatched",allocations});
});

router.get("/worker/pending",authMiddleware,requireRole("worker"),async(req,res)=>{
  const allocations=await WorkerAllocation.find({workerId:req.user.userId,status:"offered"}).populate({path:"bookingId",populate:{path:"serviceId"}}).populate("customerId","name phone");
  res.json({allocations});
});

router.put("/:allocationId/accept",authMiddleware,requireRole("worker"),async(req,res)=>{
  const allocation=await WorkerAllocation.findOne({_id:req.params.allocationId,workerId:req.user.userId,status:"offered"});
  if(!allocation) return res.status(404).json({message:"Request not found or already handled"});
  const booking=await Booking.findById(allocation.bookingId);
  if(!booking || booking.workerId) return res.status(409).json({message:"Booking is already assigned"});
  allocation.status="accepted"; allocation.responseTime=new Date(); await allocation.save();
  booking.workerId=req.user.userId; booking.status="accepted"; await booking.save();
  await WorkerAllocation.updateMany({bookingId:booking._id,_id:{$ne:allocation._id},status:"offered"},{$set:{status:"expired",responseTime:new Date()}});
  await require("../models").BookingStatus.create({bookingId:booking._id,status:"accepted",updatedBy:req.user.userId,notes:"Worker accepted allocation"});
  await User.findByIdAndUpdate(req.user.userId,{isAvailable:false});
  const io=req.app.get("io");
  io.to(`user-${booking.customerId}`).emit("booking-accepted",{bookingId:booking._id.toString(),workerId:req.user.userId});
  res.json({message:"Booking accepted",booking});
});

router.put("/:allocationId/reject",authMiddleware,requireRole("worker"),async(req,res)=>{
  const allocation=await WorkerAllocation.findOneAndUpdate(
    {_id:req.params.allocationId,workerId:req.user.userId,status:"offered"},
    {status:"rejected",responseTime:new Date(),rejectionReason:req.body.reason||"Worker declined"},
    {new:true}
  );
  if(!allocation) return res.status(404).json({message:"Request not found"});
  res.json({message:"Request rejected"});
});

module.exports=router;
