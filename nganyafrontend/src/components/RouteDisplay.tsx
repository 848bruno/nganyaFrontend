// // src/components/RouteDisplay.tsx
// import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Fix for default marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
// });

// export default function RouteDisplay({ route }) {
//   if (!route) return null;

//   // Convert GeoJSON to Leaflet positions
//   const polyline = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

//   return (
//     <div className="mt-4 h-96 w-full">
//       <MapContainer 
//         center={[route.start.lat, route.start.lon]} 
//         zoom={13} 
//         style={{ height: '100%', width: '100%' }}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />
        
//         <Marker position={[route.start.lat, route.start.lon]}>
//           <Popup>Pickup Location</Popup>
//         </Marker>
        
//         <Marker position={[route.end.lat, route.end.lon]}>
//           <Popup>Drop-off Location</Popup>
//         </Marker>
        
//         <Polyline 
//           positions={polyline} 
//           color="#3b82f6" 
//           weight={5} 
//         />
//       </MapContainer>
//     </div>
//   );
// }