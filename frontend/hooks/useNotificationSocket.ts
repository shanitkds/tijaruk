"use client";

import { useEffect, useRef } from "react";
import { AUTH_CHANGED_EVENT, AUTH_STORAGE_KEY } from "../lib/auth";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";

function getAccessToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw =
      window.localStorage.getItem(AUTH_STORAGE_KEY) ||
      window.sessionStorage.getItem(AUTH_STORAGE_KEY) ||
      "";
    return raw ? JSON.parse(raw)?.access || "" : "";
  } catch {
    return "";
  }
}

export function useNotificationSocket(onNewNotification: () => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const onNewNotificationRef = useRef(onNewNotification);
  onNewNotificationRef.current = onNewNotification;

  useEffect(() => {
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      // Always read the freshest token so reconnects after a silent
      // Axios token-refresh use the new access token, not the stale one.
      const token = getAccessToken();
      if (!token) return;

      const ws = new WebSocket(`${WS_BASE_URL}/ws/notifications/?token=${token}`);
      wsRef.current = ws;

      ws.onerror = () => {
        console.warn("[WS] WebSocket error — will reconnect after close");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_notification") {
            onNewNotificationRef.current();
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!destroyed) {
          // Reconnect after 3 s — getAccessToken() inside connect() will pick
          // up any refreshed token that Axios stored while we were connected.
          setTimeout(connect, 3000);
        }
      };
    }

    connect();

    // When the Axios interceptor silently refreshes the token it calls
    // setAuthSession() which dispatches AUTH_CHANGED_EVENT. Replace the
    // current WebSocket immediately so the next server message is accepted.
    function handleAuthChange() {
      wsRef.current?.close();
    }
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);

    return () => {
      destroyed = true;
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
      wsRef.current?.close();
    };
  }, []);
}
