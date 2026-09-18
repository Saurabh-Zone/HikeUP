import React from "react";
import {Navigate,Link,useNavigate} from "react-router-dom";
import {useAuth} from "./auth";
export function Protected({roles,children}){
 const {user,loading}=useAuth(); if(loading)return <div className="center">Loading...</div>;
 if(!user)return <Navigate to="/login/customer" replace/>;
 if(roles&&!roles.includes(user.role))return <Navigate to="/" replace/>;
 return children;
}
export function Nav(){
 const {user,logout}=useAuth(); const nav=useNavigate();
 return <header className="nav"><Link className="brand" to="/">⛰️ HikeUp</Link>
  <nav>{user&&<><Link to={user.role==="customer"?"/customer":user.role==="worker"?"/worker":"/admin"}>Dashboard</Link>{user.role==="customer"&&<Link to="/services">Services</Link>}</>}</nav>
  {user?<button className="ghost" onClick={()=>{logout();nav("/")}}>Logout</button>:<div><Link className="btn small" to="/login/customer">Login</Link></div>}
 </header>
}
export function ErrorBox({error}){return error?<div className="error">{error}</div>:null}
