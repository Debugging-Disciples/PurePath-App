import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCommunityLocations } from '../utils/firebase';
import { cn } from '@/lib/utils';
import { countries, usStates } from '@/utils/locationData';

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

// Approximate country center coordinates
const countryCoordinates: Record<string, [number, number]> = {
  'us': [37.0902, -95.7129], // USA
  'ca': [56.1304, -106.3468], // Canada
  'gb': [55.3781, -3.4360], // UK
  'au': [-25.2744, 133.7751], // Australia
  'de': [51.1657, 10.4515], // Germany
  'fr': [46.2276, 2.2137], // France
  'jp': [36.2048, 138.2529], // Japan
  'cn': [35.8617, 104.1954], // China
  'in': [20.5937, 78.9629], // India
  'br': [-14.2350, -51.9253], // Brazil
  'mx': [23.6345, -102.5528], // Mexico
  // Default for other countries
  'default': [0, 0]
};

// US states approximate coordinates
const stateCoordinates: Record<string, [number, number]> = {
  'AL': [32.7794, -86.8287],
  'AK': [64.0685, -152.2782],
  'AZ': [34.2744, -111.6602],
  'AR': [34.8938, -92.4426],
  'CA': [36.7783, -119.4179],
  'CO': [39.5501, -105.7821],
  'CT': [41.6032, -73.0877],
  'DE': [38.9896, -75.5050],
  'FL': [27.9944, -81.7603],
  'GA': [32.6415, -83.4426],
  // ... other states can be added similarly
  'default': [39.8333, -98.5833] // Center of US roughly
};

const CommunityMap: React.FC<CommunityMapProps> = ({ className }) => {
  const [locations, setLocations] = useState<Array<{ id: string; coordinates: [number, number]; displayName: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const communityLocations = await getCommunityLocations();
        
        // Transform country/state data to map coordinates
        const formattedLocations = communityLocations.map(item => {
          const countryCode = item.location.country;
          const stateCode = item.location.state;
          
          // Get the country name for display
          const countryObj = countries.find(c => c.value === countryCode);
          let displayName = countryObj?.label || 'Unknown Country';
          
          // If it's US and has a state, use state coordinates and add state to display name
          let coordinates: [number, number] = countryCoordinates[countryCode] || countryCoordinates.default;
          
          if (countryCode === 'us' && stateCode) {
            coordinates = stateCoordinates[stateCode] || stateCoordinates.default;
            const stateObj = usStates.find(s => s.value === stateCode);
            if (stateObj) {
              displayName = `${displayName}, ${stateObj.label}`;
            }
          }
          
          // Add a small random offset for privacy and to prevent markers from overlapping
          const randomOffset = () => (Math.random() - 0.5) * 2;
          coordinates = [
            coordinates[0] + randomOffset(), 
            coordinates[1] + randomOffset()
          ];
          
          return {
            id: item.id,
            coordinates,
            displayName
          };
        });
        
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
            position={item.coordinates} 
            icon={customIcon}
          >
            <Popup>
              A community member from {item.displayName}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CommunityMap;
