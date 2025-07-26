// src/contexts/ChatContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

// ⭐ Updated interfaces to reflect backend changes ⭐
export interface Conversation {
  id: string;
  participants: { id: string; name: string; email: string }[];
  title?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // unreadCount will now come from MessageStatus entity for the current user
  // We'll calculate it on the frontend based on the `messageStatuses` array
  unreadCount?: number;
  messageStatuses?: { // Add messageStatuses relation
    id: string;
    userId: string;
    conversationId: string;
    lastReadMessageId: string | null;
    unreadCount: number;
    updatedAt: Date;
  }[];
}

export interface Message { // ⭐ Renamed from ChatMessage to Message ⭐
  id: string;
  conversationId: string;
  senderId: string;
  sender: { id: string; name: string; email: string };
  content: string;
  createdAt: Date;
  // status?: 'sent' | 'delivered' | 'read'; // Status will be derived from MessageStatus on backend
  tempMessageId?: string; // For optimistic UI updates
}

interface ChatContextType {
  socket: Socket | null;
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[]; // ⭐ Changed to Message[] ⭐
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
  selectConversation: (conversationId: string | null) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (participantIds: string[], title?: string) => Promise<void>;
  refetchConversations: () => void;
  refetchMessages: (conversationId: string) => void;
  markMessagesAsRead: (conversationId: string) => void;
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
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // ⭐ Changed to Message[] ⭐
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const isSocketConnectedAndAuthenticatedRef = useRef<boolean>(false); 

