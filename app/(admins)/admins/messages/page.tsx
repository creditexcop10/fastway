"use client";

import { useEffect, useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Search, MessageSquare, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { toast } from "sonner";

export default function AdminMessagesPage() {
  const supabase = createSupabaseBrowserClient();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [adminId, setAdminId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setAdminId(user.id);

      const { data: roomsData, error: roomsError } = await supabase
        .from("chat_rooms")
        .select(`id, user_id, status, anon_name, anon_email, profiles (full_name)`)
        .order("created_at", { ascending: false });

      if (roomsError) {
        console.error("Error fetching rooms:", roomsError.message);
        toast.error("Error fetching rooms: " + roomsError.message);
      }

      if (roomsData) {
        setRooms(roomsData);
        if (roomsData.length > 0) handleSelectRoom(roomsData[0]);
      }
    };
    init();
  }, [supabase]);

  useEffect(() => {
    if (!activeRoom) return;

    const fetchMessages = async () => {
      const { data: msgs, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", activeRoom.id)
        .order("created_at", { ascending: true });
        
      if (error) {
        console.error("Error fetching admin messages:", error.message);
        toast.error("Error fetching messages: " + error.message);
      }
      setMessages(msgs || []);
    };
    fetchMessages();

    const channel = supabase
      .channel(`admin_room:${activeRoom.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${activeRoom.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom, supabase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSelectRoom = (room: any) => {
    setActiveRoom(room);
    setShowPicker(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeRoom || !adminId) return;

    const tempMsg = { id: Date.now(), room_id: activeRoom.id, sender_id: adminId, message: input, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);

    const { error } = await supabase.from("chat_messages").insert({ room_id: activeRoom.id, sender_id: adminId, message: input });
    if (error) toast.error(error.message);

    setInput("");
    setShowPicker(false);
  };

  const onEmojiClick = (emojiObject: any) => setInput((prev) => prev + emojiObject.emoji);

  const getRoomName = (room: any) => {
    // Check if it's an array (1-to-many) or an object (1-to-1)
    const profileName = Array.isArray(room.profiles) 
      ? room.profiles[0]?.full_name 
      : room.profiles?.full_name;
      
    return profileName || room.anon_name || "Unknown User";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">Customer Messages</h1>
        <p className="text-muted-foreground">Respond to customer inquiries in real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        <div className="md:col-span-1 border rounded-2xl bg-card overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search chats..." className="pl-9 bg-muted border-0" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">No active conversations.</p>
            ) : (
              rooms.map((room) => (
                <button key={room.id} onClick={() => handleSelectRoom(room)} className={cn("w-full text-left p-4 border-b flex items-center gap-3 hover:bg-muted/50 transition-colors", activeRoom?.id === room.id && "bg-muted")}>
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{getRoomName(room).charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="font-medium text-primary text-sm">{getRoomName(room)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{room.status}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-2 border rounded-2xl bg-card overflow-hidden flex flex-col">
          {activeRoom ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{getRoomName(activeRoom).charAt(0).toUpperCase()}</div>
                <div>
                  <p className="font-medium text-primary">{getRoomName(activeRoom)}</p>
                  <p className="text-xs text-green-500 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Active</p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 p-4 space-y-3 overflow-y-auto bg-muted/30">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === adminId ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.sender_id === adminId ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-background border rounded-bl-sm"}`}>{msg.message}</div>
                  </div>
                ))}
              </div>

              <div className="relative">
                {showPicker && <div className="absolute bottom-16 right-4 z-50 shadow-xl"><EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} width={300} height={400} /></div>}
                <form onSubmit={handleSend} className="p-3 border-t flex gap-2 bg-background">
                  <Button type="button" size="icon" variant="ghost" onClick={() => setShowPicker(!showPicker)} className="text-muted-foreground hover:text-accent"><Smile className="h-5 w-5" /></Button>
                  <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your reply..." className="flex-1" />
                  <Button type="submit" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90"><Send className="h-4 w-4" /></Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground/50" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}