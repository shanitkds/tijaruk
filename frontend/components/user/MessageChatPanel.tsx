"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  Send,
  Smile,
} from "lucide-react";
import api from "../../api/axios";
import type { UserChatMessage, UserConversation } from "./userDashboardData";
import { dashboardToast } from "../admin/AdminToast";

export default function MessageChatPanel({
  conversation,
  conversationId,
  initialMessages,
  onBack,
}: {
  conversation: UserConversation;
  conversationId: number;
  initialMessages: UserChatMessage[];
  onBack: () => void;
}) {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const container = messagesContainerRef.current;

      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [conversation.id, messages]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  async function sendMessage() {
    const text = messageText.trim();
    if (!text) return;

    setMessageText("");
    const optimisticId = Date.now();
    setMessages((current) => [
      ...current,
      { id: optimisticId, sender: "user", time: "Now", text },
    ]);

    try {
      const { data } = await api.post(`/messages/conversations/${conversationId}/messages/`, { content: text });
      setMessages((current) =>
        current.map((m) =>
          m.id === optimisticId
            ? { id: data.id, sender: "user", time: new Date(data.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), text: data.content }
            : m
        )
      );
    } catch {
      setMessages((current) => current.filter((m) => m.id !== optimisticId));
      dashboardToast.error("Message not sent", "Please try again.");
    }
  }

  const hasAvatarImage = conversation.avatar.startsWith("/");
  const avatarStyle = hasAvatarImage ? { backgroundImage: `url(${conversation.avatar})` } : undefined;
  const avatarClassName = hasAvatarImage
    ? "bg-white bg-contain bg-center bg-no-repeat"
    : "bg-[#65096c]";

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#f9fafb]">
      <div className="flex shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Back to conversations"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#65096c] sm:hidden"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div
            className={`relative flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarClassName}`}
            style={avatarStyle}
          >
            {hasAvatarImage ? null : conversation.avatar}
            <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-[#4ade80]" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-[#111827]">{conversation.company}</h2>
            <p className="truncate text-xs text-[#9ca3af]">
              <span className="text-[#10b981]">Online</span>
            </p>
          </div>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 touch-pan-y space-y-4 overflow-y-scroll overscroll-y-contain px-4 py-5 sm:px-8"
        onWheel={(event) => {
          event.currentTarget.scrollTop += event.deltaY;
        }}
        ref={messagesContainerRef}
      >
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-[#e5e7eb]" />
          <span className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-[10px] text-[#9ca3af]">
            Today, July 15
          </span>
          <span className="h-px flex-1 bg-[#e5e7eb]" />
        </div>

        {messages.map((message) => {
          const fromUser = message.sender === "user";

          return (
            <div className={`flex gap-3 ${fromUser ? "justify-end" : "justify-start"}`} key={message.id}>
              {!fromUser ? (
                <div
                  className={`mt-5 flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarClassName}`}
                  style={avatarStyle}
                >
                  {hasAvatarImage ? null : conversation.avatar}
                </div>
              ) : null}
              <div className={`max-w-[86%] sm:max-w-[70%] ${fromUser ? "text-right" : ""}`}>
                <p className="mb-1 text-[10px] text-[#9ca3af]">
                  {fromUser ? "You" : "Support Team"} - {message.time}
                </p>
                <div
                  className={`rounded-2xl px-4 py-3 text-left text-xs leading-5 shadow-sm ${
                    fromUser
                      ? "rounded-br-none bg-[#65096c] text-white"
                      : "rounded-tl-none border border-[#e5e7eb] bg-white text-[#374151]"
                  }`}
                >
                  {message.text}
                </div>
                {message.attachment ? (
                  <button
                    className="mt-2 flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-3 text-left shadow-sm"
                    type="button"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-[#fee2e2] text-[#ef4444]">
                      <FileText className="size-4" />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold text-[#374151]">{message.attachment.name}</span>
                      <span className="block text-[10px] text-[#9ca3af]">{message.attachment.size}</span>
                    </span>
                    <Download className="ml-3 size-4 text-[#9ca3af]" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="z-20 shrink-0 border-t border-[#e5e7eb] bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:px-6 sm:py-4">
        <div className="flex items-center gap-2">
          <label className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3">
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
              onChange={(event) => setMessageText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder={`Type a message to ${conversation.contact}...`}
              type="text"
              value={messageText}
            />
            <Smile className="size-4 text-[#9ca3af]" />
          </label>
          <button
            aria-label="Send message"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#65096c] text-white shadow-md disabled:opacity-50"
            disabled={!messageText.trim()}
            onClick={sendMessage}
            type="button"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
