
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCommunityLocations } from '../utils/firebase';
import { cn } from '@/lib/utils';
import { countries, usStates } from '@/utils/locationData';

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
  // Default for other countries - don't display these
};

// Updated and corrected US states approximate coordinates
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
  'HI': [19.8968, -155.5828],
  'ID': [44.0682, -114.7420],
  'IL': [40.0417, -89.1965],
  'IN': [39.8942, -86.2816],
  'IA': [42.0751, -93.4960],
  'KS': [38.5111, -96.8005],
  'KY': [37.6690, -84.6514],
  'LA': [31.1801, -91.8749],
  'ME': [45.2538, -69.4455],
  'MD': [39.0458, -76.6413],
  'MA': [42.4072, -71.3824],
  'MI': [44.3148, -85.6024],
  'MN': [46.7296, -94.6859],
  'MS': [32.7416, -89.6787],
  'MO': [38.4561, -92.2884],
  'MT': [46.9219, -110.4544],
  'NE': [41.4925, -99.9018],
  'NV': [38.8026, -116.4194],
  'NH': [43.1939, -71.5724],
  'NJ': [40.0583, -74.4057],
  'NM': [34.5199, -105.8701],
  'NY': [42.1657, -74.9481],
  'NC': [35.6301, -79.8064],
  'ND': [47.5515, -101.0020],
  'OH': [40.4173, -82.9071],
  'OK': [35.5653, -96.9289],
  'OR': [44.5720, -122.0709],
  'PA': [40.5908, -77.2098],
  'RI': [41.6809, -71.5118],
  'SC': [33.8569, -80.9450],
  'SD': [44.2998, -99.4388],
  'TN': [35.7478, -86.6923],
  'TX': [31.0545, -97.5635],
  'UT': [39.3210, -111.0937],
  'VT': [44.5588, -72.5778],
  'VA': [37.7693, -78.1700],
  'WA': [47.4009, -121.4905],
  'WV': [38.5976, -80.4549],
  'WI': [43.7844, -88.7879],
  'WY': [43.0759, -107.2903],
  'DC': [38.9072, -77.0369]
};

const CommunityMap: React.FC<CommunityMapProps> = ({ className }) => {
  const [locations, setLocations] = useState<Array<{ id: string; coordinates: [number, number]; displayName: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const communityLocations = await getCommunityLocations();
        
        // Transform country/state data to map coordinates
        const formattedLocations = communityLocations
          .filter(item => {
            // Filter out "other" country selections
            return item.location.country !== 'other';
          })
          .map(item => {
            const countryCode = item.location.country;
            const stateCode = item.location.state;
            
            // Skip if country is not in our coordinates list
            if (!countryCoordinates[countryCode]) {
              return null;
            }
            
            // Get the country name for display
            const countryObj = countries.find(c => c.value === countryCode);
            let displayName = countryObj?.label || 'Unknown Country';
            
            // If it's US and has a state, use state coordinates and add state to display name
            let coordinates: [number, number] = countryCoordinates[countryCode];
            
            if (countryCode === 'us' && stateCode && stateCoordinates[stateCode]) {
              coordinates = stateCoordinates[stateCode];
              const stateObj = usStates.find(s => s.value === stateCode);
              if (stateObj) {
                displayName = `${displayName}, ${stateObj.label}`;
              }
            }
            
            // Add a small random offset for privacy and to prevent markers from overlapping
            const randomOffset = () => (Math.random() - 0.5) * 1.5;
            coordinates = [
              coordinates[0] + randomOffset(), 
              coordinates[1] + randomOffset()
            ];
            
            return {
              id: item.id,
              coordinates,
              displayName
            };
          })
          .filter(item => item !== null) as Array<{ id: string; coordinates: [number, number]; displayName: string }>;
        
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
