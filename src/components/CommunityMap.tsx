
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCommunityLocations } from '../utils/firebase';
import { cn } from '@/lib/utils';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface CommunityMapProps {
  className?: string;
}

const CommunityMap: React.FC<CommunityMapProps> = ({ className }) => {
  const [locations, setLocations] = useState<Array<{ id: string; location: { latitude: number; longitude: number } }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const communityLocations = await getCommunityLocations();
        
        // Transform GeoPoint to latitude/longitude objects
        const formattedLocations = communityLocations.map(item => ({
          id: item.id,
          location: {
            latitude: item.location.latitude,
            longitude: item.location.longitude
          }
        }));
        
        setLocations(formattedLocations);
      } catch (error) {
        console.error('Error fetching community locations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocations();
  }, []);
  
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-96 bg-secondary/30 rounded-lg", className)}>
        <div className="animate-pulse-soft">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("h-96 rounded-lg overflow-hidden shadow-sm border border-border", className)}>
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {locations.map((item) => (
          <Marker 
            key={item.id}
            position={[item.location.latitude, item.location.longitude]} 
            icon={customIcon}
          >
            <Popup>
              A community member is here
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CommunityMap;
