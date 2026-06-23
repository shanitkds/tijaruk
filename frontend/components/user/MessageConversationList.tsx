"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { UserConversation } from "./userDashboardData";

type ConversationFilter = "All" | "Unread" | "Starred" | "Archived";

export default function MessageConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: {
  conversations: UserConversation[];
  activeConversationId: number;
  onSelectConversation: (conversationId: number) => void;
}) {
  const [filter, setFilter] = useState<ConversationFilter>("All");
  const visibleConversations = useMemo(
    () =>
      filter === "Unread"
        ? conversations.filter((conversation) => conversation.unread > 0)
        : conversations,
    [conversations, filter],
  );

  return (
    <aside className="flex h-full min-h-0 flex-col border-b border-[#e5e7eb] bg-white sm:border-b-0 sm:border-r">
      <div className="border-b border-[#f1f3f5] p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#9ca3af]" />
          <input
            className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] pl-9 pr-3 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#65096c]"
            placeholder="Search conversations..."
            type="search"
          />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {(["All", "Unread", "Starred", "Archived"] as const).map((item) => (
            <button
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                filter === item ? "bg-[#65096c] text-white" : "bg-[#f3f4f6] text-[#6b7280]"
              }`}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
        {visibleConversations.map((conversation) => {
          const active = conversation.id === activeConversationId;
          const hasImage = conversation.avatar.startsWith("/");

          return (
            <button
              className={`flex w-full min-w-0 gap-3 border-b border-[#f1f3f5] p-4 text-left transition ${
                active ? "bg-white" : "hover:bg-[#f9fafb]"
              }`}
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              type="button"
            >
              <span
                className={`relative flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                  hasImage ? "bg-cover bg-center" : "bg-[#65096c]"
                }`}
                style={hasImage ? { backgroundImage: `url(${conversation.avatar})` } : undefined}
              >
                {hasImage ? null : conversation.avatar}
                {conversation.online ? (
                  <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-[#4ade80]" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="block min-w-0 flex-1 truncate text-sm font-bold text-[#111827]">
                    {conversation.company}
                  </span>
                  <span className="shrink-0 text-[10px] text-[#9ca3af]">{conversation.time}</span>
                </span>
                <span className="mt-1 block truncate text-xs text-[#9ca3af]">{conversation.preview}</span>
              </span>
              {conversation.unread ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#65096c] text-[10px] font-bold text-white">
                  {conversation.unread}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
