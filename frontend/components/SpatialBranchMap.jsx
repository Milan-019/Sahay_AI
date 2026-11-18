"use client";

import React, { useState, useEffect, useMemo } from "react";

// Haversine formula for client-side spatial routing distance (km)
function haversineKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const r = 6371.0;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlam = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlam / 2) ** 2;
  return Number((r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}

function extractCleanBlock(label) {
  if (!label) return "Patan";
  const match = label.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    const sub = match[1].trim();
    if (/[a-zA-Z]/.test(sub)) {
      const en = sub.match(/[a-zA-Z]+/g);
      if (en) return en.join(" ");
    }
  }
  const enWords = label.match(/[a-zA-Z]+/g);
  if (enWords && enWords.length > 0) return enWords[0];
  return "Patan";
}

// Full 11 Pilot Corridor Channel Partner Branches (Durg, Bhilai, Raipur corridor)
const DEFAULT_SEED_BRANCHES = [
  // --- DURG DISTRICT ---
  {
    id: 1,
    branch_name: "SBI Patan Main Branch",
    short_name: "SBI Patan",
    institution_name: "State Bank of India",
    institution_type: "PSB",
    ifsc_code: "SBIN0010836",
    district: "Durg",
    block: "Patan",
    lat: 21.0366,
    lon: 81.5369,
    fund_quota_remaining: 1800000,
    is_solvent: true,
    afo_name: "Shri Rajesh Verma",
    afo_desk: "Counter No. 03",
    phone: "0788-262104",
    serves_scheme_codes: ["MICRO_FINANCE", "TERM_LOAN", "PMMY_MAHILA_UDYAMI", "STAND_UP_INDIA_WOMEN"],
  },
  {
    id: 2,
    branch_name: "CRGB Patan Branch",
    short_name: "CRGB Patan",
    institution_name: "Chhattisgarh Rajya Gramin Bank",
    institution_type: "RRB",
    ifsc_code: "CRGB0008162",
    district: "Durg",
    block: "Patan",
    lat: 21.0392,
    lon: 81.5398,
    fund_quota_remaining: 650000,
    is_solvent: true,
    afo_name: "Smt. Sunita Sahu",
    afo_desk: "Desk No. 01",
    phone: "0788-262330",
    serves_scheme_codes: ["MICRO_FINANCE", "PMMY_MAHILA_UDYAMI", "NSFDC_MAHILA_SAMRIDHI"],
  },
  {
    id: 3,
    branch_name: "SBI Dhamdha Branch",
    short_name: "SBI Dhamdha",
    institution_name: "State Bank of India",
    institution_type: "PSB",
    ifsc_code: "SBIN0010835",
    district: "Durg",
    block: "Dhamdha",
    lat: 21.4468,
    lon: 81.3142,
    fund_quota_remaining: 0,
    is_solvent: true,
    afo_name: "Shri Anoop Shukla",
    afo_desk: "Desk No. 02",
    phone: "07821-233110",
    serves_scheme_codes: ["MICRO_FINANCE", "TERM_LOAN", "PMMY_MAHILA_UDYAMI", "STAND_UP_INDIA_WOMEN"],
  },
  {
    id: 4,
    branch_name: "CRGB Dhamdha Branch",
    short_name: "CRGB Dhamdha",
    institution_name: "Chhattisgarh Rajya Gramin Bank",
    institution_type: "RRB",
    ifsc_code: "CRGB0008111",
    district: "Durg",
    block: "Dhamdha",
    lat: 21.4421,
    lon: 81.3115,
    fund_quota_remaining: 850000,
    is_solvent: true,
    afo_name: "Smt. Mamta Chandrakar",
    afo_desk: "Desk No. 01",
    phone: "07821-233420",
    serves_scheme_codes: ["MICRO_FINANCE", "PMMY_MAHILA_UDYAMI", "NSFDC_MAHILA_SAMRIDHI"],
  },
  {
    id: 5,
    branch_name: "Durg District Antyavasayi Co-op",
    short_name: "Durg Co-op",
    institution_name: "Chhattisgarh State Channelizing Agency (SCA)",
    institution_type: "SCA",
    ifsc_code: "SCA-DURG-01",
    district: "Durg",
    block: "Durg",
    lat: 21.1904,
    lon: 81.2849,
    fund_quota_remaining: 3500000,
    is_solvent: true,
    afo_name: "Shri O.P. Dewangan",
    afo_desk: "Nodal Cell",
    phone: "0788-232219",
    serves_scheme_codes: ["NSFDC_MAHILA_SAMRIDHI", "MICRO_FINANCE", "TERM_LOAN"],
  },
  {
    id: 6,
    branch_name: "PNB Sector 1 Bhilai",
    short_name: "PNB Bhilai",
    institution_name: "Punjab National Bank",
    institution_type: "PSB",
    ifsc_code: "PUNB0005700",
    district: "Durg",
    block: "Durg",
    lat: 21.2140,
    lon: 81.3812,
    fund_quota_remaining: 4000000,
    is_solvent: false,
    afo_name: "Shri R.K. Mishra",
    afo_desk: "Counter 04",
    phone: "0788-222890",
    serves_scheme_codes: ["TERM_LOAN", "STAND_UP_INDIA_WOMEN", "PMMY_MAHILA_UDYAMI"],
  },
  // --- RAIPUR DISTRICT ---
  {
    id: 7,
    branch_name: "SBI Arang Branch",
    short_name: "SBI Arang",
    institution_name: "State Bank of India",
    institution_type: "PSB",
    ifsc_code: "SBIN0010828",
    district: "Raipur",
    block: "Arang",
    lat: 21.1965,
    lon: 81.9664,
    fund_quota_remaining: 1600000,
    is_solvent: true,
    afo_name: "Shri Alok Baghel",
    afo_desk: "Counter 02",
    phone: "0771-288220",
    serves_scheme_codes: ["MICRO_FINANCE", "TERM_LOAN", "PMMY_MAHILA_UDYAMI", "STAND_UP_INDIA_WOMEN"],
  },
  {
    id: 8,
    branch_name: "CRGB Arang Branch",
    short_name: "CRGB Arang",
    institution_name: "Chhattisgarh Rajya Gramin Bank",
    institution_type: "RRB",
    ifsc_code: "CRGB0008204",
    district: "Raipur",
    block: "Arang",
    lat: 21.1980,
    lon: 81.9642,
    fund_quota_remaining: 700000,
    is_solvent: true,
    afo_name: "Smt. Rekha Sahu",
    afo_desk: "Desk 01",
    phone: "0771-288115",
    serves_scheme_codes: ["MICRO_FINANCE", "PMMY_MAHILA_UDYAMI", "NSFDC_MAHILA_SAMRIDHI"],
  },
  {
    id: 9,
    branch_name: "SBI Abhanpur Branch",
    short_name: "SBI Abhanpur",
    institution_name: "State Bank of India",
    institution_type: "PSB",
    ifsc_code: "SBIN0010827",
    district: "Raipur",
    block: "Abhanpur",
    lat: 21.0543,
    lon: 81.7485,
    fund_quota_remaining: 2200000,
    is_solvent: true,
    afo_name: "Shri Santosh Tandon",
    afo_desk: "Counter 03",
    phone: "0771-244301",
    serves_scheme_codes: ["MICRO_FINANCE", "TERM_LOAN", "STAND_UP_INDIA_WOMEN", "PMMY_MAHILA_UDYAMI"],
  },
  {
    id: 10,
    branch_name: "CRGB Telibandha Branch",
    short_name: "CRGB Raipur",
    institution_name: "Chhattisgarh Rajya Gramin Bank",
    institution_type: "RRB",
    ifsc_code: "CRGB0000142",
    district: "Raipur",
    block: "Dharsiwa",
    lat: 21.2330,
    lon: 81.6890,
    fund_quota_remaining: 1100000,
    is_solvent: true,
    afo_name: "Smt. Neelam Yadav",
    afo_desk: "Desk 02",
    phone: "0771-242890",
    serves_scheme_codes: ["MICRO_FINANCE", "PMMY_MAHILA_UDYAMI", "NSFDC_MAHILA_SAMRIDHI"],
  },
  {
    id: 11,
    branch_name: "Raipur District Antyavasayi Co-op",
    short_name: "Raipur Co-op",
    institution_name: "Chhattisgarh State Channelizing Agency (SCA)",
    institution_type: "SCA",
    ifsc_code: "SCA-RAIP-01",
    district: "Raipur",
    block: "Dharsiwa",
    lat: 21.2514,
    lon: 81.6296,
    fund_quota_remaining: 5000000,
    is_solvent: true,
    afo_name: "Shri M.K. Sharma",
    afo_desk: "Nodal Cell",
    phone: "0771-242100",
    serves_scheme_codes: ["NSFDC_MAHILA_SAMRIDHI", "MICRO_FINANCE", "TERM_LOAN"],
  },
];

