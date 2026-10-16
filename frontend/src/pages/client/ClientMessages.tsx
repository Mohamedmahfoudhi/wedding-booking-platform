import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { messagesApi } from '../../api/client';
import { useAppSelector } from '../../store/hooks';
import { useChatSocket } from '../../hooks/useChatSocket';
import { Conversation, Message } from '../../types';

export default function ClientMessages() {
  const [searchParams] = useSearchParams();
  const toast = useRef<Toast>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector((state) => state.auth);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const handledProviderParamRef = useRef<string | null>(null);
  useEffect(() => {
    // Wait for the initial conversations fetch to finish — otherwise we can't
    // tell "no match yet because the list is empty" from "no match because
    // it's still loading", and we'd create duplicates.
    if (loading) return;

    const providerId = searchParams.get('provider');
    if (!providerId) return;

    // Only act on each distinct ?provider= value once per mount so we don't
    // re-create or re-select when `conversations` updates.
    if (handledProviderParamRef.current === providerId) return;
    handledProviderParamRef.current = providerId;

    const existing = conversations.find((c) => c.provider?.id === providerId);
    if (existing) {
      setSelectedConversation(existing);
    } else {
      startNewConversation(providerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversations, loading]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleIncomingMessage = useCallback(
    (payload: unknown) => {
      const message = payload as Message | undefined;
      if (!message?.id) return;

      // Only append if it belongs to the currently open conversation.
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
        if (message.sender?.id !== user?.id) {
          messagesApi.markAsRead(selectedConversation.id).catch(() => {});
        }
      }

      // Bump the conversation to the top of the sidebar with a fresh timestamp.
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === message.conversationId);
        if (idx < 0) return prev;
        const updated: Conversation = {
          ...prev[idx],
          lastMessageAt: message.createdAt ?? new Date().toISOString(),
        };
        return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
      });
    },
    [selectedConversation, user?.id],
  );

  useChatSocket(user?.id, selectedConversation?.id, {
    onNewMessage: handleIncomingMessage,
  });

  const loadConversations = async () => {
    try {
      const response = await messagesApi.getConversations();
      const list: Conversation[] = response.data.data?.conversations || [];
      setConversations(list);
      if (!selectedConversation && list.length > 0) {
        setSelectedConversation(list[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await messagesApi.getMessages(conversationId);
      setMessages(response.data.data?.messages || []);
      await messagesApi.markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  const startNewConversation = async (providerId: string) => {
    try {
      const response = await messagesApi.startConversation(providerId);
      const newConversation: Conversation | undefined =
        response.data.data?.conversation;
      if (!newConversation) return;
      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
    } catch (error) {
      console.error('Failed to start conversation', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const response = await messagesApi.sendMessage(selectedConversation.id, newMessage);
      const sent: Message | undefined = response.data.data?.message;
      if (sent) {
        // The socket broadcast may have already appended this message.
        setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      }
      setNewMessage('');
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to send message',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDay = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getOtherParticipantDisplay = (conversation: Conversation) => {
    const isClient = conversation.client?.id === user?.id;
    if (isClient) {
      const p = conversation.provider;
      const name =
        p?.businessName ||
        `${p?.user?.firstName ?? ''} ${p?.user?.lastName ?? ''}`.trim();
      return {
        name: name || 'Provider',
        initial: (p?.businessName?.charAt(0) || p?.user?.firstName?.charAt(0) || 'P').toUpperCase(),
      };
    }
    const c = conversation.client;
    const name = `${c?.firstName ?? ''} ${c?.lastName ?? ''}`.trim();
    return {
      name: name || 'Client',
      initial: (c?.firstName?.charAt(0) || 'C').toUpperCase(),
    };
  };

  // Group messages by day for the day dividers
  const groupedMessages = (() => {
    const groups: Array<{ day: string; items: Message[] }> = [];
    for (const m of messages) {
      const day = formatDay(m.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.day === day) last.items.push(m);
      else groups.push({ day, items: [m] });
    }
    return groups;
  })();

  if (loading) {
    return (
      <div className="surface-ground min-h-screen">
        <div className="dashboard-hero dashboard-hero--compact">
          <div className="container">
            <Skeleton width="120px" height="1rem" className="mb-2" />
            <Skeleton width="180px" height="1.875rem" />
          </div>
        </div>
        <div className="container py-4 dashboard-content">
          <Skeleton height="520px" style={{ borderRadius: 14 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="surface-ground min-h-screen">
      <Toast ref={toast} />

      <div className="dashboard-hero dashboard-hero--compact">
        <div className="container">
          <p className="dashboard-hero-greeting">Account</p>
          <h1 className="dashboard-hero-title">Messages</h1>
          <div className="dashboard-hero-row">
            <span className="dashboard-hero-chip">
              <i className="pi pi-comments" />
              {conversations.length} conversation{conversations.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <div className="container py-4 dashboard-content">
        <div className="messages-shell">
          <aside className="messages-list">
            <div className="messages-list-head">
              <h3>Conversations</h3>
            </div>
            <div className="messages-list-body">
              {conversations.length === 0 ? (
                <div className="messages-empty-list">
                  <i className="pi pi-comments" />
                  <p>No conversations yet.</p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const other = getOtherParticipantDisplay(conversation);
                  const isSelected = selectedConversation?.id === conversation.id;
                  return (
                    <div
                      key={conversation.id}
                      className={`conversation-item ${isSelected ? 'conversation-item--active' : ''}`}
                      onClick={() => setSelectedConversation(conversation)}
                      role="button"
                    >
                      <div className="conversation-avatar">{other.initial}</div>
                      <div className="conversation-info">
                        <div className="conversation-info-top">
                          <span className="conversation-name">{other.name}</span>
                          {conversation.lastMessageAt && (
                            <span className="conversation-time">
                              {formatDay(conversation.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <p className="conversation-preview">
                          {conversation.service?.name || 'General inquiry'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <section className="chat-panel">
            {selectedConversation ? (
              <>
                <div className="chat-head">
                  <div className="conversation-avatar">
                    {getOtherParticipantDisplay(selectedConversation).initial}
                  </div>
                  <div className="chat-head-info">
                    <p className="chat-head-name">
                      {getOtherParticipantDisplay(selectedConversation).name}
                    </p>
                    <p className="chat-head-sub">
                      {selectedConversation.service?.name || 'General inquiry'}
                    </p>
                  </div>
                </div>

                <div className="chat-body">
                  {messages.length === 0 ? (
                    <div className="chat-empty">
                      <div className="chat-empty-icon">
                        <i className="pi pi-send" />
                      </div>
                      <p style={{ margin: 0 }}>Start the conversation.</p>
                    </div>
                  ) : (
                    groupedMessages.map((group) => (
                      <div key={group.day}>
                        <div className="chat-day-divider">
                          <span>{group.day}</span>
                        </div>
                        {group.items.map((message) => {
                          const isOwn = message.sender?.id === user?.id;
                          return (
                            <div
                              key={message.id}
                              className={`chat-bubble-row ${isOwn ? 'chat-bubble-row--own' : ''}`}
                            >
                              <div
                                className={`chat-bubble ${isOwn ? 'chat-bubble--own' : 'chat-bubble--other'}`}
                              >
                                <p>{message.content}</p>
                                <span className="chat-bubble-time">
                                  {formatTime(message.createdAt)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input">
                  <InputText
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    icon="pi pi-send"
                    onClick={handleSendMessage}
                    loading={sendingMessage}
                    disabled={!newMessage.trim()}
                    tooltip="Send"
                    tooltipOptions={{ position: 'left' }}
                  />
                </div>
              </>
            ) : (
              <div className="chat-empty">
                <div className="chat-empty-icon">
                  <i className="pi pi-comments" />
                </div>
                <p style={{ margin: 0 }}>Select a conversation to start messaging.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
