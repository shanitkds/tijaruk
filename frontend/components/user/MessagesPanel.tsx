import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import MessageAvatar from "./MessageAvatar";
import SectionCard from "./SectionCard";
import type { DashboardMessage } from "./userDashboardData";

export default function MessagesPanel({ messages }: { messages: DashboardMessage[] }) {
  return (
    <SectionCard title="Messages">
      <div className="px-5 pb-5">
        <div className="divide-y divide-[#eeeeee]">
          {messages.map((message) => (
            <Link
              className="flex min-h-[74px] items-center gap-3 py-3"
              href="/user/messages"
              key={message.id}
            >
              <MessageAvatar message={message} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-base font-bold leading-6 text-[#111827]">{message.sender}</p>
                  <p className="shrink-0 text-xs font-medium leading-5 text-[#9ca3af]">{message.time}</p>
                </div>
                <p className="truncate text-sm leading-5 text-[#8b8fa3]">{message.preview}</p>
              </div>
            </Link>
          ))}
        </div>
        <Link
          className="mt-4 flex h-[50px] items-center justify-center gap-2 rounded-[10px] border border-[#e8e3e8] text-sm font-bold text-[#111827] transition hover:border-[#65096c] hover:text-[#65096c]"
          href="/user/messages"
        >
          <MessageSquarePlus aria-hidden="true" className="size-4" strokeWidth={1.8} />
          Start Conversation
        </Link>
      </div>
    </SectionCard>
  );
}
