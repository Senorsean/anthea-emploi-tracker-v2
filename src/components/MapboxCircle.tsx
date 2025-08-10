import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxCircleProps {
  lat?: number | null;
  lng?: number | null;
  radiusKm?: number;
}

const MapboxCircle: React.FC<MapboxCircleProps> = ({ lat, lng, radiusKm = 10 }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('MAPBOX_PUBLIC_TOKEN') || '';
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng ?? 2.3522, lat ?? 48.8566],
      zoom: lat && lng ? 10 : 4,
      pitch: 0,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null) return;

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: '#a4007c' })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }

    mapRef.current.easeTo({ center: [lng, lat], zoom: 11, duration: 800 });
  }, [lat, lng]);

  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden border">
      {!localStorage.getItem('MAPBOX_PUBLIC_TOKEN') && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-center p-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-700">Ajoutez votre Mapbox public token pour afficher la carte.</p>
            <p className="text-xs text-gray-500">Stockez-le dans localStorage sous la clé "MAPBOX_PUBLIC_TOKEN".</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute bottom-2 right-2 text-xs bg-white/90 px-2 py-1 rounded shadow">Rayon: {radiusKm} km</div>
    </div>
  );
};

export default MapboxCircle;
