import type { DashboardMessage } from "./userDashboardData";

export default function MessageAvatar({ message }: { message: DashboardMessage }) {
  if (message.sender.toLowerCase() === "support team") {
    return (
      <span className="relative size-11 shrink-0">
        <span
          aria-label="Tijaruk Support Team avatar"
          className="block size-11 rounded-full bg-cover bg-center"
          role="img"
          style={{ backgroundImage: `url(${message.avatar})` }}
        />
        <span
          aria-label="Online"
          className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-[#39c96b]"
          role="status"
        />
      </span>
    );
  }

  if (message.avatar.startsWith("/")) {
    return (
      <span
        aria-label={`${message.sender} avatar`}
        className="size-11 shrink-0 rounded-full bg-cover bg-center"
        role="img"
        style={{ backgroundImage: `url(${message.avatar})` }}
      />
    );
  }

  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f4e7f5] text-xs font-bold text-[#65096c]">
      {message.avatar}
    </span>
  );
}
