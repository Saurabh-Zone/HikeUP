import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import {AuthProvider} from "./auth";
import {Protected,Nav} from "./components";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CustomerDashboard from "./pages/CustomerDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import BookingDetails from "./pages/BookingDetails";
import Payment from "./pages/Payment";
import Admin from "./pages/Admin";
import "./styles.css";
function App(){return <AuthProvider><Nav/><Routes>
 <Route path="/" element={<Home/>}/><Route path="/login/:role" element={<Login/>}/><Route path="/signup/:role" element={<Signup/>}/>
 <Route path="/customer" element={<Protected roles={["customer"]}><CustomerDashboard/></Protected>}/>
 <Route path="/worker" element={<Protected roles={["worker"]}><WorkerDashboard/></Protected>}/>
 <Route path="/services" element={<Protected roles={["customer"]}><Services/></Protected>}/>
 <Route path="/book/:serviceId" element={<Protected roles={["customer"]}><Booking/></Protected>}/>
 <Route path="/booking/:id" element={<Protected><BookingDetails/></Protected>}/>
 <Route path="/payment/:id" element={<Protected roles={["customer"]}><Payment/></Protected>}/>
 <Route path="/admin" element={<Protected roles={["admin"]}><Admin/></Protected>}/>
 </Routes></AuthProvider>}
createRoot(document.getElementById("root")).render(<BrowserRouter><App/></BrowserRouter>);
