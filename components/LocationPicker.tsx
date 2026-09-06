'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, RefreshCw, X, Search } from 'lucide-react';

interface LocationPickerProps {
  currentLocation: string;
  onLocationSelected: (location: string) => void;
  onClose?: () => void;
}

const COMMON_CITIES = [
  'Mumbai, Maharashtra',
  'Pune, Maharashtra',
  'Delhi NCR, New Delhi',
  'Bengaluru, Karnataka',
  'Hyderabad, Telangana',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan',
  'Lucknow, Uttar Pradesh'
];

export default function LocationPicker({
  currentLocation,
  onLocationSelected,
  onClose
}: LocationPickerProps) {
  const [detecting, setDetecting] = useState(false);
  const [manualInput, setManualInput] = useState(currentLocation || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDetectGPS = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatusMessage('Browser geolocation not available. Please type your locality below.');
      return;
    }

    setDetecting(true);
    setStatusMessage('Querying GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(3);
        const lon = pos.coords.longitude.toFixed(3);
        const detected = `Municipal Sector (GPS: ${lat}° N, ${lon}° E)`;
        setManualInput(detected);
        onLocationSelected(detected);
        setDetecting(false);
        setStatusMessage('GPS position locked! You can edit the exact ward or landmark if needed.');
      },
      (err) => {
        console.warn('[Location] GPS error:', err);
        setDetecting(false);
        const fallback = 'Municipal Ward Central, District HQ';
        setManualInput(fallback);
        onLocationSelected(fallback);
        setStatusMessage('GPS permission skipped. Set to Central Municipal Zone.');
      },
      { timeout: 8000 }
    );
  };

  const handleSave = () => {
    if (manualInput.trim()) {
      onLocationSelected(manualInput.trim());
      onClose?.();
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#081322] border border-cyan-500/30 text-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <h4 className="font-bold text-sm text-slate-100">Location & Ward Selection</h4>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Official complaints are routed to the specific Municipal Ward, Police Station, or District Forum governing your area.
      </p>

      {statusMessage && (
        <p className="text-xs font-mono text-cyan-300 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-500/30 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{statusMessage}</span>
        </p>
      )}

      {/* Auto-detect button */}
      <button
        type="button"
        onClick={handleDetectGPS}
        disabled={detecting}
        className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <Navigation className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
        <span>{detecting ? 'Detecting GPS Locality...' : 'Use Current Device Location (GPS)'}</span>
      </button>

      {/* Manual Input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          Or Enter Locality / Ward / Landmark:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="e.g. Ward 42, Shivaji Nagar, Pune"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>

      {/* Quick City Pills */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-mono text-slate-400 block">Quick Metro Presets:</span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {COMMON_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setManualInput(city);
                onLocationSelected(city);
              }}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
