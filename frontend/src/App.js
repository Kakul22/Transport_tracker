import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(position, { animate: true, duration: 0.8 });
  }, [position, map]);
  return null;
}

function App() {
  const [busData, setBusData] = useState({
    lat: 28.6139,
    lng: 77.2090,
    speed: 0,
    next_stop: 'Connecting...',
    network_quality: 'good'
  });
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connectWebSocket = useCallback(() => {
    setConnectionStatus('connecting');
    const ws = new WebSocket('ws://localhost:8000/ws/bus');
    wsRef.current = ws;

    ws.onopen = () => setConnectionStatus('connected');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBusData(data);
      if (data.network_quality === 'poor') setConnectionStatus('poor');
      else if (data.network_quality === 'medium') setConnectionStatus('medium');
      else if (data.network_quality === 'buffered') setConnectionStatus('buffered');
      else setConnectionStatus('connected');
    };

    ws.onerror = () => setConnectionStatus('disconnected');

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      reconnectTimer.current = setTimeout(connectWebSocket, 3000);
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connectWebSocket]);

  const statusConfig = {
    connected:    { color: '#22c55e', text: 'LIVE' },
    medium:       { color: '#f59e0b', text: 'MEDIUM' },
    poor:         { color: '#ef4444', text: 'POOR' },
    disconnected: { color: '#ef4444', text: 'RECONNECTING...' },
    buffered:     { color: '#8b5cf6', text: 'BUFFERED' },
    connecting:   { color: '#888',    text: 'CONNECTING...' },
  };

  const networkColor = {
    good: '#22c55e',
    medium: '#f59e0b',
    poor: '#ef4444',
    buffered: '#8b5cf6'
  };

  const position = [busData.lat, busData.lng];
  const status = statusConfig[connectionStatus];

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>

      {/* Info Panel */}
      <div style={{
        position: 'absolute', top: 16, left: '50%',
        transform: 'translateX(-50%)',
        background: 'white', padding: '12px 24px',
        borderRadius: 12, zIndex: 1000,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        display: 'flex', gap: 24, alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#888' }}>Next Stop</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{busData.next_stop}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#888' }}>Speed</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{busData.speed} km/h</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#888' }}>Network</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: networkColor[busData.network_quality] || '#888' }}>
            {busData.network_quality?.toUpperCase()}
          </div>
        </div>
        <div>
  <div style={{ fontSize: 11, color: '#888' }}>ETA</div>
  <div style={{ fontWeight: 600, fontSize: 15, color: '#3b82f6' }}>
    {busData.eta_minutes ? `${busData.eta_minutes} min` : '...'}
  </div>
</div>
        <div style={{
          background: status.color, color: 'white',
          fontSize: 11, fontWeight: 600,
          padding: '4px 10px', borderRadius: 999
        }}>
          {status.text}
        </div>
      </div>

      {/* Disconnected Banner */}
      {connectionStatus === 'disconnected' && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%',
          transform: 'translateX(-50%)',
          background: '#ef4444', color: 'white',
          padding: '10px 24px', borderRadius: 10,
          zIndex: 1000, fontWeight: 600, fontSize: 14
        }}>
          ⚠️ Network lost — Reconnecting automatically...
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="OpenStreetMap"
        />
        <MapController position={position} />
        <Marker position={position}>
          <Popup>
            🚌 Bus Live Location<br />
            Speed: {busData.speed} km/h<br />
            Next: {busData.next_stop}
          </Popup>
        </Marker>
      </MapContainer>

    </div>
  );
}

export default App;


