import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapboxCircleProps {
  lat?: number | null;
  lng?: number | null;
  radiusKm?: number;
}

const MapboxCircle: React.FC<MapboxCircleProps> = ({ lat, lng, radiusKm = 10 }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [lng ?? 2.3522, lat ?? 48.8566],
      zoom: lat && lng ? 10 : 4,
      pitch: 0,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null) return;

    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color: '#a4007c' })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }

    mapRef.current.easeTo({ center: [lng, lat], zoom: 11, duration: 800 });
  }, [lat, lng]);

  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute bottom-2 right-2 text-xs bg-white/90 px-2 py-1 rounded shadow">Rayon: {radiusKm} km</div>
    </div>
  );
};

export default MapboxCircle;

