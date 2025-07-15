// import { createFileRoute } from '@tanstack/react-router'

// export const Route = createFileRoute('/ChatbotPage')({
//   component:  ChatbotPage,
// })


// import { useState, useRef, useEffect } from 'react';
// import axios from 'axios';

// interface Message {
//   text: string;
//   sender: 'user' | 'bot';
// }

// export function ChatbotPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

//   // Auto-scroll to the bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const sendMessage = async () => {
//     if (input.trim() === '') return;

//     const userMessage: Message = { text: input, sender: 'user' };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput('');
//     setLoading(true);

//     try {
//       const response = await axios.post('http://localhost:3001/chat/message', {
//         message: input,
//       });
//       const botMessage: Message = { text: response.data.response, sender: 'bot' };
//       setMessages((prev) => [...prev, botMessage]);
//     } catch (error) {
//       console.error('Error sending message:', error);
//       const errorMessage: Message = {
//         text: 'Oops! Something went wrong. Please try again.',
//         sender: 'bot',
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-100 antialiased">
//       <div className="flex-grow flex flex-col justify-between max-w-lg mx-auto w-full border border-gray-300 rounded-lg shadow-xl mt-8 mb-8 overflow-hidden bg-white">
//         {/* Header */}
//         <div className="p-4 bg-blue-600 text-white text-center text-xl font-semibold border-b border-blue-700">
//           RideFlow assistant 🤖
//         </div>

//         {/* Chat Messages Area */}
//         <div className="flex-grow p-4 overflow-y-auto space-y-4">
//           {messages.map((msg, index) => (
//             <div
//               key={index}
//               className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//             >
//               <div
//                 className={`p-3 rounded-lg max-w-xs ${
//                   msg.sender === 'user'
//                     ? 'bg-blue-500 text-white rounded-br-none'
//                     : 'bg-gray-200 text-gray-800 rounded-bl-none'
//                 }`}
//               >
//                 {msg.text}
//               </div>
//             </div>
//           ))}
//           {loading && (
//             <div className="flex justify-start">
//               <div className="p-3 rounded-lg max-w-xs bg-gray-200 text-gray-800 rounded-bl-none italic">
//                 Bot is typing...
//               </div>
//             </div>
//           )}
//           <div ref={messagesEndRef} /> {/* For auto-scrolling */}
//         </div>

//         {/* Chat Input */}
//         <div className="p-4 border-t border-gray-200 bg-white flex items-center">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyPress={(e) => {
//               if (e.key === 'Enter') sendMessage();
//             }}
//             placeholder="Type your message..."
//             className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
//             disabled={loading}
//           />
//           <button
//             onClick={sendMessage}
//             className="ml-3 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 disabled:bg-green-300 disabled:cursor-not-allowed"
//             disabled={loading}
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }