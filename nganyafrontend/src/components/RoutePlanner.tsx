// // src/components/RoutePlanner.tsx
// import { useState } from 'react';
// import { useMutation } from '@tanstack/react-query';
// import RouteDisplay from './RouteDisplay';

// export default function RoutePlanner() {
//   const [pickup, setPickup] = useState('');
//   const [dropoff, setDropoff] = useState('');
//   const [route, setRoute] = useState(null);

//   const calculateRoute = useMutation({
//     mutationFn: async () => {
//       const response = await fetch('/api/route/calculate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ pickup, dropoff })
//       });
      
//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || 'Routing failed');
//       }
      
//       return response.json();
//     },
//     onSuccess: (data) => setRoute(data),
//     onError: (error) => alert(error.message)
//   });

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-2xl font-bold mb-4">Plan Your Route</h2>
        
//         <form onSubmit={(e) => {
//           e.preventDefault();
//           calculateRoute.mutate();
//         }}>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Pickup Location
//               </label>
//               <input
//                 type="text"
//                 value={pickup}
//                 onChange={(e) => setPickup(e.target.value)}
//                 placeholder="Enter pickup address"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                 required
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Drop-off Location
//               </label>
//               <input
//                 type="text"
//                 value={dropoff}
//                 onChange={(e) => setDropoff(e.target.value)}
//                 placeholder="Enter drop-off address"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                 required
//               />
//             </div>
//           </div>
          
//           <button
//             type="submit"
//             disabled={calculateRoute.isPending}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
//           >
//             {calculateRoute.isPending ? 'Calculating route...' : 'Show Route'}
//           </button>
//         </form>
        
//         {route && (
//           <div className="mt-6">
//             <div className="flex justify-between mb-4">
//               <div>
//                 <h3 className="text-lg font-semibold">Route Summary</h3>
//                 <p className="text-gray-600">
//                   Distance: {(route.distance / 1000).toFixed(1)} km • 
//                   Duration: {Math.round(route.duration / 60)} minutes
//                 </p>
//               </div>
//             </div>
            
//             <RouteDisplay route={route} />
            
//             <div className="mt-4">
//               <h4 className="font-medium mb-2">Turn-by-Turn Directions</h4>
//               <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
//                 <ol className="list-decimal pl-5 space-y-2">
//                   {route.instructions.map((step, index) => (
//                     <li key={index} className="text-sm">
//                       <span className="font-medium">{step.instruction}</span>
//                       <span className="text-gray-500 ml-2">
//                         ({(step.distance > 1000 
//                             ? `${(step.distance / 1000).toFixed(1)} km` 
//                             : `${Math.round(step.distance)} m`)})
//                       </span>
//                     </li>
//                   ))}
//                 </ol>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }