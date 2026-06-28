import { createFileRoute, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Send, Search } from "lucide-react";
import {
  getChatRooms,
  getRoomMessages,
  sendMessage,
} from "../services/chat.service";
import { getSocket, joinRoom, leaveRoom } from "../lib/socket";

type SearchParams = { c?: string };

type ChatRoom = {
  room_id?: number;
  roomId?: number;
  participant_name?: string;
  participantName?: string;
  participant_id?: number;
  participantId?: number;
  participant_profile?: string;
  participantProfile?: string;
  buyer_id?: number;
  buyerId?: number;
  seller_id?: number;
  sellerId?: number;
  buyer_name?: string;
  buyerName?: string;
  seller_name?: string;
  sellerName?: string;
  buyer_profile?: string;
  buyerProfile?: string;
  seller_profile?: string;
  sellerProfile?: string;
  listing_title?: string;
  listingTitle?: string;
  listing_image?: string;
  listingImage?: string;
  last_message?: string;
  lastMessage?: string;
  last_message_timestamp?: string;
  lastMessageTimestamp?: string;
};

type ChatMessage = {
  message_id?: number;
  id?: number;
  sender_id?: number;
  senderId?: number;
  sender_name?: string;
  senderName?: string;
  sender_profile?: string;
  senderProfile?: string;
  message?: string;
  text?: string;
  created_at?: string;
  time?: string;
};

export const Route = createFileRoute("/_employee/messages")({
  component: Messages,
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    c: typeof s.c === "string" ? s.c : undefined,
  }),
});

function Messages() {
  const { c } = Route.useSearch();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(c ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("ntpc.auth");
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setCurrentUserId(parsed?.user?.user_id ?? parsed?.user_id ?? null);
      } catch {
        setCurrentUserId(null);
      }
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (c) {
      setActiveRoomId(c);
    }
  }, [c]);

  useEffect(() => {
    if (!activeRoomId) return;
    loadMessages(activeRoomId);
    joinRoom(activeRoomId);

    return () => {
      leaveRoom(activeRoomId);
    };
  }, [activeRoomId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onMessage = (payload: ChatMessage) => {
      const normalizedPayload = {
        ...payload,
        message_id: payload.message_id ?? payload.id,
        sender_id: payload.sender_id ?? payload.senderId,
        sender_name: payload.sender_name ?? payload.senderName ?? "",
        sender_profile: payload.sender_profile ?? payload.senderProfile ?? "",
        message: payload.message ?? payload.text ?? "",
        created_at:
          payload.created_at ?? payload.time ?? new Date().toISOString(),
      };

      setMessages((prev) => {
        if (
          prev.some(
            (message) =>
              String(message.message_id ?? message.id) ===
              String(normalizedPayload.message_id ?? normalizedPayload.id),
          )
        ) {
          return prev;
        }
        return [...prev, normalizedPayload];
      });
      void loadRooms();
    };

    socket.on("new-message", onMessage);
    return () => {
      socket.off("new-message", onMessage);
    };
  }, [activeRoomId]);

  function isUnauthorizedError(error: unknown) {
    return axios.isAxiosError(error) && error.response?.status === 401;
  }

  async function loadRooms() {
    try {
      const data = await getChatRooms();
      const normalized = Array.isArray(data) ? data : [];
      setRooms(normalized);
      if (!activeRoomId && normalized[0]) {
        const firstId = String(normalized[0].room_id ?? normalized[0].roomId);
        setActiveRoomId(firstId);
        navigate({
          to: "/messages",
          search: { c: firstId } as any,
          replace: true,
        });
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        navigate({ to: "/login" });
        return;
      }
      console.error("Failed to load chat rooms", err);
    }
  }

  async function loadMessages(roomId: string) {
    try {
      setLoading(true);
      const data = await getRoomMessages(roomId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        navigate({ to: "/login" });
        return;
      }
      console.error("Failed to load chat messages", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  const getDisplayName = (room: ChatRoom) => {
    return room.participant_name ?? room.participantName ?? "";
  };

  const filteredRooms = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rooms;
    return rooms.filter((room) => {
      const participant = getDisplayName(room).toLowerCase();
      const listing = (
        room.listing_title ??
        room.listingTitle ??
        ""
      ).toLowerCase();
      const lastMessage = (
        room.last_message ??
        room.lastMessage ??
        ""
      ).toLowerCase();
      return (
        participant.includes(term) ||
        listing.includes(term) ||
        lastMessage.includes(term)
      );
    });
  }, [rooms, search, currentUserId]);

  const activeRoom =
    filteredRooms.find(
      (room) => String(room.room_id ?? room.roomId) === activeRoomId,
    ) ??
    filteredRooms[0] ??
    null;

  const send = async () => {
    if (!activeRoomId || !draft.trim()) return;
    try {
      const sent = await sendMessage(activeRoomId, draft.trim());
      const auth = localStorage.getItem("ntpc.auth");
      let senderName = "";
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          senderName = parsed?.user?.name ?? parsed?.name ?? "";
        } catch {
          senderName = "";
        }
      }

      const nextMessage = {
        message_id: sent?.message_id ?? sent?.id,
        sender_id:
          sent?.sender_id ?? sent?.senderId ?? currentUserId ?? undefined,
        sender_name: sent?.sender_name ?? senderName,
        sender_profile: sent?.sender_profile ?? "",
        message: sent?.message ?? sent?.text ?? draft.trim(),
        created_at: sent?.created_at ?? sent?.time ?? new Date().toISOString(),
      };
      setMessages((prev) => [...prev, nextMessage]);
      setDraft("");
      await loadRooms();
    } catch (err) {
      if (isUnauthorizedError(err)) {
        navigate({ to: "/login" });
        return;
      }
      console.error("Failed to send message", err);
    }
  };

  if (!rooms.length && !loading) {
    return (
      <div className="ntpc-card overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-160px)]">
        <div className="border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages"
                className="ntpc-input pl-9"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-6 text-sm text-muted-foreground">
            No conversations yet
          </div>
        </div>
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          No conversations yet
        </div>
      </div>
    );
  }

  if (!activeRoom) return null;

  const roomId = String(activeRoom.room_id ?? activeRoom.roomId);
  const participantName = getDisplayName(activeRoom);
  const participantProfile =
    activeRoom.participant_profile ?? activeRoom.participantProfile ?? "";
  const listingTitle =
    activeRoom.listing_title ?? activeRoom.listingTitle ?? "";
  const lastMessage = activeRoom.last_message ?? activeRoom.lastMessage ?? "";

  function formatTimestamp(value: string) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    if (isYesterday) {
      return "Yesterday";
    }

    return date.toLocaleDateString([], { day: "2-digit", month: "short" });
  }

  return (
    <div className="ntpc-card overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-160px)]">
      <div className="border-r flex flex-col">
        <div className="p-3 border-b">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages"
              className="ntpc-input pl-9"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {filteredRooms.map((room) => {
            const roomKey = String(room.room_id ?? room.roomId);
            return (
              <button
                key={roomKey}
                onClick={() => {
                  setActiveRoomId(roomKey);
                  navigate({
                    to: "/messages",
                    search: { c: roomKey } as any,
                    replace: true,
                  });
                }}
                className={`w-full text-left p-3 flex gap-3 border-b hover:bg-muted ${roomKey === roomId ? "bg-primary-soft" : ""}`}
              >
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm shrink-0 overflow-hidden">
                  {(room.participant_profile ?? room.participantProfile) ? (
                    <img
                      src={room.participant_profile ?? room.participantProfile}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getDisplayName(room)
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm truncate">
                      {getDisplayName(room)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatTimestamp(
                        room.last_message_timestamp ??
                          room.lastMessageTimestamp ??
                          "",
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {room.listing_title ?? room.listingTitle ?? ""}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {room.last_message ?? room.lastMessage ?? ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold overflow-hidden">
            {participantProfile ? (
              <img
                src={participantProfile}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              participantName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join("")
            )}
          </div>
          <div>
            <div className="font-semibold text-sm">{participantName}</div>
            <div className="text-xs text-muted-foreground">{listingTitle}</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-background">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Start the conversation
            </div>
          ) : (
            messages.map((m) => {
              const messageText = m.message ?? m.text ?? "";
              const isMine =
                Number(m.sender_id ?? m.senderId) === Number(currentUserId);
              return (
                <div
                  key={m.message_id ?? m.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col`}
                  >
                    {!isMine && (m.sender_name ?? "") ? (
                      <div className="text-[11px] font-medium text-muted-foreground mb-1">
                        {m.sender_name ?? ""}
                      </div>
                    ) : null}
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm ${isMine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-surface border rounded-bl-sm"}`}
                    >
                      {messageText}
                      <div
                        className={`text-[10px] mt-1 ${isMine ? "text-white/70" : "text-muted-foreground"}`}
                      >
                        {formatTimestamp(m.created_at ?? m.time ?? "")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="p-3 border-t flex gap-2"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="ntpc-input"
          />
          <button type="submit" className="ntpc-btn-primary">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
