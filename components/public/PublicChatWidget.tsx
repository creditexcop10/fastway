"use client";

import { useEffect, useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Smile } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { toast } from "sonner";

export function PublicChatWidget() {
  const supabase = createSupabaseBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [anonName, setAnonName] = useState<string | null>(null);
  const [leadForm, setLeadForm] = useState({ name: "", email: "" });
  const [showPicker, setShowPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedRoom = localStorage.getItem("fws_chat_room");
    const storedName = localStorage.getItem("fws_chat_name");
    if (storedRoom && storedName) {
      setRoomId(storedRoom);
      setAnonName(storedName);
      fetchMessages(storedRoom);
    }
  }, []);

  const fetchMessages = async (id: string) => {
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", id)
      .order("created_at", { ascending: true });
    setMessages(msgs || []);
  };

  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`public_room:${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, supabase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: newRoom, error: roomErr } = await supabase
      .from("chat_rooms")
      .insert({ anon_name: leadForm.name, anon_email: leadForm.email, status: "open" })
      .select("id")
      .single();

    // This will show us the EXACT error from Supabase
    if (roomErr) { 
      toast.error("DB Error: " + roomErr.message); 
      return; 
    }

    if (newRoom) {
      localStorage.setItem("fws_chat_room", newRoom.id);
      localStorage.setItem("fws_chat_name", leadForm.name);
      setRoomId(newRoom.id);
      setAnonName(leadForm.name);
      
      const { error: msgErr } = await supabase.from("chat_messages").insert({
        room_id: newRoom.id,
        sender_id: null,
        message: `Hi, I'm ${leadForm.name}. I need some help.`,
      });
      if (msgErr) toast.error("Message Error: " + msgErr.message);
    }
  };;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !roomId) return;

    await supabase.from("chat_messages").insert({
      room_id: roomId,
      sender_id: null,
      message: input,
    });
    setInput("");
    setShowPicker(false);
  };

  const onEmojiClick = (emojiObject: any) => {
    setInput((prev) => prev + emojiObject.emoji);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 hover:bg-accent/90 p-0"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[60vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className="p-4 border-b bg-primary text-primary-foreground">
              <h3 className="font-heading font-bold">Fastway Support</h3>
              <p className="text-xs text-primary-foreground/70">
                {anonName ? `Logged in as ${anonName}` : "We typically reply in a few minutes"}
              </p>
            </div>

            {!roomId ? (
              <div className="flex-1 p-6 flex flex-col justify-center">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Please provide your name and email so we can assist you.
                </p>
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <Input 
                    placeholder="Your Name" 
                    required 
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                  />
                  <Input 
                    type="email" 
                    placeholder="Your Email" 
                    required 
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                  />
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Start Chat
                  </Button>
                </form>
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 p-4 space-y-3 overflow-y-auto bg-muted/30">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === null ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                        msg.sender_id === null 
                          ? "bg-accent text-accent-foreground rounded-br-sm" 
                          : "bg-background border rounded-bl-sm"
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                {showPicker && (
                  <div className="absolute bottom-16 right-0 z-50 shadow-xl">
                    <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} width={300} height={400} />
                  </div>
                )}

                <form onSubmit={handleSend} className="p-3 border-t flex gap-2 bg-background relative">
                  <Button type="button" size="icon" variant="ghost" onClick={() => setShowPicker(!showPicker)} className="text-muted-foreground hover:text-accent">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}