import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getStateFromCoords } from '../utils/reportsStore';

// Custom Leaflet DivIcon for Selected Location Pin
const createLocationPinIcon = (isGps) => {
  return L.divIcon({
    className: 'custom-location-pin',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: ${isGps ? '#1960a3' : '#ba1a1a'};
          border: 3px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        ">
          <span class="material-symbols-outlined" style="font-size: 14px; font-weight: bold;">
            ${isGps ? 'my_location' : 'location_on'}
          </span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Map click handler sub-component
function MapClickEvents({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({
        lat: parseFloat(lat.toFixed(4)),
        lng: parseFloat(lng.toFixed(4)),
        source: 'map'
      });
    }
  });
  return null;
}

// Map center & zoom animation controller
function MapFlyController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function LocationPicker({ locationData, onChange, error }) {
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const markerRef = useRef(null);

  // Default India map center
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  const currentCenter = locationData?.lat && locationData?.lng
    ? [locationData.lat, locationData.lng]
    : defaultCenter;

  const currentZoom = locationData?.source === 'gps' ? 14 : (locationData?.lat ? 10 : defaultZoom);

  // Handle map click
  const handleMapClick = (coords) => {
    setGeoError(null);
    onChange(coords);
  };

  // Draggable marker end handler
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setGeoError(null);
          onChange({
            lat: parseFloat(latLng.lat.toFixed(4)),
            lng: parseFloat(latLng.lng.toFixed(4)),
            source: 'map'
          });
        }
      },
    }),
    [onChange]
  );

  // Browser Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Unable to access location: Geolocation is not supported by your browser.');
      return;
    }

    setIsGettingGps(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lng = parseFloat(position.coords.longitude.toFixed(4));
        setIsGettingGps(false);
        onChange({ lat, lng, source: 'gps' });
      },
      (err) => {
        setIsGettingGps(false);
        let msg = 'Unable to access your location. You can select a location manually on the map.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can click anywhere on the map to set your location.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please select a location manually on the map.';
        }
        setGeoError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Format latitude string
  const formatLat = (lat) => {
    if (lat == null) return '--';
    return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  };

  // Format longitude string
  const formatLng = (lng) => {
    if (lng == null) return '--';
    return `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Action Header bar with "Use my location" button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="font-label-md text-xs text-on-surface font-semibold flex items-center gap-1">
          <span>Location Selection</span>
          <span className="text-error">*</span>
        </label>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isGettingGps}
          className="bg-surface-container border border-outline-variant text-primary px-3 py-1.5 rounded font-label-md text-xs font-semibold hover:bg-surface-variant transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">
            {isGettingGps ? 'progress_activity' : 'my_location'}
          </span>
          {isGettingGps ? 'Detecting Location...' : 'Use My Current Location'}
        </button>
      </div>

      {/* Geolocation Friendly Error Message */}
      {geoError && (
        <div className="p-2.5 bg-error/10 border border-error/30 rounded text-error text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          <span>{geoError}</span>
        </div>
      )}

      {/* Leaflet Interactive Map Container */}
      <div className={`relative w-full h-[320px] bg-surface-container border rounded overflow-hidden shadow-sm ${
        error ? 'border-error ring-1 ring-error' : 'border-outline-variant'
      }`}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickEvents onLocationSelect={handleMapClick} />
          {locationData?.lat && locationData?.lng && (
            <MapFlyController center={currentCenter} zoom={currentZoom} />
          )}

          {locationData?.lat && locationData?.lng && (
            <Marker
              draggable={true}
              eventHandlers={eventHandlers}
              position={[locationData.lat, locationData.lng]}
              ref={markerRef}
              icon={createLocationPinIcon(locationData.source === 'gps')}
            >
              <Popup>
                <div className="font-sans text-xs flex flex-col gap-1 p-1">
                  <span className="font-bold text-primary">Selected Target Position</span>
                  <span>{formatLat(locationData.lat)}, {formatLng(locationData.lng)}</span>
                  <span className="text-[10px] text-outline italic">Drag marker to adjust</span>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Map Overlay Helper Badge */}
        {!locationData?.lat && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-sm border border-outline-variant px-3 py-1.5 rounded shadow text-xs font-body-sm text-on-surface flex items-center gap-1.5 z-[400]">
            <span className="material-symbols-outlined text-sm text-primary">touch_app</span>
            Select a location on the map or use your current location.
          </div>
        )}
      </div>

      {/* Compact Location Information Area (Below Map) */}
      <div className="bg-surface-container-low border border-outline-variant rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono-md text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">pin_drop</span>
          <div>
            <span className="text-outline uppercase text-[10px] block">Location</span>
            {locationData?.lat && locationData?.lng ? (
              <span className="font-bold text-primary font-sans text-sm">
                {getStateFromCoords(locationData.lat, locationData.lng)}
              </span>
            ) : (
              <span className="text-outline font-normal">Not selected</span>
            )}
          </div>
        </div>

        <div>
          <span className="text-outline uppercase text-[10px] block">Coordinates</span>
          {locationData?.lat && locationData?.lng ? (
            <span className="font-bold text-on-surface">
              {formatLat(locationData.lat)}, {formatLng(locationData.lng)}
            </span>
          ) : (
            <span className="text-outline font-normal">No coordinates</span>
          )}
        </div>

        <div className="text-right">
          <span className="text-outline uppercase text-[10px] block">Source</span>
          {locationData?.source === 'gps' ? (
            <span className="bg-secondary/15 text-secondary px-2 py-0.5 rounded font-semibold text-[11px] inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">my_location</span>
              Current location (GPS)
            </span>
          ) : locationData?.source === 'map' ? (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold text-[11px] inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">map</span>
              Map click
            </span>
          ) : (
            <span className="text-outline text-[11px]">Unset</span>
          )}
        </div>
      </div>
    </div>
  );
}
