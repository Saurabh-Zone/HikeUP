require("dotenv").config();
const express=require("express");
const http=require("http");
const cors=require("cors");
const mongoose=require("mongoose");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:process.env.FRONTEND_URL||"http://localhost:5173",methods:["GET","POST","PUT","DELETE"]}});
app.set("io",io);

app.use(cors({origin:process.env.FRONTEND_URL||"http://localhost:5173"}));
app.use(express.json());

app.get("/api/health",(req,res)=>res.json({ok:true,service:"HikeUp API",time:new Date().toISOString()}));
app.use("/api/auth",require("./routes/auth"));
app.use("/api/users",require("./routes/users"));
app.use("/api/services",require("./routes/services"));
app.use("/api/bookings",require("./routes/bookings"));
app.use("/api/allocations",require("./routes/allocations"));
app.use("/api/dashboard",require("./routes/dashboard"));
app.use("/api/reviews",require("./routes/reviews"));
app.use("/api/payments",require("./routes/payments"));

io.on("connection",socket=>{
 socket.on("user-login",userId=>{ if(userId) socket.join(`user-${userId}`); });
 socket.on("worker-location",data=>{
  if(data?.workerId) io.emit("worker-location-updated",data);
 });
 socket.on("disconnect",()=>{});
});

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:"Server error"});});

const PORT=process.env.PORT||5000;
mongoose.connect(process.env.MONGO_URI||"mongodb://127.0.0.1:27017/hikeup")
 .then(()=>server.listen(PORT,()=>console.log(`HikeUp API: http://localhost:${PORT}`)))
 .catch(err=>{console.error("MongoDB connection failed:",err.message);process.exit(1)});