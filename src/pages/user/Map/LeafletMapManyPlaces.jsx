import React from 'react';
import {MapContainer, TileLayer, Marker, Popup, Circle} from 'react-leaflet';
import L from 'leaflet';

const LeafletMapManyPlaces = ({friends, userLocation, radius}) => {
    const markerIcon = new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    });
    const points = friends.map(friend => ({
        coordinates: friend.my_location,
        description: friend.login,
    }))
    return (
        <MapContainer center={userLocation} zoom={13} style={{height: '400px', width: '100%'}}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {userLocation && (
                <>
                    <Marker position={[userLocation.y, userLocation.x]} icon={markerIcon}>
                        <Popup>
                            Ваше місцезнаходження
                        </Popup>
                    </Marker>
                    <Circle
                        center={[userLocation.y, userLocation.x]}
                        radius={radius * 1000}
                        color="blue"
                    />
                </>
            )}
            {points.map((point, index) => (
                <Marker key={index} position={[point.coordinates.y, point.coordinates.x]} icon={markerIcon}>
                    <Popup>
                        {point.description}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default LeafletMapManyPlaces;
