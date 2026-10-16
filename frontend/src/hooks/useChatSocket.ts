import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// VITE_API_URL points to e.g. http://localhost:3000/api — the socket.io server
// lives at the origin, so strip the `/api` suffix.
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

export interface ChatSocketHandlers {
  onNewMessage?: (message: unknown) => void;
  onMessagesRead?: (data: { userId: string }) => void;
}

export function useChatSocket(
  userId: string | undefined,
  conversationId: string | undefined,
  handlers: ChatSocketHandlers,
) {
  const socketRef = useRef<Socket | null>(null);
  // Latest handlers without re-connecting on every render.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // One connection per user — reconnects if userId changes.
  useEffect(() => {
    if (!userId) return;

    const socket = io(`${SOCKET_URL}/chat`, {
      query: { userId },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('new_message', (msg) => handlersRef.current.onNewMessage?.(msg));
    socket.on('messages_read', (data) => handlersRef.current.onMessagesRead?.(data));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // Join/leave the active conversation room.
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId) return;

    const join = () => socket.emit('join_conversation', { conversationId });
    if (socket.connected) join();
    else socket.once('connect', join);

    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.off('connect', join);
    };
  }, [conversationId]);
}
