"use client";

import { useEffect, useState } from "react";
import api from "../../api/axios";
import MessageChatPanel from "./MessageChatPanel";
import MessageConversationList from "./MessageConversationList";
import type { UserChatMessage, UserConversation } from "./userDashboardData";
import { dashboardToast } from "../admin/AdminToast";

type ApiConversation = {
  id: number;
  title: string;
  status: string;
  last_message_at: string | null;
  last_message_preview: string | null;
};

type ApiMessage = {
  id: number;
  sender: number;
  content: string;
  created_at: string;
};

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function UserMessagesPage() {
  const [conversations, setConversations] = useState<UserConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<UserChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [meRes, convRes] = await Promise.all([
          api.get<{ id: number }>("/accounts/me/"),
          api.get<ApiConversation[]>("/messages/conversations/"),
        ]);

        if (!mounted) return;

        setCurrentUserId(meRes.data.id);

        const mapped: UserConversation[] = convRes.data.map((c) => ({
          id: c.id,
          company: "Support Team",
          contact: c.title || "Support",
          role: "Support",
          preview: c.last_message_preview || "",
          time: formatTime(c.last_message_at),
          avatar: "/favicon.svg",
          unread: 0,
          online: true,
        }));

        setConversations(mapped);
        if (mapped.length > 0) setActiveConversationId(mapped[0].id);
      } catch {
        dashboardToast.error("Unable to load conversations", "Please refresh the page.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!activeConversationId || currentUserId === null) return;

    let mounted = true;

    api.get<ApiMessage[]>(`/messages/conversations/${activeConversationId}/messages/`)
      .then(({ data }) => {
        if (!mounted) return;
        setMessages(
          data.map((m) => ({
            id: m.id,
            text: m.content,
            time: formatTime(m.created_at),
            sender: m.sender === currentUserId ? "user" : "contact",
          }))
        );
      })
      .catch(() => {
        if (mounted) {
          setMessages([]);
          dashboardToast.error("Unable to load messages", "Please try again.");
        }
      });

    return () => { mounted = false; };
  }, [activeConversationId, currentUserId]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? conversations[0];

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-68px)] items-center justify-center text-sm text-[#9ca3af]">
        Loading conversations…
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-[calc(100dvh-68px)] items-center justify-center text-sm text-[#9ca3af]">
        No conversations yet.
      </div>
    );
  }

  return (
    <section className="grid h-[calc(100dvh-68px)] min-h-0 min-w-0 max-w-full overflow-hidden bg-white sm:grid-cols-[240px_minmax(0,1fr)] md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className={`min-h-0 overflow-hidden ${mobileChatOpen ? "hidden sm:block" : "block"}`}>
        <MessageConversationList
          activeConversationId={activeConversationId ?? 0}
          conversations={conversations}
          onSelectConversation={(id) => {
            setActiveConversationId(id);
            setMobileChatOpen(true);
          }}
        />
      </div>
      <div className={`min-h-0 overflow-hidden ${mobileChatOpen ? "block" : "hidden sm:block"}`}>
        {activeConversation && (
          <MessageChatPanel
            conversation={activeConversation}
            conversationId={activeConversation.id}
            initialMessages={messages}
            onBack={() => setMobileChatOpen(false)}
          />
        )}
      </div>
    </section>
  );
}
