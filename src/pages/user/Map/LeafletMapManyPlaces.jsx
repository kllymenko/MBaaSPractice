import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const LeafletMapManyPlaces = ({ places }) => {
    const markerIcon = new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    });

    const defaultPosition = [49.8397, 24.0297]; // Default position (e.g., Lviv, Ukraine)
    const position = places.length > 0 ? [places[0].coordinates.y, places[0].coordinates.x] : defaultPosition;

    return (
        <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {places.map((place, index) => (
                <Marker key={index} position={[place.coordinates.y, place.coordinates.x]} icon={markerIcon}>
                    <Popup>
                        {place.description}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default LeafletMapManyPlaces;
