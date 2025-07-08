import { io } from "socket.io-client";

const socket = io("http://192.168.180.19:5000", {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
