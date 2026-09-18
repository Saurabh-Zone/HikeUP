import {io} from "socket.io-client";
import {getToken} from "./api";
let socket;
export function connectSocket(userId){
 if(!userId)return null;
 socket=io(import.meta.env.VITE_SOCKET_URL||"http://localhost:5000");
 socket.on("connect",()=>socket.emit("user-login",userId));
 return socket;
}
export function disconnectSocket(){socket?.disconnect();socket=null}
export function getSocket(){return socket}
