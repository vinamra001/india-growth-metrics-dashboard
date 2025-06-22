import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface City {
  name: string;
  state?: string;
  coordinates?: { lat: number; lng: number };
  metrics: Record<string, any>;
}

interface CityMapProps {
  cities: City[];
  metric: string;
}

const getColor = (value: number) => {
  if (value > 80) return '#2ecc40';
  if (value > 60) return '#ffdc00';
  if (value > 40) return '#ff851b';
  return '#ff4136';
};

const CityMap: React.FC<CityMapProps> = ({ cities, metric }) => {
  const center = { lat: 22.9734, lng: 78.6569 }; // Center of India
  return (
    <MapContainer center={center} zoom={5} style={{ height: 400, width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {cities.filter(city => city.coordinates).map((city, idx) => (
        <CircleMarker
          key={city.name + idx}
          center={[city.coordinates!.lat, city.coordinates!.lng]}
          radius={10}
          fillOpacity={0.7}
          color={getColor(city.metrics[metric] || 0)}
        >
          <Popup>
            <strong>{city.name}</strong><br />
            {metric}: {city.metrics[metric]}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default CityMap; 