/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Search, 
  Compass, 
  Info, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  ExternalLink,
  Milestone,
  Truck,
  ArrowLeft
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

// Premium Ateliers Data
export interface Atelier {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  description: string;
}

const ATELIERS: Atelier[] = [
  {
    id: 'sjyro-ny',
    name: 'SJYRO® Atelier New York',
    city: 'New York (Soho)',
    address: '580 Broadway, Soho, New York, NY 10012',
    lat: 40.7251,
    lng: -73.9976,
    phone: '+1 (212) 555-0195',
    hours: '11:00 AM - 08:00 PM',
    description: 'Our flagship North American venue. Double-height exposed brick architectural drapes housing loopback terries and seasonal drop portfolios.'
  },
  {
    id: 'sjyro-lon',
    name: 'SJYRO® Atelier London',
    city: 'London (Soho)',
    address: '45-46 Poland St, Soho, London W1F 7N7, UK',
    lat: 51.5146,
    lng: -0.1378,
    phone: '+44 20 7946 0192',
    hours: '10:00 AM - 07:00 PM',
    description: 'An avant-garde space showcasing brutalist raw-concrete podiums and structural menswear, situated in the core of Soho.'
  },
  {
    id: 'sjyro-seoul',
    name: 'SJYRO® Atelier Seoul',
    city: 'Seoul (Gangnam)',
    address: '12 Apgujeong-ro 46-gil, Gangnam-gu, Seoul',
    lat: 37.5273,
    lng: 127.0371,
    phone: '+82 2-555-0189',
    hours: '11:00 AM - 09:00 PM',
    description: 'A multi-level showroom celebrating Korean neo-streetwear cuts, boxy drops, and limited high-density printed editions.'
  },
  {
    id: 'sjyro-tokyo',
    name: 'SJYRO® Atelier Tokyo',
    city: 'Tokyo (Harajuku)',
    address: '5-11-5 Jingumae, Shibuya-ku, Tokyo 150-0001',
    lat: 35.6664,
    lng: 139.7063,
    phone: '+81 3-5555-0144',
    hours: '11:00 AM - 08:00 PM',
    description: 'Located in the streetwear capital. Combining traditional Shou Sugi Ban burnt cedar wood architecture with raw steel hanger railings.'
  }
];

// Read environment variable safely
const GOOGLE_MAPS_KEY =
  (process as any).env?.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  '';

const isRealKeyConfigured = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'MY_GOOGLE_MAPS_API_KEY' && GOOGLE_MAPS_KEY.length > 10;

// Sub-component: Handles drawing the route on the active Google Map using the modern Routes API
function RouteRenderer({ 
  origin, 
  destination, 
  travelMode, 
  onRouteComputed 
}: { 
  origin: string | google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
  onRouteComputed: (data: { distance: string; duration: string; steps: string[] }) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin) return;

    // Clear old route lines
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    routesLib.Route.computeRoutes({
      origin: origin,
      destination: destination,
      travelMode: travelMode,
      fields: ['path', 'distanceMeters', 'durationMillis', 'legs', 'viewport'],
    })
      .then(({ routes }) => {
        if (routes?.[0]) {
          const route = routes[0];
          
          // Draw new polyline
          const newPolylines = route.createPolylines();
          newPolylines.forEach(p => {
            p.setMap(map);
            // Style the polyline with SJYRO luxury brand colors (thick black/dark gray lines)
            p.setOptions({
              strokeColor: '#000000',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            });
          });
          polylinesRef.current = newPolylines;

          // Fit viewport
          if (route.viewport) {
            map.fitBounds(route.viewport);
          }

          // Extract metrics and steps if available
          const firstLeg = route.legs?.[0];
          const distanceText = `${((route.distanceMeters || 0) / 1000).toFixed(1)} km`;
          const durationMins = Math.round((Number(route.durationMillis || 0)) / 60000);
          const durationText = `${durationMins} mins`;
          
          // Simple directions fallback/extraction
          const steps: string[] = [];
          if (firstLeg?.steps) {
            firstLeg.steps.forEach((step: any, idx: number) => {
              if (step.navigationInstruction?.instructions) {
                steps.push(step.navigationInstruction.instructions);
              } else {
                steps.push(`Proceed towards waypoint ${idx + 1}`);
              }
            });
          } else {
            steps.push(`Head towards destination from your start location`);
            steps.push(`Follow the highlighted black route for ${distanceText}`);
            steps.push(`Arrive safely at the Flagship Atelier`);
          }

          onRouteComputed({
            distance: distanceText,
            duration: durationText,
            steps
          });
        }
      })
      .catch(err => {
        console.error("Compute routes failed:", err);
      });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [routesLib, map, origin, destination, travelMode]);

  return null;
}

