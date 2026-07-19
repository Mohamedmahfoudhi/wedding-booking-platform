import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { messagesApi } from '../../api/client';
import { useAppSelector } from '../../store/hooks';
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

  useEffect(() => {
    const providerId = searchParams.get('provider');
    if (providerId && conversations.length > 0) {
      const existing = conversations.find(
        (c) => c.provider?.id === providerId || c.client?.id === providerId
      );
      if (existing) {
        setSelectedConversation(existing);
      } else {
        // Start new conversation
        startNewConversation(providerId);
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setConversations([newConversation, ...conversations]);
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
      if (sent) setMessages([...messages, sent]);
      setNewMessage('');
    } catch (error) {
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

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString();
  };

  const getOtherParticipantDisplay = (conversation: Conversation) => {
    const isClient = conversation.client?.id === user?.id;
    if (isClient) {
      const p = conversation.provider;
      const name = p?.businessName || `${p?.user?.firstName ?? ''} ${p?.user?.lastName ?? ''}`.trim();
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

  if (loading) {
    return (
      <div className="surface-ground min-h-screen p-4">
        <div className="container">
          <Skeleton width="200px" height="2rem" className="mb-4" />
          <div className="grid">
            <div className="col-4">
              <Card>
                <Skeleton height="400px" />
              </Card>
            </div>
            <div className="col-8">
              <Card>
                <Skeleton height="400px" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-ground min-h-screen">
      <Toast ref={toast} />

      <div className="container py-4">
        <h1 className="text-3xl font-bold mb-4">Messages</h1>

        <div className="grid" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Conversations List */}
          <div className="col-12 md:col-4">
            <Card className="h-full overflow-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-6">
                  <i className="pi pi-comments text-4xl text-color-secondary mb-3" />
                  <p className="text-color-secondary">No conversations yet</p>
                </div>
              ) : (
                <div className="flex flex-column gap-2">
                  {conversations.map((conversation) => {
                    const other = getOtherParticipantDisplay(conversation);
                    const isSelected = selectedConversation?.id === conversation.id;
                    return (
                      <div
                        key={conversation.id}
                        className={`flex align-items-center gap-3 p-3 border-round cursor-pointer ${
                          isSelected ? 'bg-primary-50' : 'hover:surface-100'
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <Avatar
                          label={other.initial}
                          shape="circle"
                          size="large"
                          className="bg-primary text-white"
                        />
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="flex justify-content-between">
                            <span className="font-medium">{other.name}</span>
                            <span className="text-xs text-color-secondary">
                              {conversation.lastMessageAt && formatDate(conversation.lastMessageAt)}
                            </span>
                          </div>
                          <p className="text-sm text-color-secondary m-0 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                            {conversation.service?.name || 'General inquiry'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Messages Area */}
          <div className="col-12 md:col-8">
            <Card className="h-full flex flex-column">
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="flex align-items-center gap-3 pb-3 border-bottom-1 surface-border">
                    <Avatar
                      label={getOtherParticipantDisplay(selectedConversation).initial}
                      shape="circle"
                      className="bg-primary text-white"
                    />
                    <div>
                      <p className="font-medium m-0">
                        {getOtherParticipantDisplay(selectedConversation).name}
                      </p>
                      <p className="text-sm text-color-secondary m-0">
                        {selectedConversation.service?.name || 'General inquiry'}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-grow-1 overflow-auto py-4" style={{ minHeight: '300px' }}>
                    {messages.length === 0 ? (
                      <div className="text-center text-color-secondary">
                        Start the conversation
                      </div>
                    ) : (
                      <div className="flex flex-column gap-3">
                        {messages.map((message) => {
                          const isOwn = message.sender?.id === user?.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}
                            >
                              <div
                                className={`max-w-25rem p-3 border-round-xl ${
                                  isOwn ? 'bg-primary text-white' : 'surface-100'
                                }`}
                              >
                                <p className="m-0">{message.content}</p>
                                <p
                                  className={`text-xs m-0 mt-1 ${
                                    isOwn ? 'text-white-alpha-70' : 'text-color-secondary'
                                  }`}
                                >
                                  {formatTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2 pt-3 border-top-1 surface-border">
                    <InputText
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      icon="pi pi-send"
                      onClick={handleSendMessage}
                      loading={sendingMessage}
                      disabled={!newMessage.trim()}
                    />
                  </div>
                </>
              ) : (
                <div className="flex align-items-center justify-content-center h-full text-color-secondary">
                  Select a conversation to start messaging
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
