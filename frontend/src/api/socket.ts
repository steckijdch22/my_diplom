import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "../utils/constans";

export const socket: Socket = io(BACKEND_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"],
});
