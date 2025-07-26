// src/components/ChatInterface.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useChat, type Conversation, type ChatMessage } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, X, Plus, Loader2, ChevronLeft, Badge } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/useHooks';
import { format, formatDistanceToNowStrict, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose }) => {
  const {
    socket,
    conversations,
    selectedConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage,
    connectionStatus,
    selectConversation,
    sendMessage,
    createConversation,
    error,
    markMessagesAsRead,
  } = useChat();
  const { user: currentUser } = useAuth();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newConversationRecipientId, setNewConversationRecipientId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: allUsersData, isLoading: isLoadingAllUsers } = useUsers(1, 1000);

  const selectableUsers = useMemo(() => {
    // Users available to start a NEW chat with. Current user should not be in this list.
    return (allUsersData?.data || []).filter(u => u.id !== currentUser?.id);
  }, [allUsersData, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedConversation?.id) {
      console.log('ChatInterface: Marking messages as read for conversation:', selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);
    }
  }, [selectedConversation?.id, markMessagesAsRead]);

  const handleSendMessage = async () => {
    if (selectedConversation && newMessage.trim()) {
      console.log('ChatInterface: Attempting to send message to conversation:', selectedConversation.id);
      await sendMessage(selectedConversation.id, newMessage.trim());
      setNewMessage('');
    } else {
      console.warn('ChatInterface: Cannot send message. No selected conversation or empty message.');
    }
  };

  const handleCreateConversation = async () => {
    if (newConversationRecipientId && currentUser?.id) {
      console.log('ChatInterface: Attempting to create new one-on-one conversation with recipient:', newConversationRecipientId);
      try {
        // Backend should handle creation of one-on-one.
        // We send the recipient ID, and the backend adds the current user.
        await createConversation([newConversationRecipientId]); // Assuming createConversation takes an array of participant IDs
        console.log('ChatInterface: Direct conversation creation initiated.');
        setShowNewConversationModal(false);
        setNewConversationRecipientId(null); // Reset for next time
      } catch (err) {
        console.error('ChatInterface: Error creating direct conversation:', err);
      }
    } else {
      console.warn('ChatInterface: Cannot create direct conversation, no recipient selected or current user missing.');
    }
  };

  // Helper to get a participant's name by ID
  const getParticipantName = useCallback((participantId: string) => {
    const participant = allUsersData?.data?.find(u => u.id === participantId);
    return participant ? participant.name : 'Unknown User'; // Fallback for specific participant
  }, [allUsersData]);

  // Determines the display title for a conversation, strictly for direct chats with another user
  const getConversationTitle = useCallback((conv: Conversation) => {
    // Log for debugging purposes
    console.group(`getConversationTitle for conv.id: ${conv.id}`);
    console.log('  Conversation object received:', conv);
    console.log('  Current user ID:', currentUser?.id);
    console.log('  Conversation participants:', conv.participants);

    // Filter out the current user from the participants
    const otherParticipants = conv.participants.filter(p => p.id !== currentUser?.id);

    if (otherParticipants.length === 1) {
      // This is the ideal scenario for a direct chat: exactly one other participant
      const name = getParticipantName(otherParticipants[0].id);
      console.log(`  Returning other participant's name: ${name}`);
      console.groupEnd();
      return name;
    } else if (otherParticipants.length === 0 && conv.participants.length === 1 && conv.participants[0]?.id === currentUser?.id) {
      // If only current user is a participant, and we don't want to show 'My Notes',
      // this conversation should ideally not even be in the 'conversations' list from the backend.
      // However, if it is, we fall back to a generic name or filter it out.
      console.warn('  Warning: Encountered a self-chat. This conversation should be filtered out or handled differently if self-chats are not desired.');
      console.groupEnd();
      return 'Self Chat (Not Displayed)'; // This case implies backend sending unwanted convs
    } else if (otherParticipants.length > 1) {
      // This case means it's a "group" chat.
      // Since we are doing away with group chats on the frontend, this is a fallback
      // that indicates the backend might be sending group conversations, or there's
      // an unexpected number of participants for a "direct" chat.
      const names = otherParticipants.map(p => getParticipantName(p.id)).join(', ');
      console.warn(`  Warning: Conversation has more than one 'other' participant. This should not happen for direct chats. Participants: ${names}`);
      console.groupEnd();
      return `Multi-User Chat: ${names}`; // Indicate it's not a simple direct chat
    }

    // Final fallback if participants array is missing, empty, or unexpected
    console.error('  Conversation has no valid participants to determine a direct chat name. Returning generic fallback.');
    console.groupEnd();
    return 'Unknown User'; // Generic fallback for truly malformed data
  }, [currentUser, getParticipantName]);

  const formatMessageTimestamp = useCallback((date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  }, []);

  const formatConversationLastMessageTime = useCallback((date: Date | null) => {
    if (!date) return '';
    return formatDistanceToNowStrict(date, { addSuffix: true });
  }, []);

  const getAvatarUrl = (name: string) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear`;
  };

  // Determine the display name for the header of the currently selected chat
  const currentChatHeaderTitle = useMemo(() => {
    if (!selectedConversation) return 'Chat'; // Default if no conversation is selected
    return getConversationTitle(selectedConversation);
  }, [selectedConversation, getConversationTitle]);

  // Filter conversations to only show direct chats (2 participants, one is current user, one is other)
  // Or, if your backend already filters out self-chats/groups, this filter might be redundant but safe.
  const filteredConversations = useMemo(() => {
    if (!currentUser) return [];
    return conversations.filter(conv => {
      // A valid direct chat must have exactly two participants
      // and one of them must be the current user, and the other must not be the current user.
      const otherParticipants = conv.participants.filter(p => p.id !== currentUser.id);
      const isSelfChat = conv.participants.length === 1 && conv.participants[0]?.id === currentUser.id;

      // Exclude self-chats and any conversations with more than one 'other' participant (i.e., groups)
      return otherParticipants.length === 1 && !isSelfChat;
    });
  }, [conversations, currentUser]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 font-sans">
      <div className="relative flex h-[95vh] w-full max-w-6xl flex-col rounded-xl bg-background shadow-xl border">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            {/* Back button for mobile sidebar */}
            {selectedConversation && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => {
                  setIsMobileSidebarOpen(true);
                  selectConversation(null); // Deselect conversation to show list on mobile
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <h2 className="text-xl font-semibold">{currentChatHeaderTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={connectionStatus === 'connected' ? 'default' : (connectionStatus === 'connecting' ? 'secondary' : 'destructive')}>
              {connectionStatus === 'connected' ? 'Online' : (connectionStatus === 'connecting' ? 'Connecting...' : 'Offline')}
            </Badge>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Conversation List Sidebar - Hidden on mobile when conversation is selected */}
          <div
            className={cn(
              "flex w-full md:w-80 flex-col border-r bg-muted/50 p-2",
              selectedConversation && "hidden md:flex",
              isMobileSidebarOpen && "flex"
            )}
          >
            <div className="mb-2 flex items-center justify-between p-2">
              <h3 className="text-lg font-medium">Conversations</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewConversationModal(true)}
                className="h-8 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Chat</span>
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {isLoadingConversations ? (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <span>Loading conversations...</span>
                  <p className="text-sm text-muted-foreground">Status: {connectionStatus}</p>
                </div>
              ) : error ? (
                <div className="text-center text-destructive p-4">{error}</div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  No direct conversations yet. Start a new one!
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      selectConversation(conv.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full mb-1 flex items-center gap-3 rounded-lg p-3 transition-colors text-left",
                      selectedConversation?.id === conv.id
                        ? 'bg-accent'
                        : 'hover:bg-accent/50',
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getAvatarUrl(getConversationTitle(conv))} />
                      <AvatarFallback>
                        {getConversationTitle(conv).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{getConversationTitle(conv)}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessageText || 'No messages yet'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {conv.lastMessageAt && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatConversationLastMessageTime(conv.lastMessageAt)}
                        </span>
                      )}
                      {conv.unreadCount !== undefined && conv.unreadCount > 0 ? (
                        <Badge className="h-5 w-5 justify-center p-0">
                          {conv.unreadCount}
                        </Badge>
                      ) : null}
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Message Display Area */}
          <div className={cn(
            "flex flex-1 flex-col",
            !selectedConversation && "hidden md:flex",
            isMobileSidebarOpen && "hidden"
          )}>
            {selectedConversation ? (
              <>
                {/* Conversation Header (e.g., recipient's name) */}
                <div className="border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getAvatarUrl(getConversationTitle(selectedConversation))} />
                      <AvatarFallback>
                        {getConversationTitle(selectedConversation).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {getConversationTitle(selectedConversation)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                         Direct Chat
                      </p>
                    </div>
                  </div>
                </div>
                {/* Messages List */}
                <ScrollArea className="flex-1 p-4 bg-gray-50">
                  <div className="space-y-4">
                    {isLoadingMessages ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                        <span>Loading messages...</span>
                        <p className="text-sm text-muted-foreground">Current Conversation ID: {selectedConversation.id}</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center text-center">
                        <MessageSquare className="h-10 w-10 mb-4 text-muted-foreground" />
                        <h4 className="text-lg font-medium">No messages yet</h4>
                        <p className="text-sm text-muted-foreground">
                          Start the conversation with your first message
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isCurrentUser = msg.senderId === currentUser?.id;

                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex",
                              isCurrentUser ? 'justify-end' : 'justify-start'
                            )}
                          >
                            <div
                              className={cn(
                                "group relative max-w-[85%] px-4 py-3 shadow-sm",
                                isCurrentUser
                                  ? 'bg-primary text-primary-foreground rounded-xl rounded-br-none'
                                  : 'bg-muted rounded-xl rounded-bl-none'
                              )}
                            >
                              <div className="whitespace-pre-wrap break-words">
                                {msg.content}
                              </div>
                              <div
                                className={cn(
                                  "mt-1 text-xs flex items-center gap-1",
                                  isCurrentUser
                                    ? 'text-primary-foreground/70'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {formatMessageTimestamp(new Date(msg.createdAt))}
                                {isCurrentUser && (
                                  <span className="ml-1">
                                    {msg.status === 'read' ? (
                                      <span className="text-primary-foreground/70">✓✓</span>
                                    ) : msg.status === 'delivered' ? (
                                      <span className="text-primary-foreground/70">✓✓</span>
                                    ) : (
                                      <span className="text-primary-foreground/50">✓</span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                {/* Message Input */}
                <div className="border-t p-4 bg-white">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[40px] max-h-[120px] resize-none rounded-lg"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSendingMessage || connectionStatus !== 'connected'}
                      size="icon"
                      className="h-10 w-10 shrink-0"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // No conversation selected state
              <div className="flex flex-1 flex-col items-center justify-center p-4">
                <MessageSquare className="h-10 w-10 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Select an existing conversation or start a new one
                </p>
                <Button onClick={() => setShowNewConversationModal(true)}>
                  <Plus className="h-4 w-4 mr-2" /> New Direct Chat
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal (for direct chat only) */}
      <Dialog open={showNewConversationModal} onOpenChange={setShowNewConversationModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start New Direct Chat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select
                onValueChange={(value) => setNewConversationRecipientId(value)}
                value={newConversationRecipientId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingAllUsers ? (
                    <div className="flex items-center justify-center p-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading users...
                    </div>
                  ) : selectableUsers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No other users available to chat with.
                    </div>
                  ) : (
                    selectableUsers.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        disabled={newConversationRecipientId === user.id}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={getAvatarUrl(user.name)} />
                            <AvatarFallback>
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            {newConversationRecipientId && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 pr-1.5"
                >
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={getAvatarUrl(getParticipantName(newConversationRecipientId))} />
                    <AvatarFallback>
                      {getParticipantName(newConversationRecipientId).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {getParticipantName(newConversationRecipientId)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-transparent"
                    onClick={() => setNewConversationRecipientId(null)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </Button>
                </Badge>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowNewConversationModal(false);
              setNewConversationRecipientId(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!newConversationRecipientId}
            >
              Start Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
