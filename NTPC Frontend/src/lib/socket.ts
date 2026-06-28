import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const auth = window.localStorage.getItem("ntpc.auth");
    if (!auth) return null;

    const parsed = JSON.parse(auth);
    return typeof parsed?.token === "string" ? parsed.token : null;
  } catch {
    return null;
  }
}

export function getSocket() {
  if (typeof window === "undefined") return null;

  const token = getStoredToken();
  if (!token) return null;

  if (!socket) {
    socket = io("http://localhost:3000", {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  return socket;
}

export function joinRoom(roomId: string | number) {
  getSocket()?.emit("join-room", { roomId: String(roomId) });
}

export function leaveRoom(roomId: string | number) {
  getSocket()?.emit("leave-room", { roomId: String(roomId) });
}

export function sendSocketMessage(roomId: string | number, message: string) {
  getSocket()?.emit("send-message", { roomId: String(roomId), message });
}

export function setTyping(roomId: string | number, typing: boolean) {
  getSocket()?.emit(typing ? "typing" : "stop-typing", { roomId: String(roomId) });
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