const I18N = {
  en: {
    mapTitle: "Google Maps Branch Navigator",
    badge: "Spatial Engine Active",
    overviewBadge: "Nearest Banks Overview",
    directionsBadge: "Route Active",
    openGoogleMaps: "Open in Google Maps",
    youAreHere: "Your Location",
    servicingBranch: "Allocated Bank Branch",
    partnerBranch: "Alternate Partner Branch",
    quotaActive: "Stand-Up Quota Active",
    quotaAmount: "Quota Available",
    ifsc: "IFSC",
    phone: "Direct Helpdesk",
    afo: "AFO Officer",
    distance: "Distance",
    directRoute: "Direct Service Route",
    getDirections: "Turn-by-Turn Directions",
    mapView: "Roadmap",
    satelliteView: "Satellite",
    routeView: "Directions",
    pinView: "Branch Pin",
    overviewView: "Nearby Banks",
    chooseBankCTA: "Nearest Bank Branches for Your Location (Select to View Route):",
    allBanksBtn: "← View All Nearby Banks",
    viewRouteBtn: "Show Route",
    clickPrompt: "Click on any bank above to view turn-by-turn driving directions from your location.",
    selectedBankHeading: "Directions to Selected Bank Branch",
  },
  hi: {
    mapTitle: "गूगल मैप्स बैंक शाखा नेविगेटर",
    badge: "जियो-स्पेशल इंजन सक्रिय",
    overviewBadge: "निकटतम बैंक शाखाएं",
    directionsBadge: "रूट सक्रिय",
    openGoogleMaps: "गूगल मैप्स में खोलें",
    youAreHere: "आपका स्थान",
    servicingBranch: "आवंटित मुख्य बैंक शाखा",
    partnerBranch: "वैकल्पिक पार्टनर बैंक",
    quotaActive: "स्टैंड-अप कोटा सक्रिय",
    quotaAmount: "उपलब्ध कोटा",
    ifsc: "IFSC कोड",
    phone: "हेल्पडेस्क फ़ोन",
    afo: "कृषि क्षेत्र अधिकारी (AFO)",
    distance: "दूरी",
    directRoute: "प्रत्यक्ष सेवा रूट",
    getDirections: "दिशा-निर्देश (Directions)",
    mapView: "नक्शा",
    satelliteView: "सैटेलाइट",
    routeView: "रूट (Directions)",
    pinView: "शाखा पिन",
    overviewView: "निकटतम बैंक",
    chooseBankCTA: "आपके स्थान के निकटतम बैंक (रास्ता देखने हेतु बैंक चुनें):",
    allBanksBtn: "← सभी निकटतम बैंक देखें",
    viewRouteBtn: "रास्ता देखें",
    clickPrompt: "अपने स्थान से सीधा रास्ता और दिशा-निर्देश देखने के लिए ऊपर किसी भी बैंक पर क्लिक करें।",
    selectedBankHeading: "चयनित बैंक का प्रत्यक्ष रूट (Directions)",
  },
  mr: {
    mapTitle: "गुगल मॅप्स बँक शाखा नेव्हिगेटर",
    badge: "स्थानिक जिओ-इंजिन सक्रिय",
    overviewBadge: "जवळपासच्या बँक शाखा",
    directionsBadge: "मार्ग सक्रिय",
    openGoogleMaps: "गुगल मॅप्समध्ये उघडा",
    youAreHere: "तुमचे स्थान",
    servicingBranch: "वाटप केलेली मुख्य बँक",
    partnerBranch: "पर्यायी बँक शाखा",
    quotaActive: "कोटा सक्रिय",
    quotaAmount: "उपलब्ध कोटा",
    ifsc: "IFSC कोड",
    phone: "हेल्पडेस्क फोन",
    afo: "कृषी अधिकारी (AFO)",
    distance: "अंतर",
    directRoute: "थेट सेवा मार्ग",
    getDirections: "मार्गदर्शन मिळवा",
    mapView: "नकाशा",
    satelliteView: "उपग्रह",
    routeView: "मार्ग",
    pinView: "शाखा पिन",
    overviewView: "जवळपासच्या बँका",
    chooseBankCTA: "तुमच्या ठिकाणाजवळील बँका (मार्ग पाहण्यासाठी बँक निवडा):",
    allBanksBtn: "← जवळपासच्या सर्व बँका पहा",
    viewRouteBtn: "मार्ग पहा",
    clickPrompt: "तुमच्या स्थानापासून थेट मार्ग व दिशा पाहण्यासाठी वरील कोणत्याही बँकेवर क्लिक करा.",
    selectedBankHeading: "निवडलेल्या बँकेचा थेट मार्ग (Directions)",
  },
  ta: {
    mapTitle: "கூகிள் வரைபட வங்கி கிளை வழிகாட்டி",
    badge: "புவிசார் சேவை செயலில்",
    overviewBadge: "அருகிலுள்ள வங்கிகள்",
    directionsBadge: "பாதை செயலில்",
    openGoogleMaps: "கூகிள் வரைபடத்தில் திறக்க",
    youAreHere: "உங்கள் இருப்பிடம்",
    servicingBranch: "ஒதுக்கப்பட்ட வங்கி கிளை",
    partnerBranch: "மாற்று கூட்டாளர் வங்கி",
    quotaActive: "கோட்டா செயலில் உள்ளது",
    quotaAmount: "கிடைக்கும் ஒதுக்கீடு",
    ifsc: "IFSC குறியீடு",
    phone: "உதவி மையம்",
    afo: "வேளாண் கள அலுவலர் (AFO)",
    distance: "தொலைவு",
    directRoute: "நேரடி சேவை பாதை",
    getDirections: "வழிகாட்டுதலைப் பெறுக",
    mapView: "வரைபடம்",
    satelliteView: "செயற்கைக்கோள்",
    routeView: "பாதை",
    pinView: "கிளை பின்",
    overviewView: "அருகிலுள்ள வங்கிகள்",
    chooseBankCTA: "உங்கள் இருப்பிடத்திற்கு அருகிலுள்ள வங்கிகள் (வழியைப் பார்க்க தேர்ந்தெடுக்கவும்):",
    allBanksBtn: "← அருகிலுள்ள அனைத்து வங்கிகள்",
    viewRouteBtn: "பாதை காண்க",
    clickPrompt: "உங்கள் இருப்பிடத்திலிருந்து நேரடி வழியைக் காண மேலே உள்ள ஏதேனும் வங்கியைத் தேர்ந்தெடுக்கவும்.",
    selectedBankHeading: "தேர்ந்தெடுக்கப்பட்ட வங்கியின் நேரடி பாதை",
  },
};

export default function SpatialBranchMap({
  applicantLat = 21.0366,
  applicantLon = 81.5369,
  applicantLabel = "Patan Village Center",
  branch = null,
  nearbyBranches = null,
  schemeCode = "MICRO_FINANCE",
  loanAmount = 90000,
  lang = "hi",
  className = "",
}) {
  const [liveBranch, setLiveBranch] = useState(branch);
  const [liveNearby, setLiveNearby] = useState(nearbyBranches);
  // Default to null: First show nearest banks overview; only show directions when user selects a bank
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [mapType, setMapType] = useState("m"); // 'm' = Roadmap, 'k' = Satellite
  const [viewStyle, setViewStyle] = useState("route"); // 'route' | 'pin'

  const t = I18N[lang] || I18N.hi;

  // Attempt live spatial router fetch from backend
  useEffect(() => {
    let cancelled = false;
    const fetchSpatial = async () => {
      try {
        const url = `http://localhost:8000/api/schemes/partner-branches?lat=${applicantLat}&lon=${applicantLon}&scheme_code=${encodeURIComponent(schemeCode || "MICRO_FINANCE")}&loan_amount=${loanAmount || 90000}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.assigned_partner) {
            setLiveBranch(data.assigned_partner);
            if (data.all_branches?.length) {
              setLiveNearby(data.all_branches);
            }
          }
        }
      } catch (e) {
        // Fall back gracefully to client-side spatial sorting
      }
    };
    fetchSpatial();
    return () => {
      cancelled = true;
    };
  }, [applicantLat, applicantLon, schemeCode, loanAmount]);

  // Compute distances & sort branches by proximity to applicantLat, applicantLon
  const sortedBranches = useMemo(() => {
    const pool = liveNearby && liveNearby.length > 0
      ? liveNearby
      : (nearbyBranches && nearbyBranches.length > 0 ? nearbyBranches : DEFAULT_SEED_BRANCHES);

    return pool.map((b) => {
      const d = haversineKm(applicantLat, applicantLon, b.lat, b.lon);
      return {
        ...b,
        distance_km: b.distance_km != null ? b.distance_km : d,
      };
    }).sort((a, b) => a.distance_km - b.distance_km);
  }, [liveNearby, nearbyBranches, applicantLat, applicantLon]);

  // When applicant coordinates change (user picks another block), reset to overview mode
  useEffect(() => {
    setSelectedBranchId(null);
  }, [applicantLat, applicantLon]);

  const cleanBlock = extractCleanBlock(applicantLabel);

  // Active selected branch (when user clicks a bank)
  const selectedBranch = selectedBranchId
    ? sortedBranches.find((b) => b.id === selectedBranchId) || sortedBranches[0]
    : null;

  const branchLat = selectedBranch?.lat || applicantLat;
  const branchLon = selectedBranch?.lon || applicantLon;
  const branchName = selectedBranch?.branch_name || selectedBranch?.name || "";
  const branchIfsc = selectedBranch?.ifsc_code || selectedBranch?.ifsc || "";
  const displayDist = selectedBranch
    ? (selectedBranch.distance_km != null ? selectedBranch.distance_km : haversineKm(applicantLat, applicantLon, branchLat, branchLon))
    : 0;

  // Embed URL logic:
  // 1. Initial State (selectedBranchId == null): Show nearest banks around applicant's location
  // 2. Selected State (selectedBranchId != null): Show turn-by-turn route to the selected bank
  let embedUrl = "";
  let googleMapsNavUrl = "";

  if (!selectedBranchId) {
    // Show nearest banks around applicant location
    const overviewQuery = `Bank branches near ${cleanBlock} Chhattisgarh`;
    embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(overviewQuery)}&ll=${applicantLat},${applicantLon}&t=${mapType}&hl=${lang}&z=14&output=embed`;
    googleMapsNavUrl = `https://www.google.com/maps/search/Banks+near+${applicantLat},${applicantLon}/@${applicantLat},${applicantLon},14z`;
  } else {
    // Turn-by-turn route between applicant location and the selected bank
    embedUrl = viewStyle === "route"
      ? `https://maps.google.com/maps?saddr=${applicantLat},${applicantLon}&daddr=${branchLat},${branchLon}&t=${mapType}&hl=${lang}&z=13&output=embed`
      : `https://maps.google.com/maps?q=${branchLat},${branchLon}&ll=${branchLat},${branchLon}&t=${mapType}&hl=${lang}&z=15&output=embed`;
    googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${applicantLat},${applicantLon}&destination=${branchLat},${branchLon}&travelmode=driving`;
  }

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-[#d6c4b1] shadow-xs overflow-hidden ${className}`}>
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#fbf9f5] border-b border-[#e8dfcf] text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              selectedBranchId ? "bg-emerald-400" : "bg-indigo-400"
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              selectedBranchId ? "bg-emerald-500" : "bg-indigo-500"
            }`}></span>
          </span>
          <span className="font-semibold text-[#221a10]">
            {selectedBranchId ? `${t.selectedBankHeading}: ${selectedBranch?.short_name || branchName}` : t.mapTitle}
          </span>
          <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            selectedBranchId
              ? "bg-[#e8f5e9] text-[#1b5e20] border-[#c8e6c9]"
              : "bg-[#eef2ff] text-[#3730a3] border-[#c7d2fe]"
          }`}>
            <span>{selectedBranchId ? t.directionsBadge : t.overviewBadge}</span>
          </span>
        </div>

        {/* View Switchers & Native Maps Links */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Back to All Banks Overview button (visible when a bank is selected) */}
          {selectedBranchId && (
            <button
              type="button"
              onClick={() => setSelectedBranchId(null)}
              className="px-2.5 py-1 text-[11px] font-semibold text-[#845400] bg-white hover:bg-[#fff5e9] rounded-lg border border-[#d6c4b1] shadow-2xs transition-all cursor-pointer flex items-center gap-1"
              title="Return to nearest banks overview map"
            >
              <span>{t.allBanksBtn}</span>
            </button>
          )}

          {/* Route vs Pin Toggle (shown when bank is selected) */}
          {selectedBranchId && (
            <div className="inline-flex items-center bg-white border border-[#d6c4b1] rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewStyle("route")}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                  viewStyle === "route"
                    ? "bg-[#221a10] text-white font-semibold"
                    : "text-[#514536] hover:text-[#221a10]"
                }`}
              >
                {t.routeView}
              </button>
              <button
                type="button"
                onClick={() => setViewStyle("pin")}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                  viewStyle === "pin"
                    ? "bg-[#221a10] text-white font-semibold"
                    : "text-[#514536] hover:text-[#221a10]"
                }`}
              >
                {t.pinView}
              </button>
            </div>
          )}

          {/* Map Type Toggle (Roadmap / Satellite) */}
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

          {/* Open in Google Maps Native App / Web */}
          <a
            href={googleMapsNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-[11px] font-semibold text-[#845400] bg-white hover:bg-[#fff5e9] rounded-lg border border-[#d6c4b1] shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            title={selectedBranchId ? "Open route in Google Maps" : "Search banks in Google Maps"}
          >
            <span>Google Maps</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </div>

      {/* Nearest Banks Interactive Selection Cards */}
      <div className="px-4 py-3 bg-[#fdfbf7] border-b border-[#e8dfcf]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-[#3d2f1f] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#845400]"></span>
            <span>{t.chooseBankCTA}</span>
          </span>
          {selectedBranchId && (
            <button
              type="button"
              onClick={() => setSelectedBranchId(null)}
              className="text-[11px] font-semibold text-[#845400] hover:underline cursor-pointer"
            >
              {t.allBanksBtn}
            </button>
          )}
        </div>

        {/* 3 Proximity Cards for Nearest Banks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {sortedBranches.slice(0, 3).map((b, idx) => {
            const isSelected = selectedBranchId === b.id;
            return (
              <button
                key={b.id || idx}
                type="button"
                onClick={() => setSelectedBranchId(b.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? "bg-[#fff8ee] border-[#845400] shadow-xs ring-2 ring-[#845400]/40"
                    : "bg-white border-[#dcd2c4] hover:border-[#845400]/60 hover:bg-[#fefcf9]"
                }`}
              >
                <div className="flex items-start justify-between gap-1.5 w-full">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-[#845400] text-white" : "bg-stone-200 text-stone-700"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-[12px] text-[#221a10] leading-tight line-clamp-1">
                      {b.short_name || b.branch_name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    isSelected ? "bg-[#845400] text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}>
                    ~{b.distance_km} km
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 w-full pt-1 border-t border-stone-100">
                  <span className="truncate">{b.institution_type} • {b.block}</span>
                  <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                    isSelected ? "text-[#845400] font-bold" : "text-emerald-700 hover:text-emerald-900"
                  }`}>
                    {isSelected ? "✓ Active Route" : `${t.viewRouteBtn} ➔`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Embedded Google Maps Canvas */}
      <div className="relative w-full h-[320px] sm:h-[350px] bg-stone-100">
        <iframe
          src={embedUrl}
          title={
            selectedBranchId
              ? `Google Maps route from ${applicantLabel} to ${branchName}`
              : `Google Maps overview of nearest banks in ${cleanBlock}`
          }
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Floating Quick Legend Badge */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md border border-[#d6c4b1] shadow-sm rounded-xl px-3 py-1.5 flex items-center gap-3 text-[11px] font-medium text-[#221a10] pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d95c2e] inline-block shadow-xs"></span>
            <span>{applicantLabel || t.youAreHere}</span>
          </div>

          <span className="text-stone-300">•</span>

          {selectedBranchId ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#15803d] inline-block shadow-xs"></span>
              <span className="font-semibold text-emerald-900">{branchName} (~{displayDist} km)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block shadow-xs"></span>
              <span>3 Nearest Banks Shown ({cleanBlock} Area)</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Service Route & Direction Banner */}
      <div className="px-4 py-2.5 bg-[#f6f9f6] border-t border-[#dcebdc] flex items-center justify-between text-xs text-[#1e4620]">
        {selectedBranchId ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-emerald-800">
                {branchName}
              </span>
              <span className="text-stone-400">•</span>
              <span className="text-[#3b5e3c] font-semibold">
                {t.directRoute} (~{displayDist} km)
              </span>
              <span className="hidden md:inline text-stone-400">•</span>
              <span className="hidden md:inline text-stone-600 font-mono text-[11px]">
                IFSC: {branchIfsc}
              </span>
              {selectedBranch?.afo_name && (
                <>
                  <span className="hidden lg:inline text-stone-400">•</span>
                  <span className="hidden lg:inline text-stone-600 text-[11px]">
                    AFO: {selectedBranch.afo_name}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedBranchId(null)}
                className="text-[11px] font-semibold text-[#845400] hover:underline cursor-pointer"
              >
                {t.allBanksBtn}
              </button>
              <a
                href={googleMapsNavUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#1b5e20] hover:text-[#0d3311] hover:underline flex items-center gap-1 text-xs"
              >
                <span>{t.getDirections}</span>
                <span>↗</span>
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-stone-600">
              <span className="font-medium">
                {t.clickPrompt}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (sortedBranches.length > 0) {
                  setSelectedBranchId(sortedBranches[0].id);
                }
              }}
              className="px-3 py-1 text-[11px] font-bold text-white bg-[#845400] hover:bg-[#6c4400] rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>{t.viewRouteBtn} to {sortedBranches[0]?.short_name || "Nearest Bank"}</span>
              <span>➔</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
