// src/components/ChatInterface.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useChat, type Conversation, type ChatMessage } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, MessageSquare, Send, X, Plus, Loader2, ChevronLeft, Badge } from 'lucide-react';
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
  const [newConversationParticipants, setNewConversationParticipants] = useState<string[]>([]);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: allUsersData, isLoading: isLoadingAllUsers } = useUsers(1, 1000);

  const selectableUsers = useMemo(() => {
    return (allUsersData?.data || []).filter(u => u.id !== currentUser?.id);
  }, [allUsersData, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedConversation?.id) {
      markMessagesAsRead(selectedConversation.id);
    }
  }, [selectedConversation?.id, markMessagesAsRead]);

  const handleSendMessage = async () => {
    if (selectedConversation && newMessage.trim()) {
      await sendMessage(selectedConversation.id, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleCreateConversation = async () => {
    if (newConversationParticipants.length > 0) {
      try {
        const participantsToSend = currentUser?.id
            ? Array.from(new Set([...newConversationParticipants, currentUser.id]))
            : newConversationParticipants;

        await createConversation(participantsToSend, newConversationTitle.trim() || undefined);
        setShowNewConversationModal(false);
        setNewConversationParticipants([]);
        setNewConversationTitle('');
      } catch (err) {
        console.error('Error creating conversation:', err);
      }
    }
  };

  const getParticipantName = useCallback((participantId: string) => {
    const participant = allUsersData?.data?.find(u => u.id === participantId);
    return participant ? participant.name : 'Unknown User';
  }, [allUsersData]);

  const getConversationTitle = useCallback((conv: Conversation) => {
    if (conv.title) return conv.title;
    const otherParticipants = conv.participants.filter(p => p.id !== currentUser?.id);
    if (otherParticipants.length === 1) {
      return getParticipantName(otherParticipants[0].id);
    }
    if (otherParticipants.length > 1) {
      const names = otherParticipants.map(p => getParticipantName(p.id));
      return names.length > 2 ? `${names[0]}, ${names[1]} +${names.length - 2}` : names.join(', ');
    }
    return 'My Notes';
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

  if (!isOpen) return null;

  const isGroupChat = selectedConversation && selectedConversation.participants.length > 2;

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
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <h2 className="text-xl font-semibold">Chat</h2>
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
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New</span>
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {isLoadingConversations ? (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <span>Loading conversations...</span>
                </div>
              ) : error ? (
                <div className="text-center text-destructive p-4">{error}</div>
              ) : conversations.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  No conversations yet. Start a new one!
                </div>
              ) : (
                conversations.map((conv) => (
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
                        {selectedConversation.participants.length} participant
                        {selectedConversation.participants.length !== 1 ? 's' : ''}
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
                      messages.map((msg) => { // Changed to use explicit return for clarity
                        const isCurrentUser = msg.senderId === currentUser?.id;
                        const showSenderName = isGroupChat && !isCurrentUser;

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
                              {showSenderName && (
                                <div className="mb-1 text-sm font-medium text-blue-600">
                                  {getParticipantName(msg.sender.id)}
                                </div>
                              )}
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
                      }) // Correctly closed map with explicit return
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
                  <Plus className="h-4 w-4 mr-2" /> New Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      <Dialog open={showNewConversationModal} onOpenChange={setShowNewConversationModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={newConversationTitle}
                onChange={(e) => setNewConversationTitle(e.target.value)}
                placeholder="Group project chat"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="participants">Participants</Label>
              <Select
                onValueChange={(value) => {
                  if (!newConversationParticipants.includes(value)) {
                    setNewConversationParticipants((prev) => [...prev, value]);
                  }
                }}
                value=""
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select participants..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingAllUsers ? (
                    <div className="flex items-center justify-center p-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading users...
                    </div>
                  ) : selectableUsers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No other users available
                    </div>
                  ) : (
                    selectableUsers.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        disabled={newConversationParticipants.includes(user.id)}
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
            {newConversationParticipants.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newConversationParticipants.map((pId) => {
                  const user = allUsersData?.data?.find(u => u.id === pId);
                  return (
                    <Badge
                      key={pId}
                      variant="outline"
                      className="flex items-center gap-1 pr-1.5"
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={user ? getAvatarUrl(user.name) : ''} />
                        <AvatarFallback>
                          {user?.name ? user.name.substring(0, 2).toUpperCase() : '?'}
                        </AvatarFallback>
                      </Avatar>
                      {user?.name || 'Unknown'}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 hover:bg-transparent"
                        onClick={() =>
                          setNewConversationParticipants((prev) =>
                            prev.filter((id) => id !== pId)
                          )
                        }
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewConversationModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={newConversationParticipants.length === 0}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};