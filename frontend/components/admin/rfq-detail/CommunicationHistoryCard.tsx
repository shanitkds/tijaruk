// @ts-nocheck
"use client";

import React, { useEffect, useRef } from "react";
import { MessageSquare, Send } from "lucide-react";

interface CommunicationHistoryCardProps {
  allMessages: any[];
  chatInput: string;
  setChatInput: (val: string) => void;
  attachedFiles: { name: string; size: string }[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<{ name: string; size: string }[]>>;
  attachFileInputRef: React.RefObject<HTMLInputElement>;
  handleAttachFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: (e: React.FormEvent) => void;
}

export default function CommunicationHistoryCard({
  allMessages,
  chatInput,
  setChatInput,
  handleSendMessage,
}: CommunicationHistoryCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [allMessages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;
      if (!atTop && !atBottom) e.preventDefault();
      el.scrollTop += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="bg-white rounded-[20px] border border-[#eef0f3] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
        <div className="w-8 h-8 rounded-lg bg-[#500c56]/10 flex items-center justify-center text-[#500c56]">
          <MessageSquare className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-gray-900 text-sm">Communication History</h3>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="min-h-[200px] max-h-[420px] overflow-y-auto space-y-4 px-6 py-5 bg-[#f9fafb]"
      >
        {allMessages.length === 0 ? (
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e5e7eb]" />
            <span className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-[10px] text-[#9ca3af]">
              No messages yet
            </span>
            <span className="h-px flex-1 bg-[#e5e7eb]" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-[#e5e7eb]" />
              <span className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-[10px] text-[#9ca3af]">
                Conversation history
              </span>
              <span className="h-px flex-1 bg-[#e5e7eb]" />
            </div>

            {allMessages.map((message) => {
              const fromAdmin = message.role === "Admin";
              const initial = (message.sender || "?")[0].toUpperCase();

              return (
                <div
                  className={`flex gap-3 ${fromAdmin ? "justify-end" : "justify-start"}`}
                  key={message._id}
                >
                  {!fromAdmin && (
                    <div className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#500c56] text-[10px] font-bold text-white overflow-hidden">
                      {message.avatar ? (
                        <img src={message.avatar} alt={message.sender} className="w-full h-full object-cover" />
                      ) : (
                        initial
                      )}
                    </div>
                  )}
                  <div className={`max-w-[86%] sm:max-w-[70%] ${fromAdmin ? "text-right" : ""}`}>
                    <p className="mb-1 text-[10px] text-[#9ca3af]">
                      {fromAdmin ? "Admin" : message.sender} - {message.time}
                    </p>
                    <div
                      className={`rounded-2xl px-4 py-3 text-left text-xs leading-5 shadow-sm ${
                        fromAdmin
                          ? "rounded-br-none bg-[#500c56] text-white"
                          : "rounded-tl-none border border-[#e5e7eb] bg-white text-[#374151]"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSendMessage}
        className="shrink-0 border-t border-[#e5e7eb] bg-white p-3 sm:px-6 sm:py-4"
      >
        <div className="flex items-center gap-2">
          <label className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3">
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage(e as any);
              }}
              placeholder="Type a reply..."
              type="text"
              value={chatInput}
            />
          </label>
          <button
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#500c56] text-white shadow-md disabled:opacity-50"
            disabled={!chatInput.trim()}
            type="submit"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
