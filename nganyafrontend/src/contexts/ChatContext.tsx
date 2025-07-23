// src/contexts/ChatContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

export interface Conversation {
  id: string;
  participants: { id: string; name: string; email: string }[];
  title?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  unreadCount?: number; // Add unreadCount
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender: { id: string; name: string; email: string };
  content: string;
  createdAt: Date;
  status?: 'sent' | 'delivered' | 'read'; // Add status for messages
}

interface ChatContextType {
  socket: Socket | null;
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: ChatMessage[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean; // Added
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'; // Added
  error: string | null;
  selectConversation: (conversationId: string | null) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>; // Make it async
  createConversation: (participantIds: string[], title?: string) => Promise<void>; // Make it async
  refetchConversations: () => void;
  refetchMessages: (conversationId: string) => void;
  markMessagesAsRead: (conversationId: string) => void; // Added
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  console.log('--- ChatProvider is rendering ---');

  const { isAuthenticated, accessToken, user, isLoading: isAuthLoading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false); // New state
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected'); // New state
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Effect for socket connection management
  useEffect(() => {
    console.log('--- ChatContext useEffect START (Socket Connection) ---');

    if (isAuthLoading) {
      console.log('ChatContext: AuthContext is still loading. Skipping socket connection attempt.');
      return;
    }

    if (!isAuthenticated || !accessToken || !user?.id) {
      if (socketRef.current) {
        console.log('ChatContext: Auth state changed to unauthenticated, disconnecting socket.');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setConnectionStatus('disconnected');
      console.log('ChatContext: Not authenticated. Skipping new socket connection attempt.');
      return;
    }

    if (socketRef.current && socketRef.current.connected && (socketRef.current.io.opts.auth as any)?.token === accessToken) {
      console.log('ChatContext: Socket already connected with current token. Skipping reconnection.');
      return;
    }

    if (socketRef.current) {
      console.log('ChatContext: Disconnecting old socket before new connection.');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    const SOCKET_SERVER_URL = 'http://localhost:3001';

    console.log('ChatContext: Attempting Socket.IO connection...');
    setConnectionStatus('connecting');

    const newSocket = io(SOCKET_SERVER_URL, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    } as any);

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Event Listeners
    newSocket.on('connect', () => {
      console.log('ChatContext: WebSocket connected:', newSocket.id);
      setConnectionStatus('connected');
      setError(null);
      newSocket.emit('getConversations');
      setIsLoadingConversations(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('ChatContext: WebSocket disconnected:', reason);
      setConnectionStatus('disconnected');
      if (reason !== 'io client disconnect') {
        toast({
          title: 'Chat Disconnected',
          description: `You have been disconnected from the chat server. Reason: ${reason}`,
          variant: 'destructive',
        });
      }
      setSocket(null);
      socketRef.current = null;
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setIsLoadingConversations(false);
      setIsLoadingMessages(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('ChatContext: WebSocket connection error:', err.message, err);
      setConnectionStatus('error');
      setError(`Connection error: ${err.message}`);
      toast({
        title: 'Chat Connection Error',
        description: `Failed to connect to chat server: ${err.message}`,
        variant: 'destructive',
      });
      setSocket(null);
      socketRef.current = null;
      setIsLoadingConversations(false);
      setIsLoadingMessages(false);
    });

    newSocket.on('error', (data: { message: string; details?: any }) => {
      console.error('ChatContext: WebSocket server error event:', data);
      setError(`Server error: ${data.message}`);
      toast({
        title: 'Chat Error',
        description: data.message,
        variant: 'destructive',
      });
    });

    newSocket.on('message', (message: ChatMessage) => {
      console.log('ChatContext: Received message:', message);
      // Optimistically add message if it's from current user and not yet in state (race condition guard)
      if (message.senderId === user?.id && messages.some(m => m.id === message.id)) {
        // Message already exists (was optimistically added by sendMessage), just update its status
        setMessages(prevMessages => prevMessages.map(m => m.id === message.id ? { ...m, status: message.status || 'sent' } : m));
      } else {
        // Add new message
        setMessages((prevMessages) => [...prevMessages, { ...message, createdAt: new Date(message.createdAt) }]);
      }

      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, lastMessageText: message.content, lastMessageAt: new Date(message.createdAt), unreadCount: conv.id === selectedConversation?.id ? conv.unreadCount : (conv.unreadCount || 0) + 1 } // Increment unread if not selected
            : conv
        );
        const conversationToMove = updatedConversations.find(conv => conv.id === message.conversationId);
        if (conversationToMove) {
          const filtered = updatedConversations.filter(conv => conv.id !== message.conversationId);
          return [conversationToMove, ...filtered].sort((a, b) => {
            const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return dateB - dateA;
          });
        }
        return updatedConversations;
      });

      // Mark as read immediately if the conversation is currently selected and the message is not from current user
      if (selectedConversation?.id === message.conversationId && message.senderId !== user?.id) {
          markMessagesAsRead(message.conversationId);
      }
    });

    newSocket.on('conversations', (data: { event: string; data: Conversation[] }) => {
      console.log('ChatContext: Received conversations:', data.data);
      setConversations(data.data.map(conv => ({
          ...conv,
          lastMessageAt: conv.lastMessageAt ? new Date(conv.lastMessageAt) : null,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
      })).sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA;
      }));
      setIsLoadingConversations(false);
    });