  const selectedConversation = useMemo(() => {
    console.log('ChatContext: Memoizing selectedConversation. ID:', selectedConversationId);
    return conversations.find(conv => conv.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  const markMessagesAsRead = useCallback((conversationId: string) => {
    console.log(`ChatContext: Attempting to mark messages as read for conversation: ${conversationId}`);
    if (socketRef.current && socketRef.current.connected && isAuthenticated) {
      console.log(`ChatContext: Emitting 'markMessagesAsRead' for conversation: ${conversationId}`);
      socketRef.current.emit('markMessagesAsRead', { conversationId });
      // Optimistically update unread count to 0 locally
      setConversations(prevConversations => {
        const updated = prevConversations.map(conv => {
          if (conv.id === conversationId) {
            // Find the current user's message status and update its unreadCount
            const updatedMessageStatuses = conv.messageStatuses?.map(ms =>
              ms.userId === user?.id ? { ...ms, unreadCount: 0 } : ms
            ) || [];
            return { ...conv, unreadCount: 0, messageStatuses: updatedMessageStatuses };
          }
          return conv;
        });
        console.log('ChatContext: Conversations updated locally after markMessagesAsRead (unreadCount set to 0).');
        return updated;
      });
    } else {
      console.warn('ChatContext: Cannot mark messages as read: Socket not connected or not authenticated.');
    }
  }, [isAuthenticated, user?.id]); // Dependency on user?.id for messageStatuses update

  const handleMessage = useCallback((message: Message) => { // ⭐ Changed to Message ⭐
    console.log('ChatContext: Received `message` event:', message);
    const incomingMessage = { ...message, createdAt: new Date(message.createdAt) };

    setMessages((prevMessages) => {
      // If the incoming message has a tempMessageId, find and replace the temporary message
      if (incomingMessage.tempMessageId) {
        const existingIndex = prevMessages.findIndex(m => m.id === incomingMessage.tempMessageId);
        if (existingIndex > -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[existingIndex] = { ...incomingMessage, id: incomingMessage.id }; // Replace temp ID with real ID
          console.log('ChatContext: Updated existing temporary message with real ID:', incomingMessage.id);
          return updatedMessages;
        }
      }
      // Otherwise, add new message or update if real ID already exists (e.g., from refetch)
      const existingIndex = prevMessages.findIndex(m => m.id === incomingMessage.id);
      if (existingIndex > -1) {
        const updatedMessages = [...prevMessages];
        updatedMessages[existingIndex] = { ...updatedMessages[existingIndex], ...incomingMessage };
        console.log('ChatContext: Updated existing message with ID:', incomingMessage.id);
        return updatedMessages;
      } else {
        console.log('ChatContext: Added new message with ID:', incomingMessage.id);
        return [...prevMessages, incomingMessage].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }
    });

    setConversations((prevConversations) => {
      let conversationFound = false;
      const updatedConversations = prevConversations.map((conv) => {
        if (conv.id === incomingMessage.conversationId) {
          conversationFound = true;
          const isFromOtherUser = incomingMessage.senderId !== user?.id;
          const isNotSelected = selectedConversationId !== incomingMessage.conversationId;
          const incrementUnread = isFromOtherUser && isNotSelected;

          console.log(`ChatContext: Updating conversation ${conv.id} with new message. Increment unread: ${incrementUnread}`);
          
          // Update last message details
          const updatedConv = {
            ...conv,
            lastMessageText: incomingMessage.content,
            lastMessageAt: incomingMessage.createdAt,
          };

          // Update unread count in messageStatuses for relevant user
          if (incrementUnread && updatedConv.messageStatuses) {
            updatedConv.messageStatuses = updatedConv.messageStatuses.map(ms => {
              if (ms.userId === user?.id) { // This is the current user's status
                return { ...ms, unreadCount: (ms.unreadCount || 0) + 1 };
              }
              return ms;
            });
            // Update the top-level unreadCount for display
            updatedConv.unreadCount = (updatedConv.unreadCount || 0) + 1;
          }
          return updatedConv;
        }
        return conv;
      });

      if (!conversationFound) {
        console.warn('ChatContext: Received message for an unknown conversation. Consider refetching conversations.');
        // Potentially trigger refetchConversations here if a new conversation might have been created
        // and the client wasn't aware (e.g., if another user initiated it).
      }
      console.log('ChatContext: Conversations array updated after new message. Sorting conversations.');
      return updatedConversations.sort((a, b) => {
        const dateA = a.lastMessageAt?.getTime() || 0;
        const dateB = b.lastMessageAt?.getTime() || 0;
        return dateB - dateA;
      });
    });

    if (selectedConversationId === incomingMessage.conversationId && incomingMessage.senderId !== user?.id) {
      console.log('ChatContext: Incoming message is for selected conversation and from another user. Marking as read.');
      markMessagesAsRead(incomingMessage.conversationId);
    }
  }, [setMessages, setConversations, user?.id, selectedConversationId, markMessagesAsRead]);

  const handleConversationsEvent = useCallback((data: { event: string; data: Conversation[] }) => {
    console.log('ChatContext: Received `conversations` event. Data length:', data.data.length);
    const parsedConversations = data.data.map(conv => {
      // Calculate unreadCount for the current user from messageStatuses
      const currentUserStatus = conv.messageStatuses?.find(ms => ms.userId === user?.id);
      return {
        ...conv,
        lastMessageAt: conv.lastMessageAt ? new Date(conv.lastMessageAt) : null,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        unreadCount: currentUserStatus ? currentUserStatus.unreadCount : 0, // Set unreadCount from status
      };
    });
    setConversations(parsedConversations.sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return dateB - dateA;
    }));
    console.log('ChatContext: setIsLoadingConversations(false)');
    setIsLoadingConversations(false);
  }, [setConversations, setIsLoadingConversations, user?.id]); // Add user?.id dependency for unreadCount calculation

  const handleNewConversation = useCallback((conversation: Conversation) => {
    console.log('ChatContext: Received `newConversation` event:', conversation);
    const newConvParsed: Conversation = {
      ...conversation,
      lastMessageAt: conversation.lastMessageAt ? new Date(conversation.lastMessageAt) : null,
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      // Calculate unreadCount for the current user from messageStatuses
      unreadCount: conversation.messageStatuses?.find(ms => ms.userId === user?.id)?.unreadCount || 0,
    };

    setConversations((prev) => {
      if (prev.some(conv => conv.id === newConvParsed.id)) {
        console.log('ChatContext: New conversation already exists, updating it.');
        return prev.map(c => c.id === newConvParsed.id ? newConvParsed : c);
      }
      console.log('ChatContext: Adding new conversation to list and sorting.');
      return [newConvParsed, ...prev].sort((a, b) => {
        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return dateB - dateA;
      });
    });
    console.log('ChatContext: Setting selectedConversationId to new conversation:', newConvParsed.id);
    setSelectedConversationId(newConvParsed.id);
  }, [setConversations, setSelectedConversationId, user?.id]); // Add user?.id dependency

  const handleConversationMessagesEvent = useCallback((data: { event: string; data: Message[] }) => { // ⭐ Changed to Message[] ⭐
    console.log('ChatContext: Received `conversationMessages` event. Data length:', data.data.length, 'for conversation:', selectedConversationId);
    setMessages(data.data.map(msg => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
    })).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));
    console.log('ChatContext: setIsLoadingMessages(false)');
    setIsLoadingMessages(false);
    if (selectedConversationId) {
      console.log('ChatContext: `conversationMessages` received for selected conversation, marking as read.');
      markMessagesAsRead(selectedConversationId);
    }
  }, [setMessages, setIsLoadingMessages, selectedConversationId, markMessagesAsRead]);

  const handleMessagesRead = useCallback((data: { conversationId: string; userId: string }) => {
    console.log(`ChatContext: Received 'messagesRead' event for conversation ${data.conversationId} by user ${data.userId}.`);
    // Update unread count for the relevant conversation for the user who read the messages
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === data.conversationId) {
          const updatedMessageStatuses = conv.messageStatuses?.map(ms =>
            ms.userId === data.userId ? { ...ms, unreadCount: 0 } : ms
          ) || [];
          // If the user who read the messages is the current user, update their top-level unreadCount
          const updatedUnreadCount = (data.userId === user?.id) ? 0 : conv.unreadCount;
          return { ...conv, unreadCount: updatedUnreadCount, messageStatuses: updatedMessageStatuses };
        }
        return conv;
      });
    });
    // For messages in the currently selected conversation, if they were sent by the current user
    // and read by another user, update their status to 'read' (if you re-introduce message status)
    // For now, this is handled by the backend's markMessagesAsRead.
  }, [setConversations, user?.id]);


  // Main Effect for socket connection management and event listener registration
  useEffect(() => {
    console.log('--- ChatContext useEffect START (Socket Connection Logic) ---');
    console.log('ChatContext: Auth state check - isAuthLoading:', isAuthLoading, 'isAuthenticated:', isAuthenticated, 'accessToken present:', !!accessToken, 'user ID present:', !!user?.id);

    if (isAuthLoading) {
      console.log('ChatContext: AuthContext is still loading. Skipping socket connection attempt.');
      return;
    }

    if (!isAuthenticated || !accessToken || !user?.id) {
      if (socketRef.current) {
        console.log('ChatContext: Auth state changed to unauthenticated/missing token. Disconnecting active socket.');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        isSocketConnectedAndAuthenticatedRef.current = false;
      }
      setConversations([]);
      setSelectedConversationId(null);
      setMessages([]);
      setConnectionStatus('disconnected');
      console.log('ChatContext: Not authenticated or missing token/user. Skipping new socket connection and clearing state.');
      return;
    }

    if (isSocketConnectedAndAuthenticatedRef.current && socketRef.current && socketRef.current.connected && (socketRef.current.io.opts.auth as any)?.token === accessToken) {
      console.log('ChatContext: Socket already successfully initialized and connected with current token. Skipping re-initialization.');
      return;
    }

    if (socketRef.current && (!socketRef.current.connected || (socketRef.current.io.opts.auth as any)?.token !== accessToken)) {
      console.log('ChatContext: Disconnecting old socket before new connection (token changed or not connected).');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      isSocketConnectedAndAuthenticatedRef.current = false;
    }

    const SOCKET_SERVER_URL = 'http://localhost:3001';

    console.log('ChatContext: All authentication checks passed. Attempting NEW Socket.IO connection...');
    console.log('ChatContext: Socket connection attempt with accessToken (truncated):', accessToken ? accessToken.substring(0, 10) + '...' : 'N/A');
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

    newSocket.on('connect', () => {
      console.log('ChatContext: WebSocket `connect` event fired. Socket ID:', newSocket.id);
      setConnectionStatus('connected');
      setError(null);
      isSocketConnectedAndAuthenticatedRef.current = true;
      console.log('ChatContext: Emitting `getConversations` on connect.');
      newSocket.emit('getConversations');
      console.log('ChatContext: setIsLoadingConversations(true)');
      setIsLoadingConversations(true);
    });
    newSocket.on('disconnect', (reason) => {
      console.log('ChatContext: WebSocket `disconnect` event fired. Reason:', reason);
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
      isSocketConnectedAndAuthenticatedRef.current = false;
      setConversations([]);
      setSelectedConversationId(null);
      setMessages([]);
      setIsLoadingConversations(false);
      setIsLoadingMessages(false);
      console.log('ChatContext: State cleared on disconnect.');
    });
    newSocket.on('connect_error', (err) => {
      console.error('ChatContext: WebSocket `connect_error` event fired. Error:', err.message, err);
      setConnectionStatus('error');
      setError(`Connection error: ${err.message}`);
      toast({
        title: 'Chat Connection Error',
        description: `Failed to connect to chat server: ${err.message}`,
        variant: 'destructive',
      });
      setSocket(null);
      socketRef.current = null;
      isSocketConnectedAndAuthenticatedRef.current = false;
      setIsLoadingConversations(false);
      setIsLoadingMessages(false);
    });
    newSocket.on('error', (data: { message: string; details?: any }) => {
      console.error('ChatContext: WebSocket `error` event from server:', data);
      setError(`Server error: ${data.message}`);
      toast({
        title: 'Chat Error',
        description: data.message,
        variant: 'destructive',
      });
    });

    newSocket.on('message', handleMessage);
    newSocket.on('conversations', handleConversationsEvent);
    newSocket.on('newConversation', handleNewConversation);
    newSocket.on('conversationMessages', handleConversationMessagesEvent);
    newSocket.on('messagesRead', handleMessagesRead);

    return () => {
      if (socketRef.current) {
        console.log('ChatContext: Cleaning up socket connection in useEffect cleanup...');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('error');
        socketRef.current.off('message', handleMessage);
        socketRef.current.off('conversations', handleConversationsEvent);
        socketRef.current.off('newConversation', handleNewConversation);
        socketRef.current.off('conversationMessages', handleConversationMessagesEvent);
        socketRef.current.off('messagesRead', handleMessagesRead);

        if (socketRef.current === newSocket && newSocket.connected) {
          console.log('ChatContext: Disconnecting the current active socket during cleanup.');
          newSocket.disconnect();
        } else if (socketRef.current !== newSocket) {
          console.log('ChatContext: Socket in ref is not the one created in this effect, skipping disconnect.');
        } else if (!newSocket.connected) {
          console.log('ChatContext: Socket already disconnected, skipping disconnect during cleanup.');
        }
        socketRef.current = null;
        setSocket(null);
        isSocketConnectedAndAuthenticatedRef.current = false;
        setConnectionStatus('disconnected');
      }
    };
  }, [
    isAuthenticated,
    accessToken,
    user?.id,
    isAuthLoading,
    handleMessage,
    handleConversationsEvent,
    handleNewConversation,
    handleConversationMessagesEvent,
    handleMessagesRead
  ]);

  useEffect(() => {
    console.log('ChatContext: useEffect for selectedConversationId change. Current ID:', selectedConversationId);
    if (socketRef.current && selectedConversationId && isAuthenticated && socketRef.current.connected) {
      console.log('ChatContext: setIsLoadingMessages(true) due to selectedConversationId change. Emitting `getConversationMessages`.');
      setIsLoadingMessages(true);
      socketRef.current.emit('getConversationMessages', { conversationId: selectedConversationId });
    } else {
      console.log('ChatContext: selectedConversationId cleared or not connected, clearing messages array.');
      setMessages([]);
      setIsLoadingMessages(false);
    }
  }, [selectedConversationId, isAuthenticated, socket]);

  const refetchConversations = useCallback(() => {
    console.log('ChatContext: `refetchConversations` called.');
    if (socketRef.current && isAuthenticated && socketRef.current.connected) {
      console.log('ChatContext: setIsLoadingConversations(true) for refetch. Emitting `getConversations`.');
      setIsLoadingConversations(true);
      socketRef.current.emit('getConversations');
    } else {
      console.warn('ChatContext: Cannot refetch conversations: Socket not connected or not authenticated.');
      toast({
        title: 'Chat Offline',
        description: 'Cannot refetch conversations. You are currently offline.',
        variant: 'info'
      });
    }
  }, [isAuthenticated]);

  const refetchMessages = useCallback((conversationId: string) => {
    console.log(`ChatContext: 'refetchMessages' called for conversation: ${conversationId}`);
    if (socketRef.current && isAuthenticated && socketRef.current.connected) {
      console.log('ChatContext: setIsLoadingMessages(true) for refetch. Emitting `getConversationMessages`.');
      setIsLoadingMessages(true);
      socketRef.current.emit('getConversationMessages', { conversationId });
    } else {
      console.warn('ChatContext: Cannot refetch messages: Socket not connected or not authenticated.');
      toast({
        title: 'Chat Offline',
        description: 'Cannot refetch messages. You are currently offline.',
        variant: 'info'
      });
    }
  }, [isAuthenticated]);

  const selectConversation = useCallback((conversationId: string | null) => {
    console.log(`ChatContext: 'selectConversation' called with ID: ${conversationId}`);
    setSelectedConversationId(conversationId);

    if (conversationId) {
        // Optimistically update unreadCount to 0 for the selected conversation
        setConversations(prev => prev.map(c => {
          if (c.id === conversationId) {
            const updatedMessageStatuses = c.messageStatuses?.map(ms =>
              ms.userId === user?.id ? { ...ms, unreadCount: 0 } : ms
            ) || [];
            return { ...c, unreadCount: 0, messageStatuses: updatedMessageStatuses };
          }
          return c;
        }));
    }
  }, [user?.id]); // Dependency on user?.id for messageStatuses update

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    console.log(`ChatContext: 'sendMessage' called for conversation ${conversationId}. Content length: ${content.length}`);
    if (!socketRef.current || !isAuthenticated || !socketRef.current.connected || !user || !content.trim()) {
      const reason = !socketRef.current ? 'no socket' : !isAuthenticated ? 'not authenticated' : !socketRef.current.connected ? 'socket disconnected' : !user ? 'no user' : !content.trim() ? 'empty content' : 'unknown';
      console.warn(`ChatContext: Cannot send message. Reason: ${reason}`);
      toast({
        title: 'Message Not Sent',
        description: 'Not connected to chat server, not authenticated, or message is empty.',
        variant: 'destructive',
      });
      return;
    }

    console.log('ChatContext: setIsSendingMessage(true)');
    setIsSendingMessage(true);

    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newMessage: Message = { // ⭐ Changed to Message ⭐
      id: tempMessageId,
      conversationId,
      senderId: user.id,
      sender: { id: user.id, name: user.name || 'You', email: user.email || '' },
      content: content.trim(),
      createdAt: new Date(),
      tempMessageId: tempMessageId, // Include temp ID for matching
    };

    setMessages((prevMessages) => {
      console.log('ChatContext: Adding temporary message to state:', newMessage.id);
      return [...prevMessages, newMessage].sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
    });

    try {
      console.log(`ChatContext: Emitting 'sendMessage' with tempId: ${tempMessageId}`);
      socketRef.current.emit('sendMessage', { conversationId, content: content.trim(), tempMessageId });
    } catch (err) {
      console.error('ChatContext: Failed to send message:', err);
      setError('Failed to send message.');
      toast({
        title: 'Message Send Failed',
        description: 'Could not send your message. Please try again.',
        variant: 'destructive',
      });
      setMessages((prevMessages) => {
        console.log('ChatContext: Removing temporary message from state due to send failure:', tempMessageId);
        return prevMessages.filter(msg => msg.id !== tempMessageId)
      });
    } finally {
      console.log('ChatContext: setIsSendingMessage(false) in finally block.');
      setIsSendingMessage(false);
    }
  }, [isAuthenticated, user]);


  const createConversation = useCallback(async (participantIds: string[], title?: string) => {
    console.log(`ChatContext: 'createConversation' called with participants: ${participantIds.join(', ')} and title: ${title}`);
    if (!socketRef.current || !isAuthenticated || !socketRef.current.connected || !user) {
      console.warn('ChatContext: Cannot create conversation: Socket not connected or not authenticated.');
      toast({
        title: 'Conversation Creation Failed',
        description: 'Not connected to chat server or not authenticated.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('ChatContext: Emitting `createConversation` event.');
      socketRef.current.emit('createConversation', { participantIds, title: title?.trim() });
    } catch (err) {
      console.error('ChatContext: Failed to create conversation:', err);
      setError('Failed to create conversation.');
      toast({
        title: 'Conversation Creation Failed',
        description: 'Could not create new conversation. Please try again.',
        variant: 'destructive',
      });
    }
  }, [isAuthenticated, user]);


  const contextValue = useMemo(() => {
    console.log('ChatContext: Recalculating contextValue.');
    return {
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
    };
  }, [
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