export default function AtelierLocator({ onBack }: { onBack?: () => void }) {
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier>(ATELIERS[0]);
  const [userLocationInput, setUserLocationInput] = useState('');
  const [useSimulator, setUseSimulator] = useState(!isRealKeyConfigured);
  const [travelMode, setTravelMode] = useState<'DRIVING' | 'WALKING' | 'TRANSIT'>('DRIVING');
  
  // Real Maps Route States
  const [routeMetrics, setRouteMetrics] = useState<{ distance: string; duration: string; steps: string[] } | null>(null);
  const [activeRoutePoints, setActiveRoutePoints] = useState<{ origin: string; destination: google.maps.LatLngLiteral } | null>(null);
  
  // Simulated Map State
  const [simulatedDirections, setSimulatedDirections] = useState<string[] | null>(null);
  const [simulatedDistance, setSimulatedDistance] = useState('');
  const [simulatedDuration, setSimulatedDuration] = useState('');
  const [isSimulatingRoute, setIsSimulatingRoute] = useState(false);

  // Auto-complete or location simulation suggestions
  const [searchFocused, setSearchFocused] = useState(false);
  const getMockSuggestions = () => {
    if (selectedAtelier.id === 'sjyro-ny') {
      return ['Laguardia Airport, NY', 'Times Square, New York, NY', 'Williamsburg, Brooklyn, NY', 'Central Park, NY'];
    } else if (selectedAtelier.id === 'sjyro-lon') {
      return ['Heathrow Airport, London', 'Covent Garden, London', 'Shoreditch High St, London', 'Kensington, London'];
    } else if (selectedAtelier.id === 'sjyro-seoul') {
      return ['Incheon Airport, Seoul', 'Itaewon, Yongsan-gu, Seoul', 'Hongdae Street, Seoul', 'Myeongdong, Seoul'];
    } else {
      return ['Haneda Airport, Tokyo', 'Shibuya Crossing, Tokyo', 'Shinjuku Gyoen, Tokyo', 'Roppongi Hills, Tokyo'];
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setUserLocationInput(suggestion);
    setSearchFocused(false);
    triggerDirectionsCalculation(suggestion);
  };

  const triggerDirectionsCalculation = (inputAddress: string) => {
    if (!inputAddress.trim()) return;

    if (useSimulator) {
      // Run gorgeous mock directions simulation
      setIsSimulatingRoute(true);
      setSimulatedDirections(null);
      
      setTimeout(() => {
        // Build customized step-by-step luxury instructions
        const cityPrefix = selectedAtelier.city.split(' ')[0];
        const steps = [
          `Departing from "${inputAddress}" towards ${selectedAtelier.name}.`,
          `Head southeast on primary arterial transitway toward the central fashionable boulevard.`,
          `In 1.2 miles, merge onto the elevated bypass corridor toward ${selectedAtelier.city}.`,
          `Take the street exit leading to the core design district.`,
          `Turn right onto the historic cobblestone lane near iconic architectural galleries.`,
          `Arrive at ${selectedAtelier.address} on your right. Look for the custom-forged matte-black SJYRO steel logo canopy.`
        ];
        
        // Randomize realistic metrics
        const distanceVal = (3.5 + Math.random() * 8.5).toFixed(1);
        const durationVal = Math.round(12 + Math.random() * 25);
        
        setSimulatedDistance(`${distanceVal} km`);
        setSimulatedDuration(`${durationVal} mins`);
        setSimulatedDirections(steps);
        setIsSimulatingRoute(false);
      }, 900);
    } else {
      // Trigger real-time Maps route rendering
      setActiveRoutePoints({
        origin: inputAddress,
        destination: { lat: selectedAtelier.lat, lng: selectedAtelier.lng }
      });
    }
  };

  // Reset route on atelier change
  useEffect(() => {
    setRouteMetrics(null);
    setActiveRoutePoints(null);
    setSimulatedDirections(null);
  }, [selectedAtelier]);

  return (
    <div className="bg-neutral-50 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-10">
      
      {/* 1. Header and Premium Intro */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/[0.05] pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-black/40 font-button-lux block mb-1">
            IMMERSIVE GEOLOCATION
          </span>
          <h2 className="font-serif-lux font-medium text-3xl sm:text-5xl text-black">
            FLAGSHIP ATELIERS
          </h2>
          <p className="text-xs text-black/50 mt-2 max-w-xl font-sans leading-relaxed">
            Experience our tailored drapes and heavyweight 480GSM loopback terries in person. Locate a curated SJYRO design space near you and chart your route dynamically.
          </p>
        </div>

        {/* Key Mode Selection Widget (Real API vs. Simulator) */}
        <div className="flex gap-2 p-1 bg-neutral-200/60 rounded-md border border-black/5 self-stretch md:self-auto justify-center">
          <button 
            onClick={() => {
              if (!isRealKeyConfigured) {
                alert("Google Maps API Key not detected in your environment. Enabling premium custom simulator mode.");
                return;
              }
              setUseSimulator(false);
            }}
            className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all ${
              !useSimulator 
                ? 'bg-black text-white shadow-sm' 
                : 'text-black/50 hover:text-black'
            }`}
          >
            REAL GOOGLE MAPS
          </button>
          <button 
            onClick={() => setUseSimulator(true)}
            className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all ${
              useSimulator 
                ? 'bg-black text-white shadow-sm' 
                : 'text-black/50 hover:text-black'
            }`}
          >
            AESTHETIC SIMULATOR
          </button>
        </div>
      </div>

      {/* API Key Instructions banner if not configured yet */}
      {!isRealKeyConfigured && !useSimulator && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed font-sans">
            <p className="font-bold">Google Maps API Key Not Found In Secrets</p>
            <p className="mt-1">
              To activate live maps, please acquire a key from the Google Cloud Console and assign it to the <strong>GOOGLE_MAPS_PLATFORM_KEY</strong> environment variable in AI Studio Secrets. We have defaulted you to our gorgeous bespoke **Aesthetic Simulator** in the meantime!
            </p>
          </div>
        </div>
      )}

      {/* 2. Main Double-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN (Lg: 5/12): Atelier List, Location Search, Route directions */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Atelier Select Cards */}
          <div className="flex flex-col gap-3">
            <span className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux">
              SELECT CURATED DESTINATION
            </span>
            <div className="grid grid-cols-2 gap-3">
              {ATELIERS.map(at => (
                <button
                  key={at.id}
                  onClick={() => setSelectedAtelier(at)}
                  className={`p-4 text-left border rounded-sm transition-all flex flex-col justify-between ${
                    selectedAtelier.id === at.id 
                      ? 'bg-black text-white border-black shadow-lg scale-[1.02]' 
                      : 'bg-white text-black border-black/10 hover:border-black/30'
                  }`}
                >
                  <span className="text-[10px] font-mono tracking-wider opacity-60 block uppercase">
                    {at.city}
                  </span>
                  <span className="font-serif-lux font-medium text-xs sm:text-sm mt-1.5 block">
                    {at.name.replace('SJYRO® Atelier ', '')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed metadata card of the selected Atelier */}
          <div className="bg-white p-5 border border-black/5 shadow-sm rounded-sm flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-neutral-100 rounded-sm">
                <MapPin className="w-4 h-4 text-black" />
              </div>
              <div className="text-xs">
                <h4 className="font-serif-lux font-bold text-black text-sm">{selectedAtelier.name}</h4>
                <p className="text-black/60 font-mono text-[10px] mt-1">{selectedAtelier.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-black/[0.04] py-3 text-[10px] font-mono text-black/60">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-black/40" />
                <span>{selectedAtelier.hours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-black/40" />
                <span>Call: {selectedAtelier.phone}</span>
              </div>
            </div>

            <p className="text-[11px] font-sans text-black/60 leading-relaxed italic">
              "{selectedAtelier.description}"
            </p>
          </div>

          {/* Location Planner Input / Route Generator */}
          <div className="bg-white p-5 border border-black/5 shadow-sm rounded-sm flex flex-col gap-4">
            <span className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux">
              CHART YOUR CUSTOM ROUTE
            </span>
            
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                  <input
                    type="text"
                    value={userLocationInput}
                    onChange={(e) => setUserLocationInput(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="ENTER YOUR CITY OR STREET ADDRESS"
                    className="w-full border border-black/10 rounded-sm py-3 pl-10 pr-3 text-[10px] tracking-widest font-mono bg-neutral-50 focus:outline-none focus:border-black uppercase"
                  />
                </div>
                <button
                  onClick={() => triggerDirectionsCalculation(userLocationInput)}
                  className="bg-black hover:bg-luxury-accent hover:text-black text-white px-5 py-3 rounded-sm text-[10px] font-bold font-button-lux tracking-widest uppercase transition-colors flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" /> GO
                </button>
              </div>

              {/* Suggestions dropdown simulated context */}
              {searchFocused && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSearchFocused(false)} />
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-black/10 shadow-xl rounded-sm z-20 overflow-hidden divide-y divide-black/[0.04] text-[10px] font-mono">
                    <div className="p-2 text-black/40 font-bold bg-neutral-50 tracking-widest uppercase">SUGGESTED DEPARTURE POINTS</div>
                    {getMockSuggestions().map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(sug)}
                        className="w-full text-left p-3 hover:bg-neutral-50 hover:text-luxury-accent transition-colors block uppercase tracking-wide"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Travel Mode Selectors */}
            <div className="flex gap-1.5 border-t border-black/[0.03] pt-3">
              {['DRIVING', 'WALKING', 'TRANSIT'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setTravelMode(mode as any)}
                  className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 border rounded-sm font-button-lux transition-colors flex-grow ${
                    travelMode === mode 
                      ? 'bg-neutral-100 border-black text-black' 
                      : 'bg-white border-black/5 text-black/40 hover:border-black/25'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Turn-by-Turn Route Instructions (Dynamic or Simulated) */}
          <AnimatePresence>
            {((!useSimulator && routeMetrics) || (useSimulator && simulatedDirections)) && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white p-5 border border-black/10 shadow-lg rounded-sm flex flex-col gap-4"
              >
                {/* Route Header Metrics */}
                <div className="flex justify-between items-center bg-black text-white p-4 rounded-sm">
                  <div className="flex items-center gap-2">
                    <Milestone className="w-5 h-5 text-luxury-accent" />
                    <div>
                      <p className="text-[8px] font-mono tracking-widest opacity-65 uppercase">ROUTE PLAN</p>
                      <p className="text-xs font-bold uppercase tracking-wide">TO Flagship Atelier</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-sm font-bold text-luxury-accent">
                      {useSimulator ? simulatedDuration : routeMetrics?.duration}
                    </p>
                    <p className="text-[9px] opacity-75">
                      {useSimulator ? simulatedDistance : routeMetrics?.distance} ({travelMode})
                    </p>
                  </div>
                </div>

                {/* Steps List */}
                <div className="flex flex-col gap-3">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux">
                    TURN-BY-TURN DIRECTIONS
                  </span>
                  <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {(useSimulator ? simulatedDirections : routeMetrics?.steps)?.map((step, idx) => (
                      <div key={idx} className="flex gap-3 text-[11px] leading-relaxed font-sans text-black/75">
                        <span className="w-5 h-5 rounded-full bg-neutral-100 border text-[9px] font-mono font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        {/* Strip HTML tags if real google directions contain them */}
                        <p dangerouslySetInnerHTML={{ __html: step }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secure Pickup Guarantee Label */}
                <div className="border-t border-black/[0.04] pt-3 flex items-center gap-2 text-[9px] font-mono text-black/40 uppercase">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>In-store pickups processed in 30 mins flat</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading status for Directions search */}
          {isSimulatingRoute && (
            <div className="bg-white p-6 border text-center rounded-sm">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto mb-3" />
              <p className="text-[10px] tracking-widest uppercase font-bold text-black/45">Analyzing transitway coordinates...</p>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (Lg: 7/12): Google Map or Simulated Art Map */}
        <div className="lg:col-span-7 bg-neutral-900 aspect-square lg:aspect-auto min-h-[400px] lg:min-h-0 border border-black/10 rounded-sm relative overflow-hidden shadow-inner flex flex-col justify-between">
          
          {useSimulator ? (
            /* ========================================================= */
            /* BESPOKE SIMULATED LUXURY MAP INTERFACE                    */
            /* ========================================================= */
            <div className="absolute inset-0 w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
              {/* Retro luxury vector map grid lines backdrop */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              
              {/* Dynamic stylized custom SVG drawing representing actual city transit routes */}
              <div className="relative w-64 h-64 border border-white/5 bg-neutral-900/50 rounded-full flex items-center justify-center shadow-2xl">
                {/* Simulated radar scan animation loop */}
                <div className="absolute inset-0 border border-luxury-accent/10 rounded-full animate-ping pointer-events-none" />
                
                <svg className="absolute inset-0 w-full h-full p-4 text-white/15" viewBox="0 0 100 100" fill="none">
                  {/* Street grid vectors */}
                  <path d="M 10,0 L 10,100 M 50,0 L 50,100 M 90,0 L 90,100 M 0,20 L 100,20 M 0,50 L 100,50 M 0,80 L 100,80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                  {/* Outer ring */}
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" />
                  
                  {/* Active route path line drawn dynamically on request */}
                  {simulatedDirections && (
                    <motion.path 
                      d="M 20,80 Q 30,50 50,50 T 80,20" 
                      stroke="#A39382" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  )}
                </svg>

                {/* Selected location marker pin center */}
                <motion.div 
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="z-10 w-12 h-12 rounded-full bg-black border-2 border-luxury-accent flex items-center justify-center shadow-2xl"
                >
                  <MapPin className="w-5 h-5 text-luxury-accent" />
                </motion.div>
                
                {/* Active user departure point marker */}
                {simulatedDirections && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-12 left-12 z-10 w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center shadow-lg"
                  >
                    <Compass className="w-4 h-4 text-black animate-spin-slow" />
                  </motion.div>
                )}
              </div>

              {/* Aesthetic Coordinates Display */}
              <div className="relative mt-8 text-center flex flex-col gap-1.5 max-w-sm">
                <span className="text-[10px] font-mono tracking-[0.4em] text-luxury-accent uppercase font-bold">
                  {selectedAtelier.city} ATELIER INDEXED
                </span>
                <span className="text-[9px] font-mono tracking-widest text-white/40">
                  LAT: {selectedAtelier.lat.toFixed(4)} / LNG: {selectedAtelier.lng.toFixed(4)}
                </span>
                <p className="text-[11px] text-white/60 leading-relaxed font-sans px-4 mt-2">
                  Plot mapped cleanly to local terminal grid. Ready for physical collector walkthrough.
                </p>
              </div>

              {/* Locator Badge Overlay */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-sm text-[8px] font-mono text-white/75 uppercase tracking-widest">
                ● SIMULATION ACTIVE
              </div>

            </div>
          ) : (
            /* ========================================================= */
            /* REAL-TIME GOOGLE MAPS IMPLEMENTATION                      */
            /* ========================================================= */
            <div className="absolute inset-0 w-full h-full">
              <APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
                <Map
                  center={{ lat: selectedAtelier.lat, lng: selectedAtelier.lng }}
                  zoom={14}
                  mapId="DEMO_MAP_ID"
                  // Styling custom dark high contrast theme compliant with design principles
                  gestureHandling={'cooperative'}
                  disableDefaultUI={false}
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* Target Flagship Advanced Marker with custom Pin branding */}
                  <AdvancedMarker 
                    position={{ lat: selectedAtelier.lat, lng: selectedAtelier.lng }}
                    title={selectedAtelier.name}
                  >
                    <Pin background="#000000" glyphColor="#D2C9BD" borderColor="#000000" scale={1.2} />
                  </AdvancedMarker>

                  {/* Real Route calculations */}
                  {activeRoutePoints && (
                    <RouteRenderer
                      origin={activeRoutePoints.origin}
                      destination={activeRoutePoints.destination}
                      travelMode={travelMode === 'TRANSIT' ? 'TRANSIT' : travelMode === 'WALKING' ? 'WALKING' : 'DRIVING'}
                      onRouteComputed={(metrics) => {
                        setRouteMetrics(metrics);
                      }}
                    />
                  )}
                </Map>
              </APIProvider>
            </div>
          )}

          {/* Map bottom toolbar overlays (Aesthetic Coordinates & Controls) */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-center bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-sm text-[8px] font-mono text-white/60 tracking-widest uppercase">
            <span>GRID: SJYRO_SYS_SECURE</span>
            <span>MODEL: {selectedAtelier.id.toUpperCase()}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
