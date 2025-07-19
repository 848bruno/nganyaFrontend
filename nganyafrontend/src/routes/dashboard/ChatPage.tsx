// import { RootRoute, createFileRoute } from '@tanstack/react-router';
// import { useEffect, useRef, useState } from 'react';
// import { io } from 'socket.io-client';

// const socket = io('http://localhost:3001');

// export const Route = createFileRoute('/dashboard/ChatPage')({
//   component: ChatPage,
// });

// export default function ChatPage() {
//   const [message, setMessage] = useState('');
//   const [chat, setChat] = useState<{ sender: string; content: string }[]>([]);
//   const chatRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     socket.on('receiveMessage', (msg) => {
//       setChat((prev) => [...prev, msg]);
//     });

//     return () => {
//       socket.off('receiveMessage');
//     };
//   }, []);

//   useEffect(() => {
//     chatRef.current?.scrollTo({
//       top: chatRef.current.scrollHeight,
//       behavior: 'smooth',
//     });
//   }, [chat]);

//   const handleSend = () => {
//     if (message.trim()) {
//       const msg = { sender: 'You', content: message };
//       setChat((prev) => [...prev, msg]);
//       socket.emit('sendMessage', { sender: 'User A', content: message });
//       setMessage('');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//       <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4">
//         <h2 className="text-xl font-semibold mb-4 text-center">💬 Chat Room</h2>

//         <div
//           ref={chatRef}
//           className="h-64 overflow-y-auto border border-gray-200 rounded p-3 mb-3 bg-gray-100"
//         >
//           {chat.map((msg, idx) => (
//             <div
//               key={idx}
//               className={`mb-2 p-2 rounded ${
//                 msg.sender === 'You'
//                   ? 'bg-blue-100 text-right'
//                   : 'bg-gray-200 text-left'
//               }`}
//             >
//               <span className="block text-sm font-semibold">{msg.sender}</span>
//               <span>{msg.content}</span>
//             </div>
//           ))}
//         </div>

//         <div className="flex gap-2">
//           <input
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Type a message..."
//             className="flex-grow border rounded px-3 py-2 focus:outline-none focus:ring"
//           />
//           <button
//             onClick={handleSend}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }