"use client";

import React, { useState } from "react";

const I18N = {
  en: {
    mapTitle: "Google Maps Market Radar",
    badge: "Google Maps Live",
    recenterBtn: "Recenter",
    openGoogleMaps: "Open in Google Maps",
    catchmentRadius: "5km Service Catchment Radius",
    proposedEnterprise: "Proposed Enterprise Location",
    competitorOutlet: "Competing Retail / Service Unit",
    nearestBank: "Nodal Bank Branch",
    outletCount: "outlets found in 5km",
    lowDensity: "Optimal Low-Density Opportunity",
    legendCenter: "Your Business",
    legendComp: "Market Radar",
    legendBank: "Bank Branch",
    viewCompetitors: "Market View",
    viewSite: "Your Site",
    mapView: "Roadmap",
    satelliteView: "Satellite",
  },
  hi: {
    mapTitle: "गूगल मैप्स स्थानीय बाज़ार राडार",
    badge: "Google Maps लाइव",
    recenterBtn: "री-सेंटर",
    openGoogleMaps: "गूगल मैप्स में खोजें",
    catchmentRadius: "5 किमी सेवा परिधि (Catchment)",
    proposedEnterprise: "प्रस्तावित उद्यम स्थान",
    competitorOutlet: "मौजूदा प्रतिस्पर्धी दुकान / इकाई",
    nearestBank: "नोडल बैंक शाखा",
    outletCount: "दुकानें (5 किमी दायरे में)",
    lowDensity: "अनुकूल विस्तार अवसर (कम प्रतिस्पर्धा)",
    legendCenter: "आपका उद्यम",
    legendComp: "बाजार राडार",
    legendBank: "बैंक शाखा",
    viewCompetitors: "बाजार दृश्य",
    viewSite: "आपका स्थान",
    mapView: "नक्शा",
    satelliteView: "सैटेलाइट",
  },
  mr: {
    mapTitle: "गुगल मॅप्स स्थानिक बाजार रडार",
    badge: "Google Maps थेट",
    recenterBtn: "री-सेंटर",
    openGoogleMaps: "गुगल मॅप्समध्ये उघडा",
    catchmentRadius: "5 किमी सेवा क्षेत्र",
    proposedEnterprise: "प्रस्तावित व्यवसाय स्थान",
    competitorOutlet: "स्पर्धक दुकान / केंद्र",
    nearestBank: "नोडल बँक शाखा",
    outletCount: "5 किमी परिसरात दुकाने",
    lowDensity: "विस्तारास अनुकूल संधी",
    legendCenter: "तुमचा व्यवसाय",
    legendComp: "बाजार रडार",
    legendBank: "बँक शाखा",
    viewCompetitors: "बाजार दृश्य",
    viewSite: "तुमची जागा",
    mapView: "नकाशा",
    satelliteView: "उपग्रह",
  },
  ta: {
    mapTitle: "கூகிள் வரைபட சந்தை ரேடார்",
    badge: "Google Maps நேரலை",
    recenterBtn: "மையப்படுத்து",
    openGoogleMaps: "கூகிள் வரைபடத்தில் தேடவும்",
    catchmentRadius: "5 கி.மீ சேவை வரம்பு",
    proposedEnterprise: "திட்டமிடப்பட்ட தொழில் இடம்",
    competitorOutlet: "போட்டியாளர் கடை / அலகு",
    nearestBank: "நோடல் வங்கி கிளை",
    outletCount: "5 கிமீ சுற்றளவில் உள்ள கடைகள்",
    lowDensity: "வளர்ச்சிக்கு சாதகமான வாய்ப்பு",
    legendCenter: "உங்கள் வணிகம்",
    legendComp: "சந்தை ரேடார்",
    legendBank: "வங்கி கிளை",
    viewCompetitors: "சந்தை பார்வை",
    viewSite: "உங்கள் தளம்",
    mapView: "வரைபடம்",
    satelliteView: "செயற்கைக்கோள்",
  },
};

// Clean, reliable business categories for Google Maps geocoding
const TRADE_SEARCH_KEYWORDS = {
  tailor: "Boutique Tailoring Shop",
  dairy: "Dairy Milk Booth",
  kirana: "Grocery Kirana Store",
  agarbatti: "Agarbatti Puja Store",
  poultry: "Poultry Farm Broiler",
  beauty_parlor: "Beauty Parlour Salon",
  food_stall: "Restaurant Snacks Sweets",
  handicraft: "Handloom Handicrafts",
};

function extractCleanBlock(raw) {
  if (!raw) return "Patan";
  const parenthesized = raw.match(/\(([^)]+)\)/);
  if (parenthesized && parenthesized[1]) {
    return parenthesized[1].trim();
  }
  const enOnly = raw.match(/[a-zA-Z]+/g);
  if (enOnly) {
    return enOnly.join(" ");
  }
  return "Patan";
}

export default function CompetitorMap({
  lat = 21.0366,
  lon = 81.5369,
  blockName = "Patan",
  tradeTitle = "Tailoring & Boutique",
  tradeKey = "tailor",
  competitorCount = 4,
  competitors = null,
  branchInfo = null,
  lang = "hi",
  className = "",
}) {
  const [viewMode, setViewMode] = useState("market"); // 'market' = nearby competitors, 'site' = proposed location
  const [mapType, setMapType] = useState("m"); // 'm' = Roadmap, 'k' = Satellite

  const t = I18N[lang] || I18N.hi;

  const cleanBlock = extractCleanBlock(blockName);
  const cleanTrade = TRADE_SEARCH_KEYWORDS[tradeKey] || "Small Business Enterprise";

  // Google Maps search query and embed URL based on selected mode
  // Using explicit ll coordinates and English block keyword avoids non-ASCII drift in Google Maps Embed
  const embedUrl = viewMode === "market"
    ? `https://maps.google.com/maps?q=${encodeURIComponent(`${cleanTrade} in ${cleanBlock} Chhattisgarh`)}&ll=${lat},${lon}&t=${mapType}&hl=${lang}&z=14&output=embed`
    : `https://maps.google.com/maps?q=${lat},${lon}&ll=${lat},${lon}&t=${mapType}&hl=${lang}&z=15&output=embed`;

  // Native Google Maps search URL centered on applicant's exact block coordinates
  const googleMapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(cleanTrade)}/@${lat},${lon},14z`;

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-[#d6c4b1] shadow-xs overflow-hidden ${className}`}>
      {/* Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#fbf9f5] border-b border-[#e8dfcf] text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="font-semibold text-[#221a10]">{t.mapTitle}</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff3e0] text-[#b45309] border border-[#ffe0b2]">
            <span>{t.badge}</span>
          </span>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Market vs Site View Toggle */}
          <div className="inline-flex items-center bg-white border border-[#d6c4b1] rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("market")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                viewMode === "market"
                  ? "bg-[#845400] text-white font-semibold shadow-xs"
                  : "text-[#514536] hover:text-[#221a10] hover:bg-[#fff5e9]"
              }`}
            >
              {t.viewCompetitors}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("site")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                viewMode === "site"
                  ? "bg-[#845400] text-white font-semibold shadow-xs"
                  : "text-[#514536] hover:text-[#221a10] hover:bg-[#fff5e9]"
              }`}
            >
              {t.viewSite}
            </button>
          </div>

          {/* Map Type Toggle */}
          <div className="inline-flex items-center bg-white border border-[#d6c4b1] rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setMapType("m")}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                mapType === "m"
                  ? "bg-[#221a10] text-white font-semibold"
                  : "text-[#514536] hover:text-[#221a10]"
              }`}
            >
              {t.mapView}
            </button>
            <button
              type="button"
              onClick={() => setMapType("k")}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                mapType === "k"
                  ? "bg-[#221a10] text-white font-semibold"
                  : "text-[#514536] hover:text-[#221a10]"
              }`}
            >
              {t.satelliteView}
            </button>
          </div>

          {/* Open in Google Maps */}
          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-[11px] font-semibold text-[#845400] bg-white hover:bg-[#fff5e9] rounded-lg border border-[#d6c4b1] shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            title="Open in Google Maps for live search"
          >
            <span>Google Maps</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </div>

      {/* Embedded Google Maps Canvas */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-stone-100">
        <iframe
          src={embedUrl}
          title={`Google Maps market view of ${tradeTitle} near ${blockName}`}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Floating Quick Legend Badge */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md border border-[#d6c4b1] shadow-sm rounded-xl px-3 py-1.5 flex items-center gap-3 text-[11px] font-medium text-[#221a10] pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d95c2e] inline-block shadow-xs"></span>
            <span>{tradeTitle}</span>
          </div>
          <span className="text-stone-300">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#b45309] inline-block shadow-xs"></span>
            <span>{blockName} Block Cluster</span>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="px-4 py-2.5 bg-[#fefaf4] border-t border-[#f1e5d5] flex items-center justify-between text-xs text-[#523b20]">
        <div className="flex items-center gap-2 font-medium">
          <span className="text-[#845400] font-bold">
            {competitorCount} {t.outletCount}
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-stone-600">
            {t.catchmentRadius}
          </span>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#fff1de] text-[#845400] border border-[#f3d3af]">
          {t.lowDensity}
        </span>
      </div>
    </div>
  );
}