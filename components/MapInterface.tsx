
import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Flame, Map as MapIcon, Locate } from 'lucide-react';
import { Issue, IssueStatus } from '../types';
import L from 'leaflet';

interface MapInterfaceProps {
  issues: Issue[];
}

const MapInterface: React.FC<MapInterfaceProps> = ({ issues }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [isHeatmap, setIsHeatmap] = useState(false);

  // Solapur City Center Coordinates
  const SOLAPUR_CENTER: [number, number] = [17.6599, 75.9064];

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Check if map already initialized
    if (mapInstanceRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: SOLAPUR_CENTER,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Google Maps Hybrid Tiles (Satellite + Roads)
    // Using subdomains for faster parallel loading
    // lyrs=y implies Hybrid (Satellite + Labels/Roads) which ensures routes are clearly visible
    L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Google Maps',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // FIX: Force a size invalidation to ensure tiles load if the container size changes (e.g., animation)
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    issues.forEach(issue => {
      // VALIDATION: Fix for "Invalid LatLng object: (NaN, NaN)" error
      // Ensure coordinates are valid numbers before attempting to render
      if (!issue.location || 
          typeof issue.location.lat !== 'number' || 
          typeof issue.location.lng !== 'number' || 
          isNaN(issue.location.lat) || 
          isNaN(issue.location.lng)) {
        return;
      }

      const color = 
        issue.status === IssueStatus.OPEN ? '#ef4444' :
        issue.status === IssueStatus.RESOLVED ? '#10b981' :
        issue.status === IssueStatus.IN_PROGRESS ? '#0ea5e9' : '#f59e0b';

      // Custom pulsing HTML marker
      const customIcon = L.divIcon({
        className: 'bg-transparent',
        html: `
          <div class="relative w-6 h-6 group">
            <div class="absolute inset-0 rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>
            <div class="absolute inset-0 rounded-full border-2 border-white shadow-[0_0_15px_${color}] transition-transform duration-300 group-hover:scale-125" style="background-color: ${color}"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([issue.location.lat, issue.location.lng], { icon: customIcon })
        .addTo(mapInstanceRef.current!)
        .on('click', () => {
           setActiveIssue(issue);
           mapInstanceRef.current?.flyTo([issue.location.lat, issue.location.lng], 15, { duration: 1 });
        });

      markersRef.current.push(marker);
    });
  }, [issues, mapInstanceRef.current]);

  const handleCenterMap = () => {
    mapInstanceRef.current?.flyTo(SOLAPUR_CENTER, 13, { duration: 1.5 });
    mapInstanceRef.current?.invalidateSize();
  };

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col relative rounded-3xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
      
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-950" />

      {/* Overlays */}
      <div className="absolute top-6 left-6 z-[400] w-full max-w-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search Solapur sectors..." 
            className="w-full glass bg-slate-900/80 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-2xl transition-all"
          />
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-2">
         {/* Zoom controls are added by Leaflet, but we add custom action buttons here */}
        <button 
          onClick={handleCenterMap}
          className="p-3 bg-slate-900/80 hover:bg-slate-800 text-white rounded-2xl border border-white/10 shadow-xl backdrop-blur-md transition-all"
          title="Recenter Map"
        >
          <Locate size={20} />
        </button>

        <button 
          onClick={() => setIsHeatmap(!isHeatmap)}
          className={`p-3 rounded-2xl border transition-all flex items-center gap-2 shadow-xl backdrop-blur-xl ${isHeatmap ? 'bg-red-500 border-red-400 text-white' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'}`}
        >
          <Flame size={20} />
          <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Heatmap</span>
        </button>
      </div>

      <div className="absolute bottom-6 left-6 z-[400]">
        <div className="glass p-4 rounded-3xl border border-white/10 flex items-center gap-4 bg-slate-900/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="w-10 h-10 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-500/30">
            <MapIcon size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-tighter">Solapur Live Grid</p>
            <p className="text-[9px] text-slate-500 uppercase font-mono">{issues.length} Active Nodes</p>
          </div>
        </div>
      </div>

      {/* Issue Details Card */}
      {activeIssue && (
        <div className="absolute top-24 right-6 w-72 z-[400] animate-in slide-in-from-right duration-300">
          <div className="glass p-5 rounded-[2rem] border border-sky-500/30 bg-slate-900/95 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">Node Diagnostic</span>
              <button onClick={() => setActiveIssue(null)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            <img src={activeIssue.imageUrl} className="w-full h-32 object-cover rounded-2xl mb-4 border border-white/5" />
            <h4 className="text-sm font-bold text-white mb-1">{activeIssue.title}</h4>
            <p className="text-[10px] text-slate-400 mb-4 line-clamp-2">{activeIssue.description}</p>
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/5">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Impact</span>
              <span className="text-[9px] font-bold text-red-400 uppercase">{activeIssue.trafficImpact || 'MEDIUM'}</span>
            </div>
            <button className="w-full mt-4 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sky-500/20 transition-all">
              Initiate Response
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapInterface;
