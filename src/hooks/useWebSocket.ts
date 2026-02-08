import { useCallback, useEffect, useRef, useState } from "react";
import { WS_BASE_URL } from "@/lib/api";

/** Agentic Fitness App WebSocket: /ws/workout/{user_id} */
export type WSMessage = {
  type: string;
  state?: Record<string, unknown>;
  workout?: Record<string, unknown> | null;
  greeting_message?: string;
  message?: string;
  [key: string]: unknown;
};

export function useWebSocket(userId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const url = `${WS_BASE_URL}/ws/workout/${encodeURIComponent(userId)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSMessage;
        setMessages((prev) => [...prev, data]);
      } catch {
        setMessages((prev) => [...prev, { type: "text", message: event.data }]);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [userId]);

  /** Send USER_INPUT for natural language; backend expects { type: "USER_INPUT", content } */
  const send = useCallback((content: string | object) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    const payload =
      typeof content === "string"
        ? { type: "USER_INPUT", content }
        : content;
    wsRef.current.send(JSON.stringify(payload));
  }, []);

  const sendFinishWorkout = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "FINISH_WORKOUT" }));
    }
  }, []);

  const sendLogSet = useCallback((data: { exercise?: string; exercise_id?: string; weight?: number; reps?: number; rpe?: number }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "LOG_SET", data }));
    }
  }, []);

  const sendResetFatigue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "RESET_FATIGUE" }));
    }
  }, []);

  const sendLogRest = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "LOG_REST" }));
    }
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    messages,
    connected,
    send,
    sendFinishWorkout,
    sendLogSet,
    sendResetFatigue,
    sendLogRest,
    clearMessages,
  };
}
