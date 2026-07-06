import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  color?: string;
  pulse?: boolean;
}

interface MapComponentProps {
  locations?: Location[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function MapComponent({ 
  locations = [], 
  center = [18.0735, -15.9582],
  zoom = 12,
  className = "h-[400px] w-full rounded-xl z-0" 
}: MapComponentProps) {
  
  return (
    <div className={`overflow-hidden border border-border shadow-card relative ${className}`}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((loc) =>
          loc.color ? (
            <CircleMarker
              key={loc.id}
              center={[loc.latitude, loc.longitude]}
              radius={10}
              pathOptions={{ color: loc.color, fillColor: loc.color, fillOpacity: 0.25, weight: 2 }}
            >
              <Popup>
                <strong>{loc.name}</strong>
                {loc.description && <p className="text-sm text-muted mt-1">{loc.description}</p>}
              </Popup>
            </CircleMarker>
          ) : (
            <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
              <Popup>
                <strong>{loc.name}</strong>
                {loc.description && <p className="text-sm text-muted mt-1">{loc.description}</p>}
              </Popup>
            </Marker>
          )
        )}
      </MapContainer>
    </div>
  );
}
