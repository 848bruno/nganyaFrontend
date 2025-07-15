// src/components/ChatbotWidget.tsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import { MessageSquare, X, Minus } from 'lucide-react'; // Example icons, install 'lucide-react' if you use them

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  // Add state to track if the chat window is minimized
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    if (isOpen && !isMinimized) { // Only scroll if the chat window is open AND not minimized
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]); // Add isMinimized to dependency array

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Ensure this URL points to your deployed NestJS backend
      const response = await axios.post('http://localhost:3001/chat/message', {
        message: input,
      });
      const botMessage: Message = { text: response.data.response, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        text: 'Oops! Something went wrong. Please try again.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handler for minimizing the chat
  const handleMinimize = () => {
    setIsMinimized(true);
  };

  // Handler for restoring the chat from minimized state
  const handleRestore = () => {
    setIsMinimized(false);
    setIsOpen(true); // Ensure the full window is open when restored
  };

  // Handler for completely closing the chat
  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false); 
   
  };

 

  return (
    <>
      {/* Floating Chatbot Toggle Button */}
    
      {!isOpen || isMinimized ? ( 
        <button
          onClick={isMinimized ? handleRestore : () => setIsOpen(true)} // Restore if minimized, open if closed
          className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
          aria-label={isMinimized ? "Restore Chatbot" : "Open Chatbot"}
        >
          <MessageSquare size={24} /> {/* Always show message icon for consistency */}
        </button>
      ) : null}

      {/* Chatbot Window (Full View) */}
      {isOpen && !isMinimized && ( // Only show if open AND not minimized
        <div
          className="fixed bottom-20 right-6 z-40 w-80 h-[500px] bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col transition-all duration-300 ease-in-out transform origin-bottom-right"
          style={{
            // Optional: for a subtle animation on open/close
            transform: isOpen ? 'scale(1)' : 'scale(0.8)',
            opacity: isOpen ? '1' : '0',
            transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white text-center text-lg font-semibold rounded-t-lg border-b border-blue-700 flex justify-between items-center">
            RideFlow assistant 🤖
            <div className="flex items-center space-x-2"> {/* Container for buttons */}
              {/* Minimize Button */}
              <button
                onClick={handleMinimize}
                className="p-1 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Minimize Chatbot"
              >
                <Minus size={18} className="text-white" />
              </button>
              {/* Close Button */}
              <button
                onClick={handleClose} // Use handleClose
                className="p-1 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close Chatbot"
              >
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[75%] break-words ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-gray-200 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-xl max-w-[75%] bg-gray-200 text-gray-800 rounded-bl-md italic">
                  RideFlow assistant typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* For auto-scrolling */}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 bg-white flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder="Type your message..."
              className="flex-grow p-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className="ml-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 disabled:bg-green-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Minimized Chat Bar */}
      {isOpen && isMinimized && ( // Show if open AND minimized
        <div
          className="fixed bottom-20 right-6 z-40 w-60 bg-blue-600 text-white p-3 rounded-lg shadow-xl flex items-center justify-between cursor-pointer hover:bg-blue-700 transition-colors duration-200"
          onClick={handleRestore} // Click to restore
        >
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} />
            <span className="font-semibold">RideFlow assistant</span>
          </div>
          {/* Close button for the minimized bar */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent restoring when clicking close
              handleClose();
            }}
            className="p-1 rounded-full hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close Chatbot"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      )}
    </>
  ); // Removed the portalRoot argument
}