    newSocket.on('newConversation', (conversation: Conversation) => {
      console.log('ChatContext: Received new conversation:', conversation);
      setConversations((prev) => {
        if (prev.some(conv => conv.id === conversation.id)) {
          return prev;
        }
        return [
          {
            ...conversation,
            lastMessageAt: conversation.lastMessageAt ? new Date(conversation.lastMessageAt) : null,
            createdAt: new Date(conversation.createdAt),
            updatedAt: new Date(conversation.updatedAt),
          },
          ...prev,
        ].sort((a, b) => {
            const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return dateB - dateA;
        });
      });
      // Optionally select the new conversation
      selectConversation(conversation.id);
    });

    newSocket.on('conversationMessages', (data: { event: string; data: ChatMessage[] }) => {
      console.log('ChatContext: Received messages for selected conversation:', data.data);
      setMessages(data.data.map(msg => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
      })));
      setIsLoadingMessages(false);
      // After loading messages, mark them as read
      if (selectedConversation?.id) {
        markMessagesAsRead(selectedConversation.id);
      }
    });

    // Cleanup function for useEffect
    return () => {
      if (socketRef.current) {
        console.log('ChatContext: Cleaning up socket connection...');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('error');
        socketRef.current.off('message');
        socketRef.current.off('conversations');
        socketRef.current.off('newConversation');
        socketRef.current.off('conversationMessages');
        socketRef.current.off('messagesRead'); // Ensure this is off too
        
        if (socketRef.current === newSocket) {
             socketRef.current.disconnect();
        }
        socketRef.current = null;
        setSocket(null);
        setConnectionStatus('disconnected');
      }
    };
  }, [isAuthenticated, accessToken, user?.id, isAuthLoading]); // Dependencies

  // Effect to refetch messages when selectedConversation changes
  useEffect(() => {
    if (socketRef.current && selectedConversation?.id && isAuthenticated && socketRef.current.connected) {
      setIsLoadingMessages(true);
      socketRef.current.emit('getConversationMessages', { conversationId: selectedConversation.id });
    } else {
      setMessages([]);
    }
  }, [selectedConversation?.id, isAuthenticated]);

  const refetchConversations = useCallback(() => {
    if (socketRef.current && isAuthenticated && socketRef.current.connected) {
      setIsLoadingConversations(true);
      socketRef.current.emit('getConversations');
    } else {
      console.warn('ChatContext: Cannot refetch conversations: Socket not connected or not authenticated.');
    }
  }, [isAuthenticated]);

  const refetchMessages = useCallback((conversationId: string) => {
    if (socketRef.current && isAuthenticated && socketRef.current.connected) {
      setIsLoadingMessages(true);
      socketRef.current.emit('getConversationMessages', { conversationId });
    } else {
      console.warn('ChatContext: Cannot refetch messages: Socket not connected or not authenticated.');
    }
  }, [isAuthenticated]);

  const selectConversation = useCallback((conversationId: string | null) => {
    if (conversationId) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
        // Clear unread count when selected
        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
      } else {
        setSelectedConversation(null);
        setMessages([]);
        setError('Conversation not found in list.');
      }
    } else {
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [conversations]);

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (socketRef.current && isAuthenticated && socketRef.current.connected && user) {
      setIsSendingMessage(true); // Set sending state to true

      // Optimistic update: Add message to local state immediately
      const tempMessageId = `temp-${Date.now()}-${Math.random()}`; // Temporary ID
      const newMessage: ChatMessage = {
        id: tempMessageId,
        conversationId,
        senderId: user.id,
        sender: { id: user.id, name: user.name, email: user.email }, // Use user data from AuthContext
        content,
        createdAt: new Date(),
        status: 'sent', // Initial status
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      try {
        // Emit the message to the server
        socketRef.current.emit('sendMessage', { conversationId, content, tempMessageId });
        // The server will respond with the actual message, which will update the status/ID
      } catch (err) {
        console.error('Failed to send message:', err);
        setError('Failed to send message.');
        toast({
          title: 'Message Send Failed',
          description: 'Could not send your message. Please try again.',
          variant: 'destructive',
        });
        // Revert optimistic update or mark as failed if needed
        setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== tempMessageId));
      } finally {
        setIsSendingMessage(false); // Reset sending state
      }
    } else {
      toast({
        title: 'Chat Error',
        description: 'Not connected to chat server. Please refresh or log in.',
        variant: 'destructive',
      });
    }
  }, [isAuthenticated, user]);


  const createConversation = useCallback(async (participantIds: string[], title?: string) => {
    if (socketRef.current && isAuthenticated && socketRef.current.connected) {
      try {
        // The server will emit 'newConversation' on success
        socketRef.current.emit('createConversation', { participantIds, title });
      } catch (err) {
        console.error('Failed to create conversation:', err);
        setError('Failed to create conversation.');
        toast({
          title: 'Conversation Creation Failed',
          description: 'Could not create new conversation. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Chat Error',
        description: 'Not connected to chat server. Please refresh or log in.',
        variant: 'destructive',
      });
    }
  }, [isAuthenticated]);


  const markMessagesAsRead = useCallback((conversationId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log(`ChatContext: Marking messages as read for conversation: ${conversationId}`);
      socketRef.current.emit('markMessagesAsRead', { conversationId });
      // Optimistically clear unread count for the selected conversation in the UI
      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    }
  }, []);

  // Listener for messagesRead event from the server
  useEffect(() => {
    if (socket) {
      const handleMessagesRead = (data: { conversationId: string; userId: string }) => {
        console.log(`ChatContext: Messages in conversation ${data.conversationId} read by ${data.userId}`);
        // Update message statuses to 'read' for messages sent by the current user in that conversation
        if (data.userId !== user?.id && selectedConversation?.id === data.conversationId) { // Only update if another user read messages in current conversation
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.conversationId === data.conversationId && msg.senderId === user?.id && msg.status !== 'read'
                        ? { ...msg, status: 'read' }
                        : msg
                )
            );
        }
      };
      socket.on('messagesRead', handleMessagesRead);
      return () => {
        socket.off('messagesRead', handleMessagesRead);
      };
    }
  }, [socket, user?.id, selectedConversation]);


  const contextValue = useMemo(() => ({
    socket,
    conversations,
    selectedConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage,
    connectionStatus,
    error,
    selectConversation,
    sendMessage,
    createConversation,
    refetchConversations,
    refetchMessages,
    markMessagesAsRead,
  }), [
    socket,
    conversations,
    selectedConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage,
    connectionStatus,
    error,
    selectConversation,
    sendMessage,
    createConversation,
    refetchConversations,
    refetchMessages,
    markMessagesAsRead,
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
