import api from "../lib/api";

export async function getChatRooms() {
  const res = await api.get("/chat/rooms");
  return res.data ?? [];
}

export async function getRoomMessages(roomId: string | number) {
  const res = await api.get(`/chat/rooms/${roomId}/messages`);
  return res.data ?? [];
}

export async function sendMessage(roomId: string | number, message: string) {
  const res = await api.post(`/chat/rooms/${roomId}/messages`, { message });
  return res.data;
}

export async function createOrGetRoom(listingId: string | number) {
  const res = await api.post("/chat/rooms", { listing_id: listingId });
  return res.data;
}
