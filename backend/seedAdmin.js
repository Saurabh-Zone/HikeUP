require("dotenv").config();
const mongoose=require("mongoose");
const {User,Service}=require("./models");
const {hashPassword}=require("./utils/auth");
async function seedServices(){
 const items=[
  ["Electrician","Electrician","Switches, wiring, fans and electrical repairs.",499,60],
  ["Plumber","Plumber","Leaks, taps, pipes and bathroom repairs.",399,60],
  ["Home Cleaning","Cleaner","Professional home cleaning service.",699,120],
  ["Painter","Painter","Wall painting and touch-up work.",999,180],
  ["Carpenter","Carpenter","Furniture repair and woodwork.",599,90],
  ["AC Repair","AC Repair","AC servicing and basic repairs.",799,90]
 ];
 for(const [name,category,description,basePrice,estimatedDuration] of items){
  if(!(await Service.exists({name}))) await Service.create({name,category,description,basePrice,estimatedDuration});
 }
}
(async()=>{
 await mongoose.connect(process.env.MONGO_URI);
 const email=(process.env.ADMIN_EMAIL||"admin@hikeup.local").toLowerCase();
 const password=process.env.ADMIN_PASSWORD||"Admin@12345";
 const existing=await User.findOne({email});
 if(!existing) await User.create({role:"admin",name:"HikeUp Admin",email,phone:"9999999999",password:await hashPassword(password),isVerified:true});
 await seedServices();
 console.log("Seed complete. Admin:",email);
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